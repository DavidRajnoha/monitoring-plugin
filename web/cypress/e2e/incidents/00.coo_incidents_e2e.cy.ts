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

    const intervalMs = 60_000;
    const maxMinutes = 30;

    cy.log('1.2 Wait for alert to start firing on cluster');
    // Phase 1: Poll the Thanos Querier API to check if the alert is actually
    // firing. This is lightweight — a single cy.exec per iteration with no
    // Chrome DOM interaction, preventing the OOM (exit code 137) caused by
    // repeated heavy UI traversals accumulating Cypress command log snapshots.
    const kubeconfigPath = Cypress.env('KUBECONFIG_PATH');
    cy.waitUntil(
      () => cy.exec(
        `oc get --raw '/api/v1/namespaces/openshift-monitoring/services/thanos-querier:web/proxy/api/v1/rules?type=alert' --kubeconfig ${kubeconfigPath}`,
        { failOnNonZeroExit: false, timeout: 20000 },
      ).then((result) => result.code === 0 && result.stdout.includes(currentAlertName)),
      {
        interval: 30_000,
        timeout: 20 * 60_000,
        errorMsg: `Alert ${currentAlertName} not firing on cluster within 20 minutes`,
      }
    );

    cy.log('1.2.1 Wait for incident detection to pick up the firing alert');
    // Phase 2: Alert is confirmed firing. Wait for incident detection to group
    // it into an incident. Uses the UI traversal but with fewer iterations
    // since incident detection typically takes 5-10 minutes after alert fires.
    cy.waitUntil(
      () => incidentsPage.findIncidentWithAlert(currentAlertName),
      {
        interval: 2 * intervalMs,
        timeout: 15 * intervalMs,
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