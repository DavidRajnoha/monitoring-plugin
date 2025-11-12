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
  namespace: Cypress.env('COO_NAMESPACE'),
  operatorName: 'Cluster Monitoring Operator',
};

describe('BVT: Incidents - e2e', () => {
  let currentAlertName: string;

  before(() => {
    cy.beforeBlockCOO(MCP, MP);
    
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
    
    cy.log('1.1.1 Verify incidents feature is enabled via features API');
    cy.request({
      url: '/api/proxy/plugin/monitoring-console-plugin/backend/features',
      failOnStatusCode: false,
    }).then((response) => {
      cy.log(`Features API status: ${response.status}`);
      cy.log(`Features API response: ${JSON.stringify(response.body)}`);
      if (response.status === 200 && response.body) {
        expect(response.body.incidents).to.equal(true, 'Incidents feature should be enabled');
      } else {
        cy.log('WARNING: Features API not available or incidents not enabled');
      }
    });
    
    cy.log('1.1.2 Check for any API errors or failed requests');
    cy.request({
      url: '/api/prometheus/api/v1/query?query=cluster_health_components_map',
      failOnStatusCode: false,
    }).then((response) => {
      cy.log(`Prometheus cluster_health_components_map query status: ${response.status}`);
      if (response.status === 200 && response.body) {
        cy.log(`Number of results: ${response.body.data?.result?.length || 0}`);
        if (response.body.data?.result?.length > 0) {
          cy.log(`Sample result: ${JSON.stringify(response.body.data.result[0])}`);
        }
      }
    });
    
    incidentsPage.clearAllFilters();
    
    const intervalMs = 60_000;
    const maxMinutes = 60; 

    cy.log('1.2 Wait for incident with custom alert to appear');
    cy.waitUntil(
      () => incidentsPage.findIncidentWithAlert(currentAlertName),
      { 
        interval: intervalMs, 
        timeout: maxMinutes * intervalMs,
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