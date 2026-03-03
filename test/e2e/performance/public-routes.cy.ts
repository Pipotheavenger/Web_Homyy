/**
 * Performance tests for public routes
 * Tests login and registration pages without authentication
 */

describe('Performance: Public Routes', () => {
  beforeEach(() => {
    // Ensure we're logged out
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
  });

  describe('Login Page', () => {
    it('debe cargar /login en menos de 4 segundos sin requests fallidas', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/login');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 30);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar formulario de login correctamente', () => {
      cy.visit('/login');
      cy.waitForPageLoad();

      // Verify key elements are visible
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('debe tener Core Web Vitals aceptables', () => {
      cy.visit('/login');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });

  describe('Register Page', () => {
    it('debe cargar /register en menos de 4 segundos sin requests fallidas', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/register');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 30);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar formulario de registro correctamente', () => {
      cy.visit('/register');
      cy.waitForPageLoad();

      // Registration starts with role selection
      cy.contains(/Hommy|Buscar servicios|Vender servicios/i).should('be.visible');
    });

    it('debe tener Core Web Vitals aceptables', () => {
      cy.visit('/register');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });

  describe('Home/Root Page', () => {
    it('debe cargar / (home) en menos de 4 segundos sin requests fallidas', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 30);
      });
      cy.assertNoFailedRequests();
    });
  });
});
