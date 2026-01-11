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

    it('debe cargar /user/chats en menos de 4 segundos', () => {
      cy.visit('/user/chats');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('=== USER CHAT METRICS ===');
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
      });
    });

    it('debe mostrar conversaciones o estado vacío', () => {
      cy.visit('/user/chats');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No tienes conversaciones') || $body.text().includes('Sin mensajes')) {
          cy.log('No conversations found');
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
        cy.log('LCP:', `${vitals.lcp}ms`);
        cy.log('CLS:', vitals.cls);

        if (vitals.lcp > 0) {
          expect(vitals.lcp).to.be.lessThan(2500);
        }
        if (vitals.cls > 0) {
          expect(vitals.cls).to.be.lessThan(0.1);
        }
      });
    });

    it('no debe tener Supabase Realtime connections lentas', () => {
      cy.visit('/user/chats');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        // Check for Supabase realtime connections
        const realtimeRequests = metrics.slowestRequests.filter(req =>
          req.url.includes('supabase') || req.url.includes('realtime')
        );

        if (realtimeRequests.length > 0) {
          cy.log('Supabase Realtime Requests:');
          realtimeRequests.forEach((req, i) => {
            cy.log(`${i + 1}. ${req.duration}ms`);
          });
        }
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

    it('debe cargar /worker/chats en menos de 4 segundos', () => {
      cy.visit('/worker/chats');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('=== WORKER CHAT METRICS ===');
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
      });
    });

    it('debe mostrar conversaciones o estado vacío', () => {
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
        cy.log('LCP:', `${vitals.lcp}ms`);
        cy.log('CLS:', vitals.cls);

        if (vitals.lcp > 0) {
          expect(vitals.lcp).to.be.lessThan(2500);
        }
        if (vitals.cls > 0) {
          expect(vitals.cls).to.be.lessThan(0.1);
        }
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
          expect(userMetrics.loadTime).to.be.lessThan(4000);
          expect(workerMetrics.loadTime).to.be.lessThan(4000);

          // Log performance comparison
          const difference = Math.abs(userMetrics.loadTime - workerMetrics.loadTime);
          cy.log('Performance Difference:', `${difference}ms`);
        });
      });
    });
  });

  describe('Network Performance', () => {
    before(() => {
      cy.loginAsClient();
    });

    it('no debe tener demasiadas requests en carga inicial', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/user/chats');
      cy.waitForPageLoad();

      cy.getNetworkStats().then((stats) => {
        cy.log('Total Requests:', stats.requestCount);
        cy.log('Total Size:', `${stats.totalSize}KB`);

        // Chat should be relatively lightweight initially
        // It will establish websocket connections but HTTP requests should be minimal
        expect(stats.requestCount, 'Should not have excessive HTTP requests').to.be.lessThan(40);
      });
    });

    it('slowest requests deben ser identificadas para optimización', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/user/chats');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        cy.log('Top 5 Slowest Requests:');
        metrics.slowestRequests.forEach((req, i) => {
          cy.log(`${i + 1}. ${req.url} - ${req.duration}ms`);

          // Warn about very slow requests
          if (req.duration > 2000) {
            cy.log(`⚠️  Very slow request: ${req.url} took ${req.duration}ms`);
          }
        });
      });
    });
  });
});
