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
      fid: number;
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
