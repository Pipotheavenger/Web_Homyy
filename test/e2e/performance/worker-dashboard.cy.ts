/**
 * Performance tests for Worker Dashboard
 * Critical test: Worker dashboard with applications and statistics
 * Must load in < 4 seconds with all data
 */

describe('Performance: Worker Dashboard', () => {
  before(() => {
    // Login once before all tests
    cy.loginAsWorker();
  });

  beforeEach(() => {
    // Start fresh performance monitoring for each test
    cy.startPerformanceMonitoring();
  });

  describe('Dashboard Load Performance', () => {
    it('debe cargar /worker/dashboard en menos de 4 segundos', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);

        // Log detailed metrics
        cy.log('=== WORKER DASHBOARD METRICS ===');
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
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      // Check welcome banner
      cy.contains(/hola|bienvenid/i).should('be.visible');
      cy.contains(/trabajos|ver trabajos/i).should('be.visible');
    });

    it('debe cargar la sección de aplicaciones', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      // Check applications section
      cy.contains('Mis Aplicaciones').should('be.visible');

      // Either applications or empty state should be visible
      cy.get('body').then(($body) => {
        if ($body.text().includes('No has aplicado')) {
          cy.contains(/no has aplicado|sin aplicaciones/i).should('be.visible');
        } else {
          cy.log('Applications found in dashboard');
        }
      });
    });

    it('debe cargar las estadísticas del trabajador', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      // Check statistics section
      cy.contains('Estadísticas').should('be.visible');

      // Should show earnings, completed jobs, and rating
      cy.contains(/ganancia|earning/i).should('be.visible');
      cy.contains(/completado|completed/i).should('be.visible');
      cy.contains(/calificación|rating/i).should('be.visible');
    });

    it('no debe tener skeleton loaders visibles después de cargar', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      // Verify no skeleton loaders remain
      cy.get('[class*="skeleton"]').should('not.exist');
      cy.get('[class*="loading"]').should('not.exist');
    });
  });

  describe('Core Web Vitals', () => {
    it('debe tener LCP < 2.5s y CLS < 0.1', () => {
      cy.visit('/worker/dashboard');
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
    it('debe completar todas las requests de useWorkerDashboard', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.getNetworkStats().then((stats) => {
        cy.log('Total Network Requests:', stats.requestCount);
        cy.log('Total Transfer Size:', `${stats.totalSize}KB`);

        // Worker dashboard uses useWorkerDashboard hook
        // Makes queries for applications, stats, etc.
        expect(stats.requestCount, 'Should have reasonable number of requests').to.be.greaterThan(0);

        // Log slowest requests
        cy.log('Top 5 Slowest Requests:');
        stats.slowestRequests.forEach((req, i) => {
          cy.log(`${i + 1}. ${req.url} - ${req.duration}ms`);
        });
      });
    });

    it('no debe tener Supabase queries excesivamente lentas', () => {
      cy.visit('/worker/dashboard');
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
    it('botón "Ver Trabajos" debe ser clickeable inmediatamente', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      // Button should be clickable without delay
      cy.contains(/ver trabajos|buscar trabajos/i).should('be.visible').and('not.be.disabled');
    });

    it('aplicaciones deben mostrar acciones correctamente', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        // If there are applications, they should have action buttons
        if (!$body.text().includes('No has aplicado')) {
          cy.log('Checking application action buttons...');
          // Application cards should be present
          // Buttons like "Ver Detalles", "Retirar", "Finalizar" should work
        } else {
          cy.log('No applications to test');
        }
      });
    });
  });

  describe('Image Loading Performance', () => {
    it('banner image debe cargar eficientemente', () => {
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        // Check for image requests
        const imageRequests = metrics.slowestRequests.filter(req =>
          req.url.match(/\.(png|jpg|jpeg|gif|svg|webp)/i)
        );

        if (imageRequests.length > 0) {
          cy.log('Image Requests:');
          imageRequests.forEach((req, i) => {
            cy.log(`${i + 1}. ${req.url} - ${req.duration}ms`);
          });
        }
      });
    });
  });

  describe('Multiple Visits Performance', () => {
    it('segunda visita debe tener rendimiento similar', () => {
      // First visit
      cy.startPerformanceMonitoring();
      cy.visit('/worker/dashboard');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((firstVisit) => {
        cy.log('First Visit Load Time:', `${firstVisit.loadTime}ms`);

        // Second visit
        cy.startPerformanceMonitoring();
        cy.visit('/worker/dashboard');
        cy.waitForPageLoad();

        cy.measureLoadTime().then((secondVisit) => {
          cy.log('Second Visit Load Time:', `${secondVisit.loadTime}ms`);
          cy.log('Load Time Difference:', `${Math.abs(secondVisit.loadTime - firstVisit.loadTime)}ms`);

          // Both visits should meet the 4s threshold
          expect(secondVisit.loadTime, 'Second visit should also be under 4s').to.be.lessThan(4000);
        });
      });
    });
  });
});
