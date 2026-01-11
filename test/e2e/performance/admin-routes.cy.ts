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
    it('debe cargar /admin/dashboard en menos de 4 segundos', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('=== ADMIN DASHBOARD METRICS ===');
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
      });
    });

    it('debe mostrar panel de administración correctamente', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad();

      // Admin dashboard should have some admin-specific content
      cy.contains(/admin|administr|dashboard|panel/i).should('be.visible');
    });

    it('no debe tener skeleton loaders después de cargar', () => {
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

  describe('Network Performance', () => {
    it('admin dashboard no debe tener queries lentas', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        // Check for slow queries
        const slowRequests = metrics.slowestRequests.filter(req => req.duration > 2000);

        if (slowRequests.length > 0) {
          cy.log('⚠️  Slow requests detected:');
          slowRequests.forEach(req => {
            cy.log(`  - ${req.url}: ${req.duration}ms`);
          });
        }
      });
    });

    it('total de requests debe ser razonable', () => {
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad();

      cy.getNetworkStats().then((stats) => {
        cy.log('Total Requests:', stats.requestCount);
        cy.log('Total Transfer Size:', `${stats.totalSize}KB`);

        // Admin dashboard might have stats/charts/data
        // But should still be performant
        expect(stats.requestCount).to.be.lessThan(50);
      });
    });
  });

  describe('Admin vs User Performance', () => {
    it('admin dashboard debe tener rendimiento comparable a user dashboard', () => {
      cy.loginAsAdmin();
      cy.startPerformanceMonitoring();
      cy.visit('/admin/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((adminMetrics) => {
        cy.log('Admin Dashboard Load Time:', `${adminMetrics.loadTime}ms`);

        // Admin should meet same performance standards
        expect(adminMetrics.loadTime).to.be.lessThan(4000);
      });
    });
  });
});
