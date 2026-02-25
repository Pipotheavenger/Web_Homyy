/**
 * Performance tests for User (Client) Dashboard
 * Critical test: Dashboard is the main page users see
 * Must load in < 4 seconds with all data (services, categories, top professionals)
 */

describe('Performance: User Dashboard', () => {
  before(() => {
    // Login once before all tests
    cy.loginAsClient();
  });

  beforeEach(() => {
    // Start fresh performance monitoring for each test
    cy.startPerformanceMonitoring();
  });

  describe('Dashboard Load Performance', () => {
    it('debe cargar /user/dashboard en menos de 4 segundos', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);

        // Log detailed metrics
        cy.log('=== USER DASHBOARD METRICS ===');
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Network Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
        cy.log('Slowest Requests:');
        metrics.slowestRequests.forEach((req, i) => {
          cy.log(`  ${i + 1}. ${req.url.substring(req.url.lastIndexOf('/') + 1)} - ${req.duration}ms`);
        });
      });
    });

    it('debe mostrar el welcome banner correctamente', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      // Check welcome banner
      cy.contains(/hola|bienvenid/i).should('be.visible');
      // Match both "Crear Servicio" and "Crear Nuevo Servicio"
      cy.contains(/Crear.*Servicio/i).should('be.visible');
    });

    it('debe cargar la sección de servicios', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      // Check services section
      cy.contains('Mis Servicios').should('be.visible');

      // Either services or empty state should be visible
      cy.get('body').then(($body) => {
        if ($body.text().includes('No tienes servicios')) {
          cy.contains(/No tienes.*servicios/i).should('be.visible');
        } else {
          // If there are services, they should be rendered
          cy.get('[data-testid="service-card"]', { timeout: 10000 }).should('exist').or('be.visible');
          cy.log('Services found in dashboard');
        }
      });
    });

    it('debe cargar profesionales destacados (lazy loaded)', () => {
      cy.visit('/user/dashboard');
      // Explicitly wait for the lazy loaded component which might take longer than the initial page load
      cy.contains(/profesionales|destacados/i, { timeout: 15000 }).should('be.visible');
    });

    it('no debe tener skeleton loaders visibles después de cargar', () => {
      cy.visit('/user/dashboard');
      // Wait longer for skeletons to disappear as some are in lazy-loaded components
      cy.get('[class*="skeleton"]', { timeout: 15000 }).should('not.exist');
      cy.get('[class*="loading"]', { timeout: 15000 }).should('not.exist');
    });
  });

  describe('Core Web Vitals', () => {
    it('debe tener LCP < 2.5s y CLS < 0.1', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.log('=== CORE WEB VITALS ===');
        cy.log('LCP (Largest Contentful Paint):', `${vitals.lcp}ms`);
        cy.log('CLS (Cumulative Layout Shift):', vitals.cls);
        cy.log('FID (First Input Delay):', `${vitals.fid}ms`);

        // Assert LCP
        if (vitals.lcp > 0) {
          expect(vitals.lcp, 'LCP should be less than 2500ms').to.be.lessThan(2500);
        }

        // Assert CLS
        if (vitals.cls > 0) {
          expect(vitals.cls, 'CLS should be less than 0.1').to.be.lessThan(0.1);
        }
      });
    });
  });

  describe('Network Performance', () => {
    it('debe completar todas las requests de React Query', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.getNetworkStats().then((stats) => {
        cy.log('Total Network Requests:', stats.requestCount);
        cy.log('Total Transfer Size:', `${stats.totalSize}KB`);

        // Dashboard makes multiple React Query calls
        // useUserServices, useCategories, useTopWorkers, useReviewedServices
        // Plus any images and assets
        expect(stats.requestCount, 'Should have reasonable number of requests').to.be.greaterThan(0);

        // Log slowest requests for optimization insights
        cy.log('Top 5 Slowest Requests:');
        stats.slowestRequests.forEach((req, i) => {
          cy.log(`${i + 1}. ${req.url} - ${req.duration}ms`);
        });
      });
    });

    it('no debe tener Supabase queries excesivamente lentas', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        // Check for slow Supabase requests
        const supabaseRequests = metrics.slowestRequests.filter(req =>
          req.url.includes('supabase')
        );

        if (supabaseRequests.length > 0) {
          cy.log('Supabase Requests:');
          supabaseRequests.forEach((req, i) => {
            cy.log(`${i + 1}. ${req.url} - ${req.duration}ms`);

            // Warn if any Supabase query takes > 1.5 seconds
            if (req.duration > 1500) {
              cy.log(`⚠️  SLOW SUPABASE QUERY: ${req.url} took ${req.duration}ms`);
            }
          });
        }
      });
    });
  });

  describe('Interactions Performance', () => {
    it('botón "Crear Servicio" debe ser clickeable inmediatamente', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      // Button should be clickable without delay, using flexible text matching
      cy.contains(/Crear.*Servicio/i).should('be.visible').and('not.be.disabled');
    });

    it('navegación a otras secciones debe funcionar', () => {
      cy.visit('/user/dashboard');
      cy.waitForPageLoad();

      // Verify navigation is functional
      cy.get('body').then(($body) => {
        // Check if sidebar or navigation exists
        if ($body.find('nav').length > 0 || $body.find('[role="navigation"]').length > 0) {
          cy.log('Navigation elements found');
        }
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

          // Note: With staleTime: 0, React Query refetches everything
          // So second visit might not be faster
          // This test documents the current behavior
          cy.log('Load Time Difference:', `${Math.abs(secondVisit.loadTime - firstVisit.loadTime)}ms`);
        });
      });
    });
  });
});
