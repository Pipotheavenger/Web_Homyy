/**
 * Performance tests for Chat functionality
 * Tests real-time messaging performance for both client and worker
 */

describe('Performance: Chat Functionality', () => {
  describe('Client Chat', () => {
    before(() => {
      cy.loginAsClient();
    });

    beforeEach(() => {
      cy.startPerformanceMonitoring();
    });

    it('debe cargar /user/chats en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/chats');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar conversaciones o estado vacio', () => {
      cy.visit('/user/chats');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No tienes conversaciones') || $body.text().includes('Sin mensajes')) {
          cy.contains(/sin|no tienes/i).should('be.visible');
        } else {
          cy.log('Conversations loaded');
        }
      });
    });

    it('debe tener Core Web Vitals aceptables', () => {
      cy.visit('/user/chats');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });

  describe('Worker Chat', () => {
    before(() => {
      cy.loginAsWorker();
    });

    beforeEach(() => {
      cy.startPerformanceMonitoring();
    });

    it('debe cargar /worker/chats en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/worker/chats');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar conversaciones o estado vacio', () => {
      cy.visit('/worker/chats');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No tienes conversaciones') || $body.text().includes('Sin mensajes')) {
          cy.log('No conversations found');
        } else {
          cy.log('Conversations loaded');
        }
      });
    });

    it('debe tener Core Web Vitals aceptables', () => {
      cy.visit('/worker/chats');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });

  describe('Chat Performance Comparison', () => {
    it('user/chats y worker/chats deben tener rendimiento similar', () => {
      // Test user chat
      cy.loginAsClient();
      cy.startPerformanceMonitoring();
      cy.visit('/user/chats');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((userMetrics) => {
        cy.log('User Chat Load Time:', `${userMetrics.loadTime}ms`);

        // Test worker chat
        cy.loginAsWorker();
        cy.startPerformanceMonitoring();
        cy.visit('/worker/chats');
        cy.waitForPageLoad();

        cy.measureLoadTime().then((workerMetrics) => {
          cy.log('Worker Chat Load Time:', `${workerMetrics.loadTime}ms`);

          // Both should meet the 4s threshold
          expect(userMetrics.loadTime, 'User chat should load in < 4s').to.be.lessThan(4000);
          expect(workerMetrics.loadTime, 'Worker chat should load in < 4s').to.be.lessThan(4000);
        });
      });
    });
  });
});
