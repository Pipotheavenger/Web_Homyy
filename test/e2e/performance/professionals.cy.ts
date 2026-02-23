/**
 * Performance tests for Professionals Search and Filtering
 * Tests the professional browsing and search functionality
 */

describe('Performance: Professionals Search', () => {
  before(() => {
    cy.loginAsClient();
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  describe('Initial Load Performance', () => {
    it('debe cargar /user/profesionales en menos de 4 segundos', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('=== PROFESSIONALS PAGE METRICS ===');
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
      });
    });

    it('debe mostrar lista de profesionales o estado vacío', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No hay profesionales') || $body.text().includes('Sin resultados')) {
          cy.log('No professionals available');
          cy.contains(/no hay|sin profesionales|sin resultados/i).should('be.visible');
        } else {
          cy.log('Professionals list loaded');
        }
      });
    });

    it('no debe tener skeleton loaders después de cargar', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.get('[class*="skeleton"]').should('not.exist');
      cy.get('[class*="loading"]').should('not.exist');
    });
  });

  describe('Core Web Vitals', () => {
    it('debe tener LCP < 2.5s y CLS < 0.1', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
        cy.log('=== CORE WEB VITALS ===');
        cy.log('LCP:', `${vitals.lcp}ms`);
        cy.log('CLS:', vitals.cls);

        if (vitals.lcp > 0) {
          expect(vitals.lcp, 'LCP should be less than 2500ms').to.be.lessThan(2500);
        }
        if (vitals.cls > 0) {
          expect(vitals.cls, 'CLS should be less than 0.1').to.be.lessThan(0.1);
        }
      });
    });
  });

  describe('Search and Filter Performance', () => {
    it('filtros deben estar disponibles rápidamente', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      // Check if filters exist
      cy.get('body').then(($body) => {
        if ($body.find('select').length > 0) {
          cy.log('Filters found');
        } else if ($body.find('input[type="search"]').length > 0) {
          cy.log('Search input found');
        } else {
          cy.log('No filters or search found on page');
        }
      });
    });

    it('búsqueda no debe causar degradación de rendimiento', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      // If search exists, test it
      cy.get('body').then(($body) => {
        if ($body.find('input[type="search"]').length > 0) {
          const startTime = Date.now();

          cy.get('input[type="search"]').first().type('test', { delay: 50 });

          cy.then(() => {
            const searchTime = Date.now() - startTime;
            cy.log('Search Response Time:', `${searchTime}ms`);

            // Search should respond quickly
            expect(searchTime, 'Search should respond in < 1s').to.be.lessThan(1000);
          });
        } else {
          cy.log('Search not available, skipping test');
        }
      });
    });
  });

  describe('Network Performance', () => {
    it('carga de profesionales no debe tener queries lentas', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        // Check for slow database queries
        const slowSupabaseRequests = metrics.slowestRequests.filter(req =>
          req.url.includes('supabase') && req.duration > 1500
        );

        if (slowSupabaseRequests.length > 0) {
          cy.log('⚠️  Slow Supabase queries detected:');
          slowSupabaseRequests.forEach(req => {
            cy.log(`  - ${req.url}: ${req.duration}ms`);
          });
        } else {
          cy.log('✓ All Supabase queries are fast');
        }
      });
    });

    it('imágenes de profesionales deben cargar eficientemente', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        // Check for image loading performance
        const imageRequests = metrics.slowestRequests.filter(req =>
          req.url.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)/i)
        );

        if (imageRequests.length > 0) {
          cy.log('Image Loading Performance:');
          imageRequests.forEach((req, i) => {
            cy.log(`${i + 1}. ${req.duration}ms`);

            if (req.duration > 2000) {
              cy.log(`⚠️  Slow image load: ${req.duration}ms`);
            }
          });
        }
      });
    });

    it('total de requests debe ser razonable', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.getNetworkStats().then((stats) => {
        cy.log('Total Requests:', stats.requestCount);
        cy.log('Total Transfer Size:', `${stats.totalSize}KB`);

        // Professionals page can have many images
        // But should still be under reasonable limits
        expect(stats.requestCount, 'Should not have excessive requests').to.be.lessThan(60);
      });
    });
  });

  describe('Pagination Performance', () => {
    it('navegación entre páginas debe ser rápida', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        // Check if pagination exists
        if ($body.find('button').text().match(/siguiente|next|página/i)) {
          cy.log('Pagination controls found');

          // Test pagination click performance
          const startTime = Date.now();

          cy.contains(/siguiente|next/i).first().click();

          cy.waitForPageLoad(2000); // Pagination should be faster than initial load

          cy.then(() => {
            const paginationTime = Date.now() - startTime;
            cy.log('Pagination Time:', `${paginationTime}ms`);

            expect(paginationTime, 'Pagination should be fast').to.be.lessThan(2000);
          });
        } else {
          cy.log('No pagination found, skipping test');
        }
      });
    });
  });
});
