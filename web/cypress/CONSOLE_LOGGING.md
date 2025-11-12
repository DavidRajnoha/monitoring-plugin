# Console Logging for CI Debugging

This document explains the console logging setup added to capture browser console logs during Cypress test runs, especially useful for debugging CI issues.

## What Was Added

### 1. Automatic Console Log Capture (`cypress/support/index.ts`)

The support file now captures all console messages (log, warn, error) and uncaught exceptions automatically during test runs.

**Features:**
- Captures `console.log()`, `console.warn()`, and `console.error()` messages
- Captures uncaught exceptions with stack traces
- Saves logs with timestamps
- Automatically saves logs when tests fail
- Can be configured to save logs for all tests (not just failed ones)

**Log files are saved to:** `cypress/logs/console-logs-{test-name}-{timestamp}.json`

### 2. Environment Variable Control

To save console logs for **all tests** (not just failures), set the environment variable:

```bash
CYPRESS_SAVE_CONSOLE_LOGS=true npm run cypress:run
```

Or in your CI configuration:

```yaml
env:
  CYPRESS_SAVE_CONSOLE_LOGS: "true"
```

### 3. Log File Format

Each log file contains:

```json
{
  "test": "Full test title",
  "state": "failed|passed",
  "logs": [
    {
      "type": "log|warn|error|uncaught-exception",
      "message": "Log message content",
      "timestamp": "2025-11-28T10:30:45.123Z"
    }
  ]
}
```

### 4. Enhanced Incidents Test Debugging

The `00.coo_incidents_e2e.cy.ts` test now includes:

1. **Features API Check:** Verifies that the incidents feature is enabled
   ```javascript
   GET /api/proxy/plugin/monitoring-console-plugin/backend/features
   ```

2. **Prometheus Data Check:** Directly queries Prometheus for `cluster_health_components_map`
   ```javascript
   GET /api/prometheus/api/v1/query?query=cluster_health_components_map
   ```

3. **Loading State Wait:** Ensures the page fully loads before proceeding

## Using Console Logs for Debugging

### In CI Environment

1. **Configure your CI to save Cypress artifacts:**

```yaml
# Example for GitHub Actions
- name: Save Cypress logs
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-console-logs
    path: web/cypress/logs/
    retention-days: 7
```

2. **Enable logging for all tests in CI:**

```yaml
env:
  CYPRESS_SAVE_CONSOLE_LOGS: "true"
```

### Locally

1. **Run tests with console logging enabled:**

```bash
cd web
CYPRESS_SAVE_CONSOLE_LOGS=true npm run cypress:run
```

2. **Check the logs:**

```bash
ls -la cypress/logs/
cat cypress/logs/console-logs-*.json
```

## Common Issues to Look For

When analyzing console logs for the incidents issue:

### 1. Feature Not Enabled
```json
{
  "type": "error",
  "message": "Failed to fetch features"
}
```
**Solution:** Check that the UIPlugin has `incidents.enabled: true`

### 2. Prometheus Query Failures
```json
{
  "type": "error",
  "message": "Failed to fetch incidents data"
}
```
**Solution:** Verify Prometheus is accessible and `cluster_health_components_map` metric exists

### 3. Plugin Loading Errors
```json
{
  "type": "uncaught-exception",
  "message": "Cannot read properties of undefined (reading 'plugins')"
}
```
**Solution:** Redux store may not be initialized properly

### 4. Network Errors
```json
{
  "type": "error",
  "message": "NetworkError when attempting to fetch resource"
}
```
**Solution:** Check plugin backend service and proxy configuration

## Additional Debugging

### Check Redux Store State

Add this to your test:

```javascript
cy.window().its('store').invoke('getState').then((state) => {
  cy.log('Redux state:', JSON.stringify(state));
});
```

### Intercept Network Requests

```javascript
cy.intercept('GET', '**/api/prometheus/api/v1/query_range*').as('incidentsQuery');
cy.wait('@incidentsQuery').then((interception) => {
  cy.log('Query URL:', interception.request.url);
  cy.log('Response:', JSON.stringify(interception.response.body));
});
```

## Troubleshooting

### Logs not being saved

1. Check that `cypress/logs/` directory exists
2. Verify write permissions
3. Check for TypeScript compilation errors

### Too many log files

The `cypress/logs/.gitignore` is configured to exclude all log files from git. To clean up:

```bash
rm -rf web/cypress/logs/*.json
```

### Large log files

If logs get too large, you can filter specific message types:

```javascript
// In cypress/support/index.ts, modify the capture logic:
if (args[0].includes('redux') || args[0].includes('incidents')) {
  consoleLogs.push({...});
}
```

## Next Steps for CI Debugging

1. **Enable console logging in CI** by setting `CYPRESS_SAVE_CONSOLE_LOGS=true`
2. **Run the failing test** and download the artifacts
3. **Analyze the console logs** looking for:
   - Feature API failures
   - Prometheus query errors  
   - Redux store issues
   - Network request failures
4. **Compare with local run** to identify CI-specific issues

The most likely causes for "no incidents showing in CI":
- ✅ Plugin backend not accessible
- ✅ Features API returning `incidents: false`
- ✅ Prometheus proxy not working
- ✅ Redux reducer not registered
- ✅ Console plugin not loaded properly

