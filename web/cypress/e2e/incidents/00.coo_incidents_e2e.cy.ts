/*
The test verifies the whole lifecycle of the Incident feature, without any external dependencies.
The run time can be 15 - 20 minutes. (Waiting untill the incident detection captures the new alert)
*/
import { commonPages } from '../../views/common';
import { incidentsPage } from '../../views/incidents-page';

// Set constants for the operators that need to be installed for tests.
const MCP = {
  namespace: Cypress.env('COO_NAMESPACE'),
  packageName: 'cluster-observability-operator',
  operatorName: 'Cluster Observability Operator',
  config: {
    kind: 'UIPlugin',
    name: 'monitoring',
  },
};

const MP = {
  namespace: 'openshift-monitoring',
  operatorName: 'Cluster Monitoring Operator',
};

describe('BVT: Incidents - e2e', { tags: ['@smoke', '@slow', '@incidents', '@e2e-real'] }, () => {
  let currentAlertName: string;

  before(() => {
    cy.beforeBlockCOO(MCP, MP, { dashboards: false, troubleshootingPanel: false });
    
    cy.cleanupIncidentPrometheusRules(); 

    // Create the alert and capture the random name
    cy.createKubePodCrashLoopingAlert().then((alertName) => {
      currentAlertName = alertName;
      cy.log(`Test will look for alert: ${currentAlertName}`);
    });
  });

  it('1. Admin perspective - Incidents page - Incident with custom alert lifecycle', () => {
    cy.transformMetrics();
    cy.log('1.1 Navigate to Incidents page and clear filters');
    incidentsPage.goTo();
    incidentsPage.clearAllFilters();

    cy.log('1.2 Wait for incident with custom alert to appear');
    // Use a 3-minute interval instead of 1-minute to reduce the number of
    // heavy UI traversals. Each findIncidentWithAlert call generates hundreds
    // of Cypress commands (clicking bars, expanding rows, checking text).
    // With 1-min interval the command log grew unbounded over 30 iterations
    // causing Chrome OOM (exit code 137). With 3-min interval we get ~10
    // iterations max, keeping memory within container limits.
    cy.waitUntil(
      () => incidentsPage.findIncidentWithAlert(currentAlertName),
      {
        interval: 3 * 60_000,
        timeout: 30 * 60_000,
      }
    );

    cy.log('1.3 Verify custom alert appears in alerts table');
    incidentsPage
      .elements
      .incidentsTable()
      .contains(currentAlertName)
      .should('exist');
  });
});