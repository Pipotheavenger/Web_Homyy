/**
 * Performance tests for Admin Routes
 * Tests admin dashboard and admin-specific pages
 */

describe('Performance: Admin Routes', () => {
  before(() => {
    cy.loginAsAdmin();
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  describe('Admin Dashboard', () => {
    it('debe cargar /admin/dashboard en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 50);
        cy.assertTransferSize(metrics, 2500);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar panel de administracion correctamente', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad();

      // Admin dashboard should have admin-specific content
      cy.contains(/admin|administr|dashboard|panel/i).should('be.visible');
    });

    it('no debe tener skeleton loaders despues de cargar', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad();

      cy.get('[class*="skeleton"]').should('not.exist');
      cy.get('[class*="loading"]').should('not.exist');
    });
  });

  describe('Core Web Vitals', () => {
    it('debe tener LCP < 2.5s y CLS < 0.1', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });
});
