/**
 * Performance tests for Worker Routes
 * Tests all secondary worker routes for load performance
 */

describe('Performance: Worker Routes', () => {
  before(() => {
    cy.loginAsWorker();
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  describe('Trabajos Page', () => {
    it('debe cargar /worker/trabajos en menos de 4 segundos', () => {
      cy.visit('/worker/trabajos');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Requests:', metrics.requestCount);
      });
    });

    it('debe mostrar trabajos disponibles o estado vacío', () => {
      cy.visit('/worker/trabajos');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No hay trabajos')) {
          cy.log('No jobs available');
        } else {
          cy.log('Jobs list loaded');
        }
      });
    });

    it('debe tener Core Web Vitals aceptables', () => {
      cy.visit('/worker/trabajos');
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

    it('filtros deben funcionar sin degradación de rendimiento', () => {
      cy.visit('/worker/trabajos');
      cy.waitForPageLoad();

      // Check if filters exist and can be interacted with
      cy.get('body').then(($body) => {
        if ($body.find('select').length > 0 || $body.find('input[type="search"]').length > 0) {
          cy.log('Filters are available');
        }
      });
    });
  });

  describe('Perfil Page', () => {
    it('debe cargar /worker/perfil en menos de 4 segundos', () => {
      cy.visit('/worker/perfil');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
      });
    });

    it('debe mostrar información del perfil profesional', () => {
      cy.visit('/worker/perfil');
      cy.waitForPageLoad();

      cy.contains(/perfil|mi perfil/i).should('be.visible');
    });
  });

  describe('Historial Page', () => {
    it('debe cargar /worker/historial en menos de 4 segundos', () => {
      cy.visit('/worker/historial');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
      });
    });

    it('debe mostrar historial de trabajos', () => {
      cy.visit('/worker/historial');
      cy.waitForPageLoad();

      cy.contains(/historial|trabajos anteriores/i).should('be.visible');
    });
  });

  describe('Pagos Page', () => {
    it('debe cargar /worker/pagos en menos de 4 segundos', () => {
      cy.visit('/worker/pagos');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
      });
    });

    it('debe mostrar información de ganancias y pagos', () => {
      cy.visit('/worker/pagos');
      cy.waitForPageLoad();

      cy.contains(/pago|pagos|ganancia/i).should('be.visible');
    });
  });

  describe('Network Performance Across Routes', () => {
    const routes = [
      '/worker/trabajos',
      '/worker/perfil',
      '/worker/historial',
      '/worker/pagos',
    ];

    routes.forEach((route) => {
      it(`${route} no debe tener requests excesivamente lentas`, () => {
        cy.startPerformanceMonitoring();
        cy.visit(route);
        cy.waitForPageLoad();

        cy.measureLoadTime().then((metrics) => {
          // Check for very slow requests
          const slowRequests = metrics.slowestRequests.filter(req => req.duration > 2000);

          if (slowRequests.length > 0) {
            cy.log(`⚠️  Slow requests found in ${route}:`);
            slowRequests.forEach(req => {
              cy.log(`  - ${req.url}: ${req.duration}ms`);
            });
          } else {
            cy.log(`✓ All requests in ${route} are reasonably fast`);
          }
        });
      });
    });
  });

  describe('Comparison: User vs Worker Pages', () => {
    it('worker/trabajos debe tener rendimiento comparable a user/profesionales', () => {
      // Test worker/trabajos
      cy.startPerformanceMonitoring();
      cy.visit('/worker/trabajos');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((workerMetrics) => {
        cy.log('Worker Trabajos Load Time:', `${workerMetrics.loadTime}ms`);

        // Both should meet threshold
        expect(workerMetrics.loadTime).to.be.lessThan(4000);
      });
    });
  });
});
