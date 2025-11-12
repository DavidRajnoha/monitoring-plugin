import './selectors';
import './commands/selector-commands';
import './commands/auth-commands';
import './commands/operator-commands';
import './commands/incident-commands';
import './commands/utility-commands';
import './incidents_prometheus_query_mocks';
import './commands/virtualization-commands';

export const checkErrors = () =>
  cy.window().then((win) => {
    assert.isTrue(!win.windowError, win.windowError);
  });

const consoleLogs: Array<{ type: string; message: string; timestamp: string }> = [];

Cypress.on('window:before:load', (win) => {
  const originalConsoleLog = win.console.log;
  const originalConsoleWarn = win.console.warn;
  const originalConsoleError = win.console.error;

  win.console.log = (...args) => {
    consoleLogs.push({
      type: 'log',
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
      timestamp: new Date().toISOString(),
    });
    originalConsoleLog.apply(win.console, args);
  };

  win.console.warn = (...args) => {
    consoleLogs.push({
      type: 'warn',
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
      timestamp: new Date().toISOString(),
    });
    originalConsoleWarn.apply(win.console, args);
  };

  win.console.error = (...args) => {
    consoleLogs.push({
      type: 'error',
      message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
      timestamp: new Date().toISOString(),
    });
    originalConsoleError.apply(win.console, args);
  };
});

afterEach(function() {
  if (this.currentTest.state === 'failed' || Cypress.env('SAVE_CONSOLE_LOGS')) {
    const testName = this.currentTest.fullTitle().replace(/[^a-z0-9]/gi, '_');
    const logFileName = `console-logs-${testName}-${Date.now()}.json`;
    
    cy.writeFile(`cypress/logs/${logFileName}`, {
      test: this.currentTest.fullTitle(),
      state: this.currentTest.state,
      logs: consoleLogs,
    });
    
    cy.log(`Console logs saved to cypress/logs/${logFileName}`);
  }
  
  consoleLogs.length = 0;
});

  // Ignore benign ResizeObserver errors globally so they don't fail tests
// See: https://docs.cypress.io/api/cypress-api/catalog-of-events#Uncaught-Exceptions
Cypress.on('uncaught:exception', (err) => {
  const message = err?.message || String(err || '');
  
  consoleLogs.push({
    type: 'uncaught-exception',
    message: `${message}\n${err?.stack || ''}`,
    timestamp: new Date().toISOString(),
  });
  
  if (
    message.includes('ResizeObserver loop limit exceeded') ||
    message.includes('ResizeObserver loop completed with undelivered notifications') ||
    message.includes('ResizeObserver') ||
    message.includes('Cannot read properties of undefined')
  ) {
    return false;
  }
  // allow other errors to fail the test
});
