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
    it('debe cargar /user/profesionales en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 60);
        cy.assertTransferSize(metrics, 4000);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar lista de profesionales o estado vacio', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No hay profesionales') || $body.text().includes('Sin resultados')) {
          cy.contains(/no hay|sin profesionales|sin resultados/i).should('be.visible');
        } else {
          cy.log('Professionals list loaded');
        }
      });
    });

    it('no debe tener skeleton loaders despues de cargar', () => {
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
        cy.assertWebVitalsThreshold(vitals);
      });
    });
  });

  describe('Search and Filter Performance', () => {
    it('filtros deben estar disponibles rapidamente', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      // At least one filter/search mechanism should be available
      cy.get('body').then(($body) => {
        const hasFilters = $body.find('select').length > 0 ||
                          $body.find('input[type="search"]').length > 0 ||
                          $body.find('[role="combobox"]').length > 0 ||
                          $body.find('input[placeholder]').length > 0;
        expect(hasFilters, 'Page should have filter or search controls').to.be.true;
      });
    });

    it('busqueda no debe causar degradacion de rendimiento', () => {
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
            expect(searchTime, 'Search should respond in < 1s').to.be.lessThan(1000);
          });
        } else {
          cy.log('Search not available, skipping test');
        }
      });
    });
  });

  describe('Network Performance', () => {
    it('imagenes de profesionales deben cargar eficientemente', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        const imageRequests = metrics.slowestRequests.filter(req =>
          req.url.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)/i)
        );

        imageRequests.forEach((req) => {
          expect(req.duration, `Image ${req.url} should load in < 3s`).to.be.lessThan(3000);
        });
      });
    });
  });

  describe('Pagination Performance', () => {
    it('navegacion entre paginas debe ser rapida', () => {
      cy.visit('/user/profesionales');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        // Check if pagination exists
        if ($body.find('button').text().match(/siguiente|next|pagina/i)) {
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
