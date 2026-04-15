# Agentic Fix Proposals — Overview

Test fix branches produced by autonomous iteration loops (CI-based and local sandbox).
Each branch contains **only fix commits** rebased onto `upstream/main` — no infrastructure,
skill definitions, or iteration tooling.

## How to use

1. Review each branch independently
2. Cherry-pick or merge the fixes you want into your target branch
3. Branches are independent — no ordering dependency between them

---

## Branch Index

### 1. `FIX-PROPOSAL-AGENTIC/2026-04-15/incident-e2e-stability`

**Origin:** CI Loop 1 on PR #860 (2026-03-23), with OOM/timeout fixes from CI Loop 2
(2026-04-02 to 2026-04-09). Manually extracted and re-committed cleanly onto `upstream/main`.

**What it fixes:** xfail exclusions for known-broken tests, Chrome OOM crash in long e2e
lifecycle test, alert firing timeout too short for CI environments.

| Commit | Description |
|--------|-------------|
| `b5695fa` | Exclude `@xfail` tests from CI incident commands |
| `90fd82c` | Exclude `@xfail` tooltip boundary test from CI |
| `4447e26` | Prevent Chrome OOM in e2e incident lifecycle test |
| `f332eba` | Increase Phase 1 alert firing timeout to 20 minutes |

---

### 2. `FIX-PROPOSAL-AGENTIC/2026-04-02/ci-oom-search-loop`

**Origin:** CI Loop 2 on PR #860 (2026-04-02 to 2026-04-09). Three progressive fixes
targeting the incident search loop's memory exhaustion problem in Prow CI.

**What it fixes:** Chrome OOM during the incident search loop caused by accumulating DOM
snapshots and long-running test hangs.

| Commit | Description |
|--------|-------------|
| `82d1212` | Force page reload in search loop to prevent OOM in CI |
| `a1c1730` | Add hard timeout safety net to prevent 2h+ hang in CI |
| `1b2d8d2` | Suppress Cypress DOM snapshots during search loop to prevent OOM |

---

### 3. `FIX-PROPOSAL-AGENTIC/2026-04-15/plugin-warmup`

**Origin:** Local sandbox iteration loop (2026-04-15). Extracted from the local iteration
run's output — warm-up pattern and missing fixture.

**What it fixes:** Plugin loading race condition where tests start before the dynamic plugin
is fully loaded, causing flaky failures in regression tests. Also adds a missing fixture file.

| Commit | Description |
|--------|-------------|
| `c8deafb` | Add plugin warm-up to reg/03, reg/04, reg/05 `before()` hooks |
| `eb09dd3` | Add robust `warmUpForPlugin()` to page object for plugin loading race |
| `1921e1a` | Add missing `silenced-and-firing-mixed-severity` fixture |

---

### 4. `FIX-PROPOSAL-AGENTIC/2026-04-15/summary`

**Origin:** Local sandbox iteration loop (2026-04-15). Raw, unfiltered output of the
`/iterate-incident-tests` skill — 28 commits including fixes, infrastructure, docs,
and stability ledger updates. Preserved for analysis of the full iteration flow.

**Note:** This is NOT a clean fix branch. It contains the complete iteration output
including non-fix commits. Use branches 1–3 above for cherry-picking fixes.
This branch is useful for reviewing the iteration process and understanding the
full context of how fixes were discovered and validated.

28 commits above `upstream/main` (see `git log upstream/main..FIX-PROPOSAL-AGENTIC/2026-04-15/summary`).

---

## Iteration Loop History

### CI Loop 1 — PR #860 (2026-03-23)

- **Skill:** `/iterate-ci-flaky`
- **Environment:** Prow CI via PR #860
- **Result:** 1 fix commit (xfail exclusions), then branch was force-push reset
- **Fixes extracted to:** Branch #1 (`incident-e2e-stability`, commits `b5695fa`, `90fd82c`)

### CI Loop 2 — PR #860 (2026-04-02 to 2026-04-09)

- **Skill:** `/iterate-ci-flaky`
- **Environment:** Prow CI via PR #860 (after force-push reset)
- **Result:** 3 OOM fix commits over ~1 week of iteration
- **Fixes extracted to:** Branch #2 (`ci-oom-search-loop`) and Branch #1 (`incident-e2e-stability`, commits `4447e26`, `f332eba`)

### Local Loop — Docker Sandbox (2026-04-15)

- **Skill:** `/iterate-incident-tests`
- **Environment:** Docker sandbox with real OCP cluster access
- **Result:** Plugin warm-up pattern discovered, fixture added, 7 consecutive green runs
- **Fixes extracted to:** Branch #3 (`plugin-warmup`)
- **Raw output preserved in:** Branch #4 (`summary`)
