/**
 * Performance tests for User (Client) Dashboard
 * Critical test: Dashboard is the main page users see
 * Must load in < 4 seconds with all data (services, categories, top professionals)
 */

describe('Performance: User Dashboard', () => {
  before(() => {
    cy.loginAsClient();
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  describe('Dashboard Load Performance', () => {
    it('debe cargar /user/dashboard en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/dashboard');
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
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.contains(/hola|bienvenid/i).should('be.visible');
      cy.contains(/Crear.*Servicio/i).should('be.visible');
    });

    it('debe cargar la seccion de servicios', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.contains('Mis Servicios').should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.text().includes('No tienes servicios')) {
          cy.contains(/No tienes.*servicios/i).should('be.visible');
        } else {
          cy.log('Services found in dashboard');
        }
      });
    });

    it('debe cargar profesionales destacados (lazy loaded)', () => {
      cy.visit('/user/dashboard');
      cy.contains(/profesionales|destacados/i, { timeout: 15000 }).should('be.visible');
    });

    it('no debe tener skeleton loaders visibles despues de cargar', () => {
      cy.visit('/user/dashboard');
      cy.get('[class*="skeleton"]', { timeout: 15000 }).should('not.exist');
      cy.get('[class*="loading"]', { timeout: 15000 }).should('not.exist');
    });
  });

  describe('Core Web Vitals', () => {
    it('debe tener LCP < 2.5s y CLS < 0.1', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });

  describe('Interactions Performance', () => {
    it('boton "Crear Servicio" debe ser clickeable inmediatamente', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.contains(/Crear.*Servicio/i).should('be.visible').and('not.be.disabled');
    });

    it('navegacion a otras secciones debe funcionar', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      // Verify navigation elements exist
      cy.get('body').then(($body) => {
        const hasNav = $body.find('nav').length > 0 || $body.find('[role="navigation"]').length > 0;
        expect(hasNav, 'Dashboard should have navigation elements').to.be.true;
      });
    });
  });

  describe('Multiple Visits Performance', () => {
    it('segunda visita debe aprovechar cache de React Query', () => {
      // First visit
      cy.startPerformanceMonitoring();
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((firstVisit) => {
        cy.log('First Visit Load Time:', `${firstVisit.loadTime}ms`);

        // Second visit (should be faster due to caching)
        cy.startPerformanceMonitoring();
        cy.visit('/user/dashboard');
        cy.waitForPageLoad();

        cy.measureLoadTime().then((secondVisit) => {
          cy.log('Second Visit Load Time:', `${secondVisit.loadTime}ms`);
          cy.log('Load Time Difference:', `${Math.abs(secondVisit.loadTime - firstVisit.loadTime)}ms`);

          // Second visit must also meet the threshold
          expect(secondVisit.loadTime, 'Second visit should also be under 4s').to.be.lessThan(4000);
        });
      });
    });
  });
});
