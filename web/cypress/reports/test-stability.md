# Test Stability Ledger

Tracks incident detection test stability across local and CI iteration runs. Updated automatically by `/cypress:test-iteration:iterate-incident-tests` and `/cypress:test-iteration:iterate-ci-flaky`.

## How to Read

- **Pass rate**: percentage across all recorded runs (local + CI combined)
- **Trend**: direction over last 3 runs
- **Last failure**: most recent failure reason and which run it occurred in
- **Fixed by**: commit that resolved the issue (if applicable)

## Current Status

| Test | Pass Rate | Trend | Runs | Last Failure | Fixed By |
|------|-----------|-------|------|-------------|----------|
| BVT: Incidents - 1.1 Incidents page renders correctly | 100% | stable | 3 | — | — |
| BVT: Incidents - 1.2 Incidents chart renders with bars | 100% | stable | 3 | — | — |
| BVT: Incidents - 1.3 Incidents table renders with rows | 100% | stable | 3 | — | — |
| BVT: Incidents - 1.4 Incidents page filters by days | 100% | stable | 3 | — | — |
| BVT: Incidents - 1.5 Incidents page displays alert details | 100% | stable | 3 | — | — |
| Regression: Filtering - 1.1 Filter by severity | 100% | stable | 3 | — | — |
| Regression: Filtering - 1.2 Filter by state | 100% | stable | 3 | — | — |
| Regression: Charts UI - Comprehensive - 2.1 Chart renders with correct bar count | 100% | stable | 3 | — | — |
| Regression: Charts UI - Comprehensive - 2.2 Chart bars have correct severity colors | 100% | stable | 3 | — | — |
| Regression: Charts UI - Comprehensive - 2.3 Toggle charts button hides/shows chart | 100% | stable | 3 | — | — |
| Regression: Charts UI - Comprehensive - 2.4 Incident selection updates alert chart | 100% | stable | 3 | — | — |
| Regression: Silences Not Applied Correctly - 3.1 Silenced alerts not shown as active | 100% | stable | 3 | — | — |
| Regression: Silences Not Applied Correctly - 3.2 Mixed silenced and firing alerts | 100% | stable | 3 | — | — |
| Regression: Redux State Management - 4.1 Redux state updates on filter change | 100% | stable | 3 | — | — |
| Regression: Redux State Management - 4.2 Redux state persists across navigation | 100% | stable | 3 | — | — |
| Regression: Redux State Management - 4.3 Days selector updates redux state | 100% | stable | 3 | — | — |
| Regression: Stress Testing UI - 5.1 No excessive padding between chart top and alert bars | 100% | stable | 3 | — | — |

## Run History

### Run Log

| # | Date | Type | Branch | Tests | Passed | Failed | Flaky | Commit |
|---|------|------|--------|-------|--------|--------|-------|--------|
| 1 | 2026-04-16 | local | fix/consolidated-incident-tests-stability | 17 | 17 | 0 | 0 | 567c2e7 |
| 2 | 2026-04-16 | local | fix/consolidated-incident-tests-stability | 17 | 17 | 0 | 0 | 567c2e7 |
| 3 | 2026-04-16 | local | fix/consolidated-incident-tests-stability | 17 | 17 | 0 | 0 | 567c2e7 |

<!-- STABILITY_DATA_START
This section is machine-readable. Do not edit manually.

{
  "tests": {
    "BVT: Incidents - e2e 1.1 Incidents page renders correctly": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - e2e 1.2 Incidents chart renders with bars": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - e2e 1.3 Incidents table renders with rows": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - e2e 1.4 Incidents page filters by days": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "BVT: Incidents - e2e 1.5 Incidents page displays alert details": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Filtering 1.1 Filter by severity": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Filtering 1.2 Filter by state": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Charts UI - Comprehensive 2.1 Chart renders with correct bar count": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Charts UI - Comprehensive 2.2 Chart bars have correct severity colors": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Charts UI - Comprehensive 2.3 Toggle charts button hides/shows chart": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Charts UI - Comprehensive 2.4 Incident selection updates alert chart": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Silences Not Applied Correctly 3.1 Silenced alerts not shown as active": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Silences Not Applied Correctly 3.2 Mixed silenced and firing alerts": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Redux State Management 4.1 Redux state updates on filter change": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Redux State Management 4.2 Redux state persists across navigation": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Redux State Management 4.3 Days selector updates redux state": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    },
    "Regression: Stress Testing UI 5.1 No excessive padding between chart top and alert bars": {
      "results": ["pass", "pass", "pass"],
      "last_failure_reason": null,
      "last_failure_date": null,
      "fixed_by": null
    }
  },
  "runs": [
    {
      "date": "2026-04-16",
      "type": "local",
      "branch": "fix/consolidated-incident-tests-stability",
      "total": 17,
      "passed": 17,
      "failed": 0,
      "flaky": 0,
      "commit": "567c2e7"
    },
    {
      "date": "2026-04-16",
      "type": "local",
      "branch": "fix/consolidated-incident-tests-stability",
      "total": 17,
      "passed": 17,
      "failed": 0,
      "flaky": 0,
      "commit": "567c2e7"
    },
    {
      "date": "2026-04-16",
      "type": "local",
      "branch": "fix/consolidated-incident-tests-stability",
      "total": 17,
      "passed": 17,
      "failed": 0,
      "flaky": 0,
      "commit": "567c2e7"
    }
  ]
}

STABILITY_DATA_END -->
