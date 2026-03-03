/**
 * Performance tests for Worker Dashboard
 * Critical test: Worker dashboard with applications and statistics
 * Must load in < 4 seconds with all data
 */

describe('Performance: Worker Dashboard', () => {
  before(() => {
    cy.loginAsWorker();
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  describe('Dashboard Load Performance', () => {
    it('debe cargar /worker/dashboard en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 50);
        cy.assertTransferSize(metrics, 3000);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar el welcome banner correctamente', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.contains(/hola|bienvenid/i).should('be.visible');
      cy.contains(/trabajos|ver trabajos/i).should('be.visible');
    });

    it('debe cargar la seccion de aplicaciones', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.contains('Mis Aplicaciones').should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.text().includes('No has aplicado')) {
          cy.contains(/no has aplicado|sin aplicaciones/i).should('be.visible');
        } else {
          cy.log('Applications found in dashboard');
        }
      });
    });

    it('debe cargar las estadisticas del trabajador', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.contains('Estadísticas').should('be.visible');
      cy.contains(/ganancia|earning/i).should('be.visible');
      cy.contains(/completado|completed/i).should('be.visible');
      cy.contains(/calificación|rating/i).should('be.visible');
    });

    it('no debe tener skeleton loaders visibles despues de cargar', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.get('[class*="skeleton"]').should('not.exist');
      cy.get('[class*="loading"]').should('not.exist');
    });
  });

  describe('Core Web Vitals', () => {
    it('debe tener LCP < 2.5s y CLS < 0.1', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });

  describe('Interactions Performance', () => {
    it('boton "Ver Trabajos" debe ser clickeable inmediatamente', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.contains(/ver trabajos|buscar trabajos/i).should('be.visible').and('not.be.disabled');
    });
  });

  describe('Image Loading Performance', () => {
    it('imagenes deben cargar eficientemente', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        const imageRequests = metrics.slowestRequests.filter(req =>
          req.url.match(/\.(png|jpg|jpeg|gif|svg|webp)/i)
        );

        imageRequests.forEach((req) => {
          expect(req.duration, `Image ${req.url} should load in < 3s`).to.be.lessThan(3000);
        });
      });
    });
  });

  describe('Multiple Visits Performance', () => {
    it('segunda visita debe tener rendimiento similar', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((firstVisit) => {
        cy.log('First Visit Load Time:', `${firstVisit.loadTime}ms`);

        cy.startPerformanceMonitoring();
        cy.visit('/worker/dashboard');
        cy.waitForPageLoad();

        cy.measureLoadTime().then((secondVisit) => {
          cy.log('Second Visit Load Time:', `${secondVisit.loadTime}ms`);
          cy.log('Load Time Difference:', `${Math.abs(secondVisit.loadTime - firstVisit.loadTime)}ms`);

          expect(secondVisit.loadTime, 'Second visit should also be under 4s').to.be.lessThan(4000);
        });
      });
    });
  });
});
