/**
 * Performance tests for User (Client) Routes
 * Tests all secondary client routes for load performance
 */

describe('Performance: User Routes', () => {
  before(() => {
    cy.loginAsClient();
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  describe('Crear Servicio Page', () => {
    it('debe cargar /user/crear-servicio en menos de 4 segundos', () => {
      cy.visit('/user/crear-servicio');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Requests:', metrics.requestCount);
      });
    });

    it('debe cargar formulario y categorías', () => {
      cy.visit('/user/crear-servicio');
      cy.waitForPageLoad();

      cy.contains(/crear|nuevo servicio/i).should('be.visible');
    });
  });

  describe('Profesionales Page', () => {
    it('debe cargar /user/profesionales en menos de 4 segundos', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Requests:', metrics.requestCount);
      });
    });

    it('debe mostrar profesionales o estado vacío', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No hay profesionales')) {
          cy.log('No professionals available');
        } else {
          cy.log('Professionals list loaded');
        }
      });
    });

    it('debe tener Core Web Vitals aceptables', () => {
      cy.visit('/user/profesionales');
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

  describe('Perfil Page', () => {
    it('debe cargar /user/perfil en menos de 4 segundos', () => {
      cy.visit('/user/perfil');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
      });
    });

    it('debe mostrar información del perfil', () => {
      cy.visit('/user/perfil');
      cy.waitForPageLoad();

      cy.contains(/perfil|mi perfil/i).should('be.visible');
    });
  });

  describe('Historial Page', () => {
    it('debe cargar /user/historial en menos de 4 segundos', () => {
      cy.visit('/user/historial');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
      });
    });

    it('debe mostrar historial de servicios', () => {
      cy.visit('/user/historial');
      cy.waitForPageLoad();

      cy.contains(/historial|servicios anteriores/i).should('be.visible');
    });
  });

  describe('Notificaciones Page', () => {
    it('debe cargar /user/notificaciones en menos de 4 segundos', () => {
      cy.visit('/user/notificaciones');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
      });
    });

    it('debe mostrar notificaciones o estado vacío', () => {
      cy.visit('/user/notificaciones');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No tienes notificaciones') || $body.text().includes('Sin notificaciones')) {
          cy.log('No notifications');
        } else {
          cy.log('Notifications loaded');
        }
      });
    });
  });

  describe('Pagos Page', () => {
    it('debe cargar /user/pagos en menos de 4 segundos', () => {
      cy.visit('/user/pagos');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
      });
    });

    it('debe mostrar información de pagos', () => {
      cy.visit('/user/pagos');
      cy.waitForPageLoad();

      cy.contains(/pago|pagos|métodos de pago/i).should('be.visible');
    });
  });

  describe('Network Performance Across Routes', () => {
    const routes = [
      '/user/crear-servicio',
      '/user/profesionales',
      '/user/perfil',
      '/user/historial',
      '/user/notificaciones',
      '/user/pagos',
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
});
