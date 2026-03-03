/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to login as a client user
     * @example cy.loginAsClient()
     */
    loginAsClient(): Chainable<void>;

    /**
     * Custom command to login as a worker user
     * @example cy.loginAsWorker()
     */
    loginAsWorker(): Chainable<void>;

    /**
     * Custom command to login as an admin user
     * @example cy.loginAsAdmin()
     */
    loginAsAdmin(): Chainable<void>;

    /**
     * Custom command to logout
     * @example cy.logout()
     */
    logout(): Chainable<void>;

    /**
     * Custom command to start performance monitoring
     * @example cy.startPerformanceMonitoring()
     */
    startPerformanceMonitoring(): Chainable<void>;

    /**
     * Custom command to wait for page to load completely
     * @param maxTime Maximum time to wait in milliseconds (default: 4000)
     * @example cy.waitForPageLoad(4000)
     */
    waitForPageLoad(maxTime?: number): Chainable<void>;

    /**
     * Custom command to measure load time and get performance metrics
     * @example cy.measureLoadTime()
     */
    measureLoadTime(): Chainable<{
      loadTime: number;
      requestCount: number;
      totalSize: number;
      slowestRequests: Array<{ url: string; duration: number }>;
    }>;

    /**
     * Custom command to get network statistics
     * @example cy.getNetworkStats()
     */
    getNetworkStats(): Chainable<{
      requestCount: number;
      totalSize: number;
      slowestRequests: Array<{ url: string; duration: number }>;
    }>;

    /**
     * Custom command to get Core Web Vitals
     * @example cy.getCoreWebVitals()
     */
    getCoreWebVitals(): Chainable<{
      lcp: number;
      cls: number;
    }>;

    /**
     * Custom command to assert performance thresholds
     * @param metrics Performance metrics object
     * @param maxLoadTime Maximum load time in milliseconds (default: 4000)
     * @example cy.assertPerformanceThreshold(metrics, 4000)
     */
    assertPerformanceThreshold(
      metrics: { loadTime: number; requestCount: number; totalSize: number },
      maxLoadTime?: number
    ): Chainable<void>;

    /**
     * Assert Core Web Vitals meet thresholds
     * In Chrome, LCP must be measured. CLS is always asserted.
     * @example cy.assertWebVitalsThreshold(vitals)
     */
    assertWebVitalsThreshold(
      vitals: { lcp: number; cls: number }
    ): Chainable<void>;

    /**
     * Assert no individual request exceeds a duration threshold
     * FAILS the test if slow requests are found
     * @param metrics Performance metrics with slowestRequests
     * @param maxMs Maximum duration for any single request (default: 2000)
     * @example cy.assertNoSlowRequests(metrics, 2000)
     */
    assertNoSlowRequests(
      metrics: { slowestRequests: Array<{ url: string; duration: number }> },
      maxMs?: number
    ): Chainable<void>;

    /**
     * Assert total transfer size is within threshold
     * @param metrics Performance metrics with totalSize
     * @param maxKB Maximum transfer size in KB
     * @example cy.assertTransferSize(metrics, 3000)
     */
    assertTransferSize(
      metrics: { totalSize: number },
      maxKB: number
    ): Chainable<void>;

    /**
     * Assert request count is within threshold
     * @param metrics Performance metrics with requestCount
     * @param maxRequests Maximum number of requests
     * @example cy.assertRequestCount(metrics, 50)
     */
    assertRequestCount(
      metrics: { requestCount: number },
      maxRequests: number
    ): Chainable<void>;

    /**
     * Assert no HTTP requests returned error status codes (4xx/5xx)
     * @example cy.assertNoFailedRequests()
     */
    assertNoFailedRequests(): Chainable<void>;
  }

  interface Window {
    __performanceData__: {
      requests: Array<{
        url: string;
        method: string;
        duration: number;
        size: number;
        status: number;
      }>;
      navigationStart: number;
      loadComplete: number;
    };
    __pendingRequests__: number;
  }
}
