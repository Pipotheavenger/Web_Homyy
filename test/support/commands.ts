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
  assertWebVitalsThreshold as perfAssertWebVitalsThreshold,
  assertNoSlowRequests as perfAssertNoSlowRequests,
  assertTransferSize as perfAssertTransferSize,
  assertRequestCount as perfAssertRequestCount,
  assertNoFailedRequests as perfAssertNoFailedRequests,
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

Cypress.Commands.add('assertWebVitalsThreshold', (vitals) => {
  perfAssertWebVitalsThreshold(vitals);
});

Cypress.Commands.add('assertNoSlowRequests', (metrics, maxMs = 2000) => {
  perfAssertNoSlowRequests(metrics, maxMs);
});

Cypress.Commands.add('assertTransferSize', (metrics, maxKB) => {
  perfAssertTransferSize(metrics, maxKB);
});

Cypress.Commands.add('assertRequestCount', (metrics, maxRequests) => {
  perfAssertRequestCount(metrics, maxRequests);
});

Cypress.Commands.add('assertNoFailedRequests', () => {
  perfAssertNoFailedRequests();
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
  perfAssertWebVitalsThreshold as assertWebVitalsThreshold,
  perfAssertNoSlowRequests as assertNoSlowRequests,
  perfAssertTransferSize as assertTransferSize,
  perfAssertRequestCount as assertRequestCount,
  perfAssertNoFailedRequests as assertNoFailedRequests,
};
