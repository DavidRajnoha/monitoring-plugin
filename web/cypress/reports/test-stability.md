# Test Stability Ledger

Tracks incident detection test stability across local and CI iteration runs. Updated automatically by `/iterate-incident-tests` and `/iterate-ci-flaky`.

## How to Read

- **Pass rate**: percentage across all recorded runs (local + CI combined)
- **Trend**: direction over last 3 runs
- **Last failure**: most recent failure reason and which run it occurred in
- **Fixed by**: commit that resolved the issue (if applicable)

## Current Status

| Test | Pass Rate | Trend | Runs | Last Failure | Fixed By |
|------|-----------|-------|------|-------------|----------|
| BVT: Incidents - e2e > 1. Admin perspective lifecycle | 0% | stable | 2 | INFRA: alert not firing within 20 min on fresh cluster | — |
| BVT: Incidents - UI > 1. Toolbar and charts toggle | 100% | stable | 2 | — | — |
| BVT: Incidents - UI > 2. Days filter | 100% | stable | 2 | — | — |
| BVT: Incidents - UI > 3. Critical filter | 100% | stable | 2 | — | — |
| BVT: Incidents - UI > 4. Charts and alerts empty state | 100% | stable | 2 | — | — |
| BVT: Incidents - UI > 5. Traverse Incident Table | 100% | stable | 2 | — | — |
| Incidents - Mocking Examples > 1. Mock silenced and firing mixed severity | 50% → 100% | improving | 2 | Run 1: FIXTURE_ISSUE (missing silenced-and-firing-mixed-severity.yaml) | 57bf4e5 |
| Incidents - Mocking Examples > 2. Mock healthy cluster from fixture | 100% | stable | 2 | — | — |
| Incidents - Mocking Examples > 3. Mock single critical and warning | 100% | stable | 2 | — | — |
| Incidents - Mocking Examples > 4. Mock multi-incidents resolved and firing | 100% | stable | 2 | — | — |
| Incidents - Mocking Examples > 5. Mock multi-severity overlapping | 100% | stable | 2 | — | — |
| Incidents - Mocking Examples > 6. Mock escalating severity alerts | 100% | stable | 2 | — | — |
| Incidents - Mocking Examples > 7. Mock empty incident state | 100% | stable | 2 | — | — |
| Regression: Incidents Filtering > 1. Severity filtering | 100% | stable | 2 | — | — |
| Regression: Incidents Filtering > 2. Chart interaction with active filters | 100% | stable | 2 | — | — |
| Regression: Charts UI > Tooltip positioning and content validation | 0% → 100% | improving | 2 | Run 1: PAGE_OBJECT_GAP (monitoring plugin not loaded before beforeEach) | 57bf4e5 |
| Regression: Charts UI > Bar sorting, visibility, and filtering | 0% → 100% | improving | 2 | Run 1: PAGE_OBJECT_GAP (monitoring plugin not loaded before beforeEach) | 57bf4e5 |
| Regression: Charts UI > Date and time display validation | 0% → 100% | improving | 2 | Run 1: PAGE_OBJECT_GAP (monitoring plugin not loaded before beforeEach) | 57bf4e5 |
| Regression: Charts UI > Very short duration incidents visible | 0% → 100% | improving | 2 | Run 1: PAGE_OBJECT_GAP (monitoring plugin not loaded before beforeEach) | 57bf4e5 |
| Regression: Mixed Severity > 1. Tooltip End times at severity boundaries | 100% | stable | 2 | — | — |
| Regression: Mixed Severity > 2. Start times match consecutive boundaries | 0% | stable | 2 | REAL_REGRESSION OU-1221: second Start 2 min behind first End (e.g. 6:08 AM ≠ 6:10 AM) | — |
| Regression: Time-Based Alert Resolution > 1. Alert not marked resolved after time | 0% | stable | 2 | INFRA: requires continuously firing alerts; fresh cluster has none | — |
| Regression: API Calls (03.reg_api_calls) — all tests | N/A | unknown | 0 | Not yet run (excluded by @e2e-real filter bug in runs 1-2; cluster expired before run 3) | — |
| Regression: Redux State (04.reg_redux_effects) — all tests | N/A | unknown | 0 | Not yet run (excluded by @e2e-real filter bug in runs 1-2; cluster expired before run 3) | — |
| Regression: Stress Testing UI (05.reg_stress_testing_ui) — all tests | N/A | unknown | 0 | Not yet run (excluded by @e2e-real filter bug in runs 1-2; cluster expired before run 3) | — |

## Run History

### Run Log

| # | Date | Type | Branch | Tests | Passed | Failed | Flaky | Commit |
|---|------|------|--------|-------|--------|--------|-------|--------|
| 1 | 2026-04-15 | local | test/incident-robustness-2026-04-15 | 24 (partial) | 13 | 11 | 0 | pre-fix |
| 2 | 2026-04-15 | local | test/incident-robustness-2026-04-15 | 22 (partial) | 20 | 2 | 0 | 57bf4e5 |

**Notes:**
- Run 1: Used `--env grep=...` (text-based) instead of `--env grepTags=...` (tag-based). All 10 specs ran including @e2e-real ones. 24 tests from 7 confirmed specs.
- Run 2: Same grep bug. Stopped after spec 7 of 10 (cluster time constraints). Specs 03/04/05 regression not reached. 22 tests from 7 confirmed specs.
- Run 3 attempt (2026-04-15): Switched to `grepTags` — correctly excluded @e2e-real specs. Cluster expired before any tests ran.
- Specs `regression/03.reg_api_calls`, `regression/04.reg_redux_effects`, `regression/05.reg_stress_testing_ui` have **never been run** in this session.
- Known blocking issue for @e2e-real tests: fresh cluster-bot clusters take >20 min for Prometheus alerts to fire; these tests require a pre-warmed cluster.

<!-- STABILITY_DATA_START
This section is machine-readable. Do not edit manually.

{
  "tests": {
    "BVT: Incidents - e2e > 1. Admin perspective - Incidents page - Incident with custom alert lifecycle": {
      "results": ["fail", "fail"],
      "last_failure_reason": "INFRA: Alert not firing on cluster within 20 minutes",
      "last_failure_date": "2026-04-15",
      "fixed_by": null
    },
    "BVT: Incidents - UI > 1. Admin perspective - Incidents page - Toolbar and charts toggle functionality": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 2. Admin perspective - Incidents page - Days filter functionality": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 3. Admin perspective - Incidents page - Critical filter functionality": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 4. Admin perspective - Incidents page - Charts and alerts empty state": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 5. Admin perspective - Incidents page - Traverse Incident Table": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Incidents - Mocking Examples > 1. Mock silenced and firing incidents with mixed severity": {
      "results": ["fail", "pass"],
      "last_failure_reason": "FIXTURE_ISSUE: silenced-and-firing-mixed-severity.yaml was missing",
      "last_failure_date": "2026-04-15",
      "fixed_by": "57bf4e5"
    },
    "Incidents - Mocking Examples > 2. Mock healthy cluster from fixture": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Incidents - Mocking Examples > 3. Mock single incident with critical and warning alerts": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Incidents - Mocking Examples > 4. Mock multi-incidents with resolved and firing alerts": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Incidents - Mocking Examples > 5. Mock multi-severity overlapping incidents": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Incidents - Mocking Examples > 6. Mock single incident with escalating severity alerts": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Incidents - Mocking Examples > 7. Mock empty incident state": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Incidents Filtering > 1. Severity filtering - Critical, Warning, Info": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Incidents Filtering > 2. Chart interaction with active filters": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Charts UI - Comprehensive > Tooltip positioning and content validation": {
      "results": ["fail", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "57bf4e5"
    },
    "Regression: Charts UI - Comprehensive > Bar sorting, visibility, and filtering": {
      "results": ["fail", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "57bf4e5"
    },
    "Regression: Charts UI - Comprehensive > Date and time display validation": {
      "results": ["fail", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "57bf4e5"
    },
    "Regression: Charts UI - Comprehensive > Very short duration incidents are visible and selectable": {
      "results": ["fail", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "57bf4e5"
    },
    "Regression: Mixed Severity Interval Boundary Times > 1. Tooltip End times at severity boundaries show 5-minute rounded values": {
      "results": ["pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Mixed Severity Interval Boundary Times > 2. Start times match between incident tooltip, alert tooltip, and table; consecutive boundaries align": {
      "results": ["fail", "fail"],
      "last_failure_reason": "REAL_REGRESSION OU-1221: second Start (e.g. 6:08 AM) does not equal first End (e.g. 6:10 AM) — 2-minute gap",
      "last_failure_date": "2026-04-15",
      "fixed_by": null
    },
    "Regression: Time-Based Alert Resolution > 1. Section 3.3 - Alert not incorrectly marked as resolved after time passes": {
      "results": ["fail", "fail"],
      "last_failure_reason": "INFRA: requires continuously firing alerts; fresh cluster-bot has no firing alerts",
      "last_failure_date": "2026-04-15",
      "fixed_by": null
    }
  },
  "runs": [
    {
      "date": "2026-04-15",
      "type": "local",
      "branch": "test/incident-robustness-2026-04-15",
      "total": 24,
      "passed": 13,
      "failed": 11,
      "flaky": 0,
      "commit": "pre-57bf4e5",
      "notes": "grep vs grepTags bug caused all specs to run including @e2e-real; 3 regression specs (03/04/05) result unknown"
    },
    {
      "date": "2026-04-15",
      "type": "local",
      "branch": "test/incident-robustness-2026-04-15",
      "total": 22,
      "passed": 20,
      "failed": 2,
      "flaky": 0,
      "commit": "57bf4e5",
      "notes": "Fixes applied: fixture, plugin warm-up, @e2e-real it-block tags. grep bug still present but run stopped after 7/10 specs. Cluster expired."
    }
  ]
}

STABILITY_DATA_END -->
