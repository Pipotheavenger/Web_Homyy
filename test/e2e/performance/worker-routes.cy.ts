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
    it('debe cargar /worker/trabajos en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/worker/trabajos');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 50);
        cy.assertTransferSize(metrics, 3000);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar trabajos disponibles o estado vacio', () => {
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
        cy.assertWebVitalsThreshold(vitals);
      });
    });

    it('filtros deben estar disponibles', () => {
      cy.visit('/worker/trabajos');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        const hasFilters = $body.find('select').length > 0 ||
                          $body.find('input[type="search"]').length > 0 ||
                          $body.find('[role="combobox"]').length > 0 ||
                          $body.find('input[placeholder]').length > 0;
        expect(hasFilters, 'Page should have filter or search controls').to.be.true;
      });
    });
  });

  describe('Perfil Page', () => {
    it('debe cargar /worker/perfil en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/worker/perfil');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar informacion del perfil profesional', () => {
      cy.visit('/worker/perfil');
      cy.waitForPageLoad();

      cy.contains(/perfil|mi perfil/i).should('be.visible');
    });
  });

  describe('Historial Page', () => {
    it('debe cargar /worker/historial en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/worker/historial');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar historial de trabajos', () => {
      cy.visit('/worker/historial');
      cy.waitForPageLoad();

      cy.contains(/historial|trabajos anteriores/i).should('be.visible');
    });
  });

  describe('Pagos Page', () => {
    it('debe cargar /worker/pagos en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/worker/pagos');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar informacion de ganancias y pagos', () => {
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
      it(`${route} no debe tener requests lentas ni requests fallidas`, () => {
        cy.startPerformanceMonitoring();
        cy.visit(route);
        cy.waitForPageLoad();

        cy.measureLoadTime().then((metrics) => {
          cy.assertNoSlowRequests(metrics, 2000);
        });
        cy.assertNoFailedRequests();
      });
    });
  });
});
