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
| BVT: Incidents - e2e > 1. Admin perspective lifecycle | 0% | stable | 2 | INFRA: alert not firing within 20 min on fresh cluster (excluded by @e2e-real filter in runs 3-5) | — |
| BVT: Incidents - UI > 1. Toolbar and charts toggle | 100% | stable | 5 | — | — |
| BVT: Incidents - UI > 2. Days filter | 100% | stable | 5 | — | — |
| BVT: Incidents - UI > 3. Critical filter | 100% | stable | 5 | — | — |
| BVT: Incidents - UI > 4. Charts and alerts empty state | 100% | stable | 5 | — | — |
| BVT: Incidents - UI > 5. Traverse Incident Table | 100% | stable | 5 | — | — |
| Incidents - Mocking Examples > 1. Mock silenced and firing mixed severity | 50% | improving | 2 | Run 1: FIXTURE_ISSUE (missing silenced-and-firing-mixed-severity.yaml); excluded by @demo in runs 3-5 | 57bf4e5 |
| Incidents - Mocking Examples > 2. Mock healthy cluster from fixture | 100% | stable | 2 | excluded by @demo in runs 3-5 | — |
| Incidents - Mocking Examples > 3. Mock single critical and warning | 100% | stable | 2 | excluded by @demo in runs 3-5 | — |
| Incidents - Mocking Examples > 4. Mock multi-incidents resolved and firing | 100% | stable | 2 | excluded by @demo in runs 3-5 | — |
| Incidents - Mocking Examples > 5. Mock multi-severity overlapping | 100% | stable | 2 | excluded by @demo in runs 3-5 | — |
| Incidents - Mocking Examples > 6. Mock escalating severity alerts | 100% | stable | 2 | excluded by @demo in runs 3-5 | — |
| Incidents - Mocking Examples > 7. Mock empty incident state | 100% | stable | 2 | excluded by @demo in runs 3-5 | — |
| Regression: Incidents Filtering > 1. Severity filtering | 100% | stable | 5 | — | — |
| Regression: Incidents Filtering > 2. Chart interaction with active filters | 100% | stable | 5 | — | — |
| Regression: Charts UI > Tooltip positioning and content validation | 80% | improving | 5 | Run 1: PAGE_OBJECT_GAP (plugin warm-up race before beforeEach) | 57bf4e5, a1c1174 |
| Regression: Charts UI > Bar sorting, visibility, and filtering | 80% | improving | 5 | Run 1: PAGE_OBJECT_GAP (plugin warm-up race before beforeEach) | 57bf4e5, a1c1174 |
| Regression: Charts UI > Date and time display validation | 80% | improving | 5 | Run 1: PAGE_OBJECT_GAP (plugin warm-up race before beforeEach) | 57bf4e5, a1c1174 |
| Regression: Charts UI > Very short duration incidents visible | 80% | improving | 5 | Run 1: PAGE_OBJECT_GAP (plugin warm-up race before beforeEach) | 57bf4e5, a1c1174 |
| Regression: Mixed Severity > 1. Tooltip End times at severity boundaries | 100% | stable | 5 | — | — |
| Regression: Mixed Severity > 2. Start times at consecutive boundaries | 0% | stable | 5 | REAL_REGRESSION OU-1221: second Start 2 min behind first End (e.g. 6:08 AM ≠ 6:10 AM) | — |
| Regression: API Calls > Silence matching verification flow | 100% | stable | 3 | — | — |
| Regression: API Calls > Page displays access denied state (403) | 100% | stable | 3 | — | — |
| Regression: Redux Effects > 1. Fresh load displays all 12 incidents | 100% | stable | 3 | — | — |
| Regression: Redux Effects > 2. Dropdown closes after deselection | 100% | stable | 3 | — | — |
| Regression: Redux Effects > 3. Adding filter preserves incident ID filter | 100% | stable | 3 | — | — |
| Regression: Stress Testing UI > 5.1 No excessive padding (100/200/500 alerts) | 100% | stable | 3 | — | — |
| Regression: Time-Based Alert Resolution > 1. Alert not resolved after time | 0% | stable | 2 | INFRA: requires continuously firing alerts; excluded by @e2e-real in runs 3-5 | — |

## Run History

### Run Log

| # | Date | Type | Branch | Tests | Passed | Failed | Flaky | Commit |
|---|------|------|--------|-------|--------|--------|-------|--------|
| 1 | 2026-04-15 | local | test/incident-robustness-2026-04-15 | 24 (partial) | 13 | 11 | 0 | pre-fix |
| 2 | 2026-04-15 | local | test/incident-robustness-2026-04-15 | 22 (partial) | 20 | 2 | 0 | 57bf4e5 |
| 3 | 2026-04-15 | local | test/incident-robustness-2026-04-15 | 19 | 18 | 1 | 0 | a1c1174 |
| 4 | 2026-04-15 | local | test/incident-robustness-2026-04-15 | 19 | 18 | 1 | 0 | a1c1174 |
| 5 | 2026-04-15 | local | test/incident-robustness-2026-04-15 | 19 | 18 | 1 | 0 | a1c1174 |

**Notes:**
- Run 1: Used `--env grep=` (text-based) instead of `--env grepTags=` (tag-based). All 10 specs ran including @e2e-real ones. 24 tests from partial spec set.
- Run 2: Same grep bug. Stopped after 7/10 specs (cluster time constraints). Fixes applied: fixture (57bf4e5), plugin warm-up, @e2e-real it-block tags.
- Runs 3-5: Flakiness probe on fresh cluster-bot (2026-04-15). Switched to `grepTags` — correctly excluded @e2e-real and @demo specs. 7 specs, 19 tests per run. warmUpForPlugin() fix (a1c1174) enabled reg/03, reg/04, reg/05 to run for the first time. 18/19 stable; sole failure = OU-1221 (REAL_REGRESSION, expected). 0 flaky tests detected.
- BVT e2e lifecycle and Time-Based Alert Resolution are permanently excluded by @e2e-real filter — require pre-warmed cluster with firing alerts.
- Mocking Examples tests are permanently excluded by @demo filter in grepTags runs.

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
      "results": ["pass", "pass", "pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 2. Admin perspective - Incidents page - Days filter functionality": {
      "results": ["pass", "pass", "pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 3. Admin perspective - Incidents page - Critical filter functionality": {
      "results": ["pass", "pass", "pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 4. Admin perspective - Incidents page - Charts and alerts empty state": {
      "results": ["pass", "pass", "pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - UI > 5. Admin perspective - Incidents page - Traverse Incident Table": {
      "results": ["pass", "pass", "pass", "pass", "pass"],
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
      "results": ["pass", "pass", "pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Incidents Filtering > 2. Chart interaction with active filters": {
      "results": ["pass", "pass", "pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Charts UI - Comprehensive > Tooltip positioning and content validation": {
      "results": ["fail", "pass", "pass", "pass", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "a1c1174"
    },
    "Regression: Charts UI - Comprehensive > Bar sorting, visibility, and filtering": {
      "results": ["fail", "pass", "pass", "pass", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "a1c1174"
    },
    "Regression: Charts UI - Comprehensive > Date and time display validation": {
      "results": ["fail", "pass", "pass", "pass", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "a1c1174"
    },
    "Regression: Charts UI - Comprehensive > Very short duration incidents are visible and selectable": {
      "results": ["fail", "pass", "pass", "pass", "pass"],
      "last_failure_reason": "PAGE_OBJECT_GAP: monitoring-console-plugin not loaded before beforeEach(); Incidents tab not found",
      "last_failure_date": "2026-04-15",
      "fixed_by": "a1c1174"
    },
    "Regression: Mixed Severity Interval Boundary Times > 1. Tooltip End times at severity boundaries show 5-minute rounded values": {
      "results": ["pass", "pass", "pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Mixed Severity Interval Boundary Times > 2. Start times match between incident tooltip, alert tooltip, and table; consecutive boundaries align": {
      "results": ["fail", "fail", "fail", "fail", "fail"],
      "last_failure_reason": "REAL_REGRESSION OU-1221: second Start (e.g. 6:08 AM) does not equal first End (e.g. 6:10 AM) — 2-minute gap",
      "last_failure_date": "2026-04-15",
      "fixed_by": null
    },
    "Regression: Silences Not Applied Correctly > Silence matching verification flow - opacity and tooltip indicators": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Permission Denied Handling > Page displays access denied state when all API endpoints return 403 Forbidden": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Redux State Management > 1. Fresh load should display all 12 incidents without days filter manipulation": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Redux State Management > 2. Dropdown should close and not reposition after incident deselection": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Redux State Management > 3. Adding filter when incident selected should not remove the incident ID filter": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Stress Testing UI > 5.1 No excessive padding between chart top and alert bars for 100, 200, and 500 alerts": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
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
    },
    {
      "date": "2026-04-15",
      "type": "local",
      "branch": "test/incident-robustness-2026-04-15",
      "total": 19,
      "passed": 18,
      "failed": 1,
      "flaky": 0,
      "commit": "a1c1174",
      "notes": "Flakiness probe run 1/3. Fresh cluster-bot. grepTags correctly excluded @e2e-real and @demo. reg/03/04/05 ran for first time. Sole failure: OU-1221 (REAL_REGRESSION, expected)."
    },
    {
      "date": "2026-04-15",
      "type": "local",
      "branch": "test/incident-robustness-2026-04-15",
      "total": 19,
      "passed": 18,
      "failed": 1,
      "flaky": 0,
      "commit": "a1c1174",
      "notes": "Flakiness probe run 2/3. Identical result to run 3."
    },
    {
      "date": "2026-04-15",
      "type": "local",
      "branch": "test/incident-robustness-2026-04-15",
      "total": 19,
      "passed": 18,
      "failed": 1,
      "flaky": 0,
      "commit": "a1c1174",
      "notes": "Flakiness probe run 3/3. Identical result to runs 3-4. 0 flaky tests."
    }
  ]
}

STABILITY_DATA_END -->
