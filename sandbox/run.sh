#!/bin/bash
set -euo pipefail

# Docker-based sandbox for Claude Code with filesystem isolation
# See docs/docker-sandbox-blast-radius.md for security analysis

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

# --- Create a git worktree for isolation ---
# Clean up any stale worktrees from previous crashed runs
git -C "$PROJECT_ROOT" worktree prune 2>/dev/null

WORKTREE_DIR=$(mktemp -d /tmp/claude-worktree-XXXXXX)
CURRENT_BRANCH=$(git -C "$PROJECT_ROOT" branch --show-current)
echo "Creating worktree from branch '$CURRENT_BRANCH' at $WORKTREE_DIR..."
# Use detached HEAD to avoid "branch already checked out" errors
git -C "$PROJECT_ROOT" worktree add --detach "$WORKTREE_DIR" "$CURRENT_BRANCH"

cleanup() {
    echo "Cleaning up worktree..."
    git -C "$PROJECT_ROOT" worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
    echo "Done."
}
trap cleanup EXIT

# --- Run the container ---
echo ""
echo "=== Sandbox Configuration ==="
echo "  Project:     $PROJECT_ROOT"
echo "  Branch:      $CURRENT_BRANCH"
echo "  Worktree:    $WORKTREE_DIR"
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
    -v "${WORKTREE_DIR}:/sandbox" \
    -v "${ADC_PATH}:/tmp/adc.json:ro" \
    ${KUBECONFIG_MOUNT:-} \
    -e "GOOGLE_APPLICATION_CREDENTIALS=/tmp/adc.json" \
    -e "CLAUDE_CODE_USE_VERTEX=1" \
    -e "ANTHROPIC_VERTEX_PROJECT_ID=$VERTEX_PROJECT" \
    -e "CLOUD_ML_REGION=$VERTEX_REGION" \
    -e "KUBECONFIG=/tmp/kubeconfig" \
    -e "GITHUB_TOKEN=${GITHUB_TOKEN:-}" \
    "$IMAGE_NAME"
