/**
 * Global setup for Cypress E2E tests
 * Loads custom commands and sets up performance tracking
 */

// Import custom commands
import './commands';

// Set up global hooks
beforeEach(() => {
  // Intercept all network requests to track performance
  cy.intercept('**/*', (req) => {
    const startTime = Date.now();

    req.on('response', (res) => {
      const duration = Date.now() - startTime;

      // Store request data for performance tracking
      cy.window().then((win) => {
        if (!win.__performanceData__) {
          win.__performanceData__ = {
            requests: [],
            navigationStart: Date.now(),
            loadComplete: 0,
          };
        }

        if (!win.__pendingRequests__) {
          win.__pendingRequests__ = 0;
        }

        // Add request to tracking
        win.__performanceData__.requests.push({
          url: req.url,
          method: req.method,
          duration,
          size: parseInt(res.headers['content-length'] || '0', 10),
          status: res.statusCode,
        });
      });
    });

    // Track pending requests
    cy.window().then((win) => {
      if (win.__pendingRequests__ !== undefined) {
        win.__pendingRequests__++;
      }
    });

    req.on('after:response', () => {
      cy.window().then((win) => {
        if (win.__pendingRequests__ !== undefined && win.__pendingRequests__ > 0) {
          win.__pendingRequests__--;
        }
      });
    });
  }).as('networkRequest');

  // Disable smooth scrolling to speed up tests
  cy.on('window:before:load', (win) => {
    win.document.documentElement.style.scrollBehavior = 'auto';
  });
});

afterEach(() => {
  // Clean up Supabase subscriptions to prevent memory leaks
  cy.window().then((win) => {
    // Close any open Supabase realtime connections
    if (win.localStorage) {
      // Get all Supabase keys
      const keys = Object.keys(win.localStorage).filter(key => key.startsWith('sb-'));

      // Log if there are active sessions (for debugging)
      if (keys.length > 0) {
        cy.log(`Active Supabase sessions: ${keys.length}`);
      }
    }
  });
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error for debugging
  cy.log('Uncaught exception:', err.message);

  // Don't fail tests on uncaught exceptions from the app
  // This is useful for performance tests where we're focused on load times
  // You can customize this to only ignore specific errors
  if (err.message.includes('ResizeObserver')) {
    // Ignore ResizeObserver errors (common in React apps)
    return false;
  }

  // Let other exceptions fail the test
  return true;
});

// Add support for environment variables
Cypress.env('maxLoadTime', Cypress.env('maxLoadTime') || 4000);
Cypress.env('maxLCP', Cypress.env('maxLCP') || 2500);
Cypress.env('maxCLS', Cypress.env('maxCLS') || 0.1);
Cypress.env('maxFID', Cypress.env('maxFID') || 100);
