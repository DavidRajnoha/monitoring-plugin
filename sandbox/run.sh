#!/bin/bash
set -euo pipefail

# Docker-based sandbox for Claude Code with filesystem isolation
# See docs/agentic-development/architecture/security/docker-sandbox-blast-radius.md for security analysis

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="claude-sandbox"
CONTAINER_NAME="claude-sandbox-$$"

# --- Configuration ---
# Override these with environment variables if needed
ADC_PATH="${GOOGLE_APPLICATION_CREDENTIALS:-$HOME/.config/gcloud/application_default_credentials.json}"
KUBECONFIG_PATH="${KUBECONFIG:-$HOME/.kube/config}"
VERTEX_PROJECT="${ANTHROPIC_VERTEX_PROJECT_ID:-itpc-gcp-hcm-pe-eng-claude}"
VERTEX_REGION="${CLOUD_ML_REGION:-us-east5}"

# --- Validation ---
if [ ! -f "$ADC_PATH" ]; then
    echo "ERROR: GCP ADC credentials not found at $ADC_PATH"
    echo "Run: gcloud auth application-default login"
    exit 1
fi

if [ ! -f "$KUBECONFIG_PATH" ]; then
    echo "WARNING: kubeconfig not found at $KUBECONFIG_PATH — oc commands won't work"
    KUBECONFIG_MOUNT=""
else
    KUBECONFIG_MOUNT="-v ${KUBECONFIG_PATH}:/tmp/kubeconfig:ro"
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
    # Try to get token from gh CLI
    GITHUB_TOKEN=$(gh auth token 2>/dev/null || true)
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "WARNING: No GITHUB_TOKEN set and gh auth not configured — git push/PR won't work"
    fi
fi

# --- Build image if needed ---
echo "Building sandbox image..."
docker build -t "$IMAGE_NAME" "$SCRIPT_DIR" --build-arg "HOST_UID=$(id -u)" --quiet

# --- Create an isolated copy of the repo ---
SANDBOX_DIR=$(mktemp -d /tmp/claude-sandbox-XXXXXX)
CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current)
REMOTE_URL=$(git -C "$PROJECT_ROOT" remote get-url origin 2>/dev/null || true)

echo "Cloning branch '$CURRENT_BRANCH' into $SANDBOX_DIR..."
git clone --single-branch --branch "$CURRENT_BRANCH" --depth 50 "$PROJECT_ROOT" "$SANDBOX_DIR"

# Set the remote to the actual upstream so push/pull work inside the container
if [ -n "$REMOTE_URL" ]; then
    git -C "$SANDBOX_DIR" remote set-url origin "$REMOTE_URL"
fi

# --- Run the container ---
echo ""
echo "=== Sandbox Configuration ==="
echo "  Project:     $PROJECT_ROOT"
echo "  Branch:      $CURRENT_BRANCH"
echo "  Sandbox:     $SANDBOX_DIR"
echo "  Vertex AI:   $VERTEX_PROJECT ($VERTEX_REGION)"
echo "  GitHub:      $([ -n "${GITHUB_TOKEN:-}" ] && echo 'token set' || echo 'NOT SET')"
echo "  Kubeconfig:  $([ -n "${KUBECONFIG_MOUNT:-}" ] && echo 'mounted (read-only)' || echo 'NOT SET')"
echo ""
echo "  Filesystem:  Only worktree is writable. Host is isolated."
echo "  See docs/docker-sandbox-blast-radius.md for full security analysis."
echo "=============================="
echo ""

docker run -it --rm \
    --name "$CONTAINER_NAME" \
    -v "${SANDBOX_DIR}:/sandbox" \
    -v "${ADC_PATH}:/tmp/adc.json:ro" \
    ${KUBECONFIG_MOUNT:-} \
    -e "GOOGLE_APPLICATION_CREDENTIALS=/tmp/adc.json" \
    -e "CLAUDE_CODE_USE_VERTEX=1" \
    -e "ANTHROPIC_VERTEX_PROJECT_ID=$VERTEX_PROJECT" \
    -e "CLOUD_ML_REGION=$VERTEX_REGION" \
    -e "KUBECONFIG=/tmp/kubeconfig" \
    -e "GITHUB_TOKEN=${GITHUB_TOKEN:-}" \
    "$IMAGE_NAME"
