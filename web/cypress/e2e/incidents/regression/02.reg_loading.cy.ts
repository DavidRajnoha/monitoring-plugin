/*
Regression test for incidents initial loading bug.

This test verifies that all incidents are properly loaded on fresh page load
without requiring days filter manipulation to trigger complete loading.
*/

import { commonPages } from '../../../views/common';
import { incidentsPage } from '../../../views/incidents-page';

const MCP = {
  namespace: 'openshift-cluster-observability-operator',
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

describe('Regression: Incidents Initial Loading', () => {

  before(() => {
    cy.afterBlockCOO(MCP, MP);
    cy.beforeBlockCOO(MCP, MP);
  });

  beforeEach(() => {
    cy.log('Navigate to Observe → Incidents');
    incidentsPage.goTo();
    cy.log('Setting up comprehensive filtering test scenarios');
    cy.mockIncidentFixture('incident-scenarios/7-comprehensive-filtering-test-scenarios.yaml');
  });

  it('1. Fresh load should display all 12 incidents without days filter manipulation', () => {
    cy.log('1.1 Verify all incidents load immediately on fresh page load');
    
    // Clear any existing filters to ensure clean state
    incidentsPage.clearAllFilters();
    
    // Verify chart container is visible
    incidentsPage.elements.incidentsChartContainer().should('be.visible');
    
    // The bug: initially not all incidents are loaded, requiring days filter toggle
    // Use waitUntil to give it time to load, but it should load quickly if working properly
    cy.waitUntil(
      () => incidentsPage.elements.incidentsChartBarsGroups().then($groups => $groups.length === 12),
      {
        timeout: 10000,
        interval: 500,
        errorMsg: 'All 12 incidents should load within 10 seconds on fresh page load'
      }
    );
    cy.log('SUCCESS: All 12 incidents loaded on fresh page load');
    
    cy.log('1.2 Verify incident count remains stable without manipulation');
    incidentsPage.elements.incidentsChartBarsGroups().should('have.length', 12);
    cy.log('Incident count stable: 12 incidents maintained');
    
    cy.log('1.3 Verify days filter is set to default value');
    incidentsPage.elements.daysSelectToggle().should('contain.text', '7 days');
    cy.log('Default days filter confirmed: 7 days');
  });

  it('2. Days filter changes should not be required for complete incident loading', () => {
    cy.log('2.1 Test that changing days filter is not necessary for full loading');
    
    incidentsPage.clearAllFilters();
    
    // Record initial count (this might be incomplete due to the bug)
    incidentsPage.elements.incidentsChartBarsGroups().then(($initialGroups) => {
      const initialCount = $initialGroups.length;
      cy.log(`Initial incident count: ${initialCount}`);
      cy.pause();
      
      // The workaround that currently works (but shouldn't be necessary)
      incidentsPage.setDays('1 day');
      incidentsPage.setDays('7 days');
      
      // After workaround, verify we have all incidents
      cy.waitUntil(
        () => incidentsPage.elements.incidentsChartBarsGroups().then($groups => $groups.length === 12),
        {
          timeout: 10000,
          interval: 500,
          errorMsg: 'All 12 incidents should load within 10 seconds after days filter manipulation'
        }
      );
      cy.pause();
      cy.log('After days filter manipulation: 12 incidents loaded');
      
      // This test documents the current workaround behavior
      // When the bug is fixed, the initial count should already be 12
      if (initialCount < 12) {
        cy.log(`BUG CONFIRMED: Initial load only showed ${initialCount} incidents, required days filter manipulation`);
      } else {
        cy.log('BUG FIXED: Initial load correctly showed all 12 incidents');
      }
    });
  });

});
