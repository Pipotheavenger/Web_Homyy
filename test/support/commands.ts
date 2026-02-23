/**
 * Custom Cypress commands
 * Combines authentication and performance measurement utilities
 */

import {
  loginAsUser,
  logout as authLogout,
} from './auth';

import {
  startPerformanceMonitoring as perfStart,
  waitForPageLoad as perfWaitForPageLoad,
  measureLoadTime as perfMeasureLoadTime,
  getNetworkStats as perfGetNetworkStats,
  getCoreWebVitals as perfGetCoreWebVitals,
  assertPerformanceThreshold as perfAssertPerformanceThreshold,
} from './performance';

// Authentication Commands

Cypress.Commands.add('loginAsClient', () => {
  loginAsUser('client');
});

Cypress.Commands.add('loginAsWorker', () => {
  loginAsUser('worker');
});

Cypress.Commands.add('loginAsAdmin', () => {
  loginAsUser('admin');
});

Cypress.Commands.add('logout', () => {
  authLogout();
});

// Performance Commands

Cypress.Commands.add('startPerformanceMonitoring', () => {
  perfStart();
});

Cypress.Commands.add('waitForPageLoad', (maxTime = 4000) => {
  perfWaitForPageLoad(maxTime);
});

Cypress.Commands.add('measureLoadTime', () => {
  return perfMeasureLoadTime();
});

Cypress.Commands.add('getNetworkStats', () => {
  return perfGetNetworkStats();
});

Cypress.Commands.add('getCoreWebVitals', () => {
  return perfGetCoreWebVitals();
});

Cypress.Commands.add('assertPerformanceThreshold', (metrics, maxLoadTime = 4000) => {
  perfAssertPerformanceThreshold(metrics, maxLoadTime);
});

// Export for direct use if needed
export {
  loginAsUser,
  authLogout as logout,
  perfStart as startPerformanceMonitoring,
  perfWaitForPageLoad as waitForPageLoad,
  perfMeasureLoadTime as measureLoadTime,
  perfGetNetworkStats as getNetworkStats,
  perfGetCoreWebVitals as getCoreWebVitals,
  perfAssertPerformanceThreshold as assertPerformanceThreshold,
};
