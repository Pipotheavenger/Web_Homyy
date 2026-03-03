/**
 * Performance measurement utilities for Cypress tests
 * Tracks network requests, load times, and Core Web Vitals
 */

export interface PerformanceMetrics {
  loadTime: number;
  requestCount: number;
  totalSize: number;
  slowestRequests: Array<{ url: string; duration: number }>;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
}

/**
 * Initialize performance monitoring for a page
 * Should be called before visiting a page
 */
export function startPerformanceMonitoring(): void {
  cy.window().then((win) => {
    // Initialize performance data storage
    win.__performanceData__ = {
      requests: [],
      navigationStart: Date.now(),
      loadComplete: 0,
    };
    win.__pendingRequests__ = 0;
  });
}

/**
 * Wait for page to load completely
 * - All network requests must be finished
 * - No skeleton loaders visible
 * - Timeout if exceeds maxTime
 */
export function waitForPageLoad(maxTime: number = 4000): void {
  const startTime = Date.now();

  // Wait for performance API to be available
  cy.window().its('performance').should('exist');

  // Wait for no pending requests for at least 500ms
  cy.window().then({ timeout: maxTime }, (win) => {
    return new Cypress.Promise((resolve, reject) => {
      let consecutiveZeros = 0;
      const requiredConsecutiveChecks = 5; // 5 checks * 100ms = 500ms

      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        if (elapsed > maxTime) {
          clearInterval(checkInterval);
          reject(new Error(`Page load timeout: exceeded ${maxTime}ms`));
          return;
        }

        const pending = win.__pendingRequests__ || 0;

        if (pending === 0) {
          consecutiveZeros++;
          if (consecutiveZeros >= requiredConsecutiveChecks) {
            clearInterval(checkInterval);
            win.__performanceData__.loadComplete = Date.now();
            resolve();
          }
        } else {
          consecutiveZeros = 0;
        }
      }, 100);
    });
  });

  // Wait for skeleton loaders to disappear if they exist
  cy.get('body').then(($body) => {
    // Check if skeleton loaders exist
    const hasSkeletons = $body.find('[class*="skeleton"]').length > 0 ||
                        $body.find('[class*="loading"]').length > 0;

    if (hasSkeletons) {
      cy.log('Waiting for skeleton loaders to disappear...');
      // Wait for skeletons to be gone with custom timeout
      cy.get('[class*="skeleton"]', { timeout: maxTime }).should('not.exist');
    }
  });

  // Verify total time didn't exceed max
  cy.then(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed > maxTime) {
      throw new Error(`Page load took ${elapsed}ms, exceeding limit of ${maxTime}ms`);
    }
  });
}

/**
 * Measure load time and return performance metrics
 */
export function measureLoadTime(): Cypress.Chainable<PerformanceMetrics> {
  return cy.window().then((win) => {
    const perfData = win.__performanceData__;

    if (!perfData) {
      throw new Error('Performance monitoring not started. Call startPerformanceMonitoring() first.');
    }

    const loadTime = perfData.loadComplete - perfData.navigationStart;
    const requests = perfData.requests || [];

    const totalSize = requests.reduce((sum, req) => sum + (req.size || 0), 0);
    const requestCount = requests.length;

    // Find slowest requests
    const slowestRequests = requests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(req => ({
        url: req.url,
        duration: req.duration,
      }));

    return {
      loadTime,
      requestCount,
      totalSize: Math.round(totalSize / 1024), // Convert to KB
      slowestRequests,
    };
  });
}

/**
 * Get network statistics
 */
export function getNetworkStats(): Cypress.Chainable<{
  requestCount: number;
  totalSize: number;
  slowestRequests: Array<{ url: string; duration: number }>;
}> {
  return cy.window().then((win) => {
    const requests = win.__performanceData__?.requests || [];

    const totalSize = requests.reduce((sum, req) => sum + (req.size || 0), 0);
    const slowestRequests = requests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(req => ({
        url: req.url,
        duration: req.duration,
      }));

    return {
      requestCount: requests.length,
      totalSize: Math.round(totalSize / 1024), // KB
      slowestRequests,
    };
  });
}

/**
 * Get Core Web Vitals using Performance Observer API
 */
export function getCoreWebVitals(): Cypress.Chainable<CoreWebVitals> {
  return cy.window().then((win) => {
    return new Cypress.Promise<CoreWebVitals>((resolve) => {
      const vitals: CoreWebVitals = {
        lcp: 0,
        cls: 0,
      };

      // Get LCP (Largest Contentful Paint)
      try {
        const lcpEntries = win.performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          const lastEntry = lcpEntries[lcpEntries.length - 1] as any;
          vitals.lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
        }
      } catch (e) {
        cy.log('LCP not available:', e);
      }

      // Get CLS (Cumulative Layout Shift)
      try {
        const clsEntries = win.performance.getEntriesByType('layout-shift');
        vitals.cls = clsEntries.reduce((sum: number, entry: any) => {
          if (!entry.hadRecentInput) {
            return sum + entry.value;
          }
          return sum;
        }, 0);
        vitals.cls = Math.round(vitals.cls * 1000) / 1000; // Round to 3 decimals
      } catch (e) {
        cy.log('CLS not available:', e);
      }

      resolve(vitals);
    });
  });
}

/**
 * Assert that performance metrics meet thresholds
 * Fails the test if any threshold is exceeded
 */
export function assertPerformanceThreshold(
  metrics: PerformanceMetrics,
  maxLoadTime: number = 4000
): void {
  cy.log('Performance Metrics:', JSON.stringify(metrics, null, 2));

  // Assert load time
  expect(metrics.loadTime, `Load time should be less than ${maxLoadTime}ms`).to.be.lessThan(
    maxLoadTime
  );

  // Log network stats for analysis
  cy.log(`Network Requests: ${metrics.requestCount}`);
  cy.log(`Total Size: ${metrics.totalSize}KB`);

  if (metrics.slowestRequests.length > 0) {
    cy.log('Slowest Requests:');
    metrics.slowestRequests.forEach((req, i) => {
      cy.log(`  ${i + 1}. ${req.url} - ${req.duration}ms`);
    });
  }
}

/**
 * Assert Core Web Vitals meet thresholds
 * In Chrome, LCP is required to be measured. In other browsers, it's optional.
 */
export function assertWebVitalsThreshold(vitals: CoreWebVitals): void {
  cy.log('Core Web Vitals:', JSON.stringify(vitals, null, 2));

  // LCP: In Chrome, it must be measured and within threshold
  // In Electron/other browsers, only assert if measured
  if (Cypress.browser.name === 'chrome' || Cypress.browser.name === 'chromium') {
    expect(vitals.lcp, 'LCP should be measured in Chrome').to.be.greaterThan(0);
    expect(vitals.lcp, 'LCP should be less than 2500ms').to.be.lessThan(2500);
  } else if (vitals.lcp > 0) {
    expect(vitals.lcp, 'LCP should be less than 2500ms').to.be.lessThan(2500);
  }

  // CLS: Always assert (0 is a valid good value)
  expect(vitals.cls, 'CLS should be less than 0.1').to.be.lessThan(0.1);
}

/**
 * Assert no individual request exceeds a duration threshold
 * FAILS the test if slow requests are found (unlike the old log-only approach)
 */
export function assertNoSlowRequests(
  metrics: PerformanceMetrics,
  maxSingleRequestMs: number = 2000
): void {
  const slowRequests = metrics.slowestRequests.filter(
    (req) => req.duration > maxSingleRequestMs
  );

  // Log for debugging regardless
  if (slowRequests.length > 0) {
    cy.log(`Slow requests (>${maxSingleRequestMs}ms):`);
    slowRequests.forEach((req) => {
      cy.log(`  ${req.url}: ${req.duration}ms`);
    });
  }

  // FAIL the test
  expect(
    slowRequests.length,
    `No request should exceed ${maxSingleRequestMs}ms. Found ${slowRequests.length} slow request(s).`
  ).to.eq(0);
}

/**
 * Assert total transfer size is within threshold
 */
export function assertTransferSize(
  metrics: PerformanceMetrics,
  maxSizeKB: number
): void {
  expect(
    metrics.totalSize,
    `Transfer size ${metrics.totalSize}KB should be under ${maxSizeKB}KB`
  ).to.be.lessThan(maxSizeKB);
}

/**
 * Assert request count is within threshold
 */
export function assertRequestCount(
  metrics: PerformanceMetrics,
  maxRequests: number
): void {
  expect(
    metrics.requestCount,
    `Request count ${metrics.requestCount} should be under ${maxRequests}`
  ).to.be.lessThan(maxRequests);
}

/**
 * Assert no HTTP requests returned error status codes (4xx/5xx)
 * Excludes favicon requests which commonly 404
 */
export function assertNoFailedRequests(): void {
  cy.window().then((win) => {
    const requests = win.__performanceData__?.requests || [];
    const failedRequests = requests.filter(
      (req) => req.status >= 400 && !req.url.includes('favicon')
    );

    if (failedRequests.length > 0) {
      cy.log('Failed HTTP requests:');
      failedRequests.forEach((req) => {
        cy.log(`  ${req.status} ${req.method} ${req.url}`);
      });
    }

    expect(
      failedRequests.length,
      `No HTTP requests should fail. Found ${failedRequests.length} request(s) with status >= 400.`
    ).to.eq(0);
  });
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(
  route: string,
  metrics: PerformanceMetrics,
  vitals?: CoreWebVitals
): void {
  const summary = {
    route,
    timestamp: new Date().toISOString(),
    loadTime: `${metrics.loadTime}ms`,
    requests: metrics.requestCount,
    totalSize: `${metrics.totalSize}KB`,
    lcp: vitals?.lcp ? `${vitals.lcp}ms` : 'N/A',
    cls: vitals?.cls !== undefined ? vitals.cls : 'N/A',
  };

  cy.log('Performance Summary:');
  cy.log(JSON.stringify(summary, null, 2));

  // Write to file for baseline comparison (optional)
  cy.task('log', `Performance: ${route} - ${JSON.stringify(summary)}`);
}
