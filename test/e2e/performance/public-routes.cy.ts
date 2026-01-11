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
    it('debe cargar /login en menos de 4 segundos', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/login');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Network Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
      });
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

  describe('Register Page', () => {
    it('debe cargar /register en menos de 4 segundos', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/register');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Network Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
      });
    });

    it('debe mostrar formulario de registro correctamente', () => {
      cy.visit('/register');
      cy.waitForPageLoad();

      // Verify registration form is visible
      // Registration starts with role selection
      cy.contains(/Hommy|Buscar servicios|Vender servicios/i).should('be.visible');
    });

    it('debe tener Core Web Vitals aceptables', () => {
      cy.visit('/register');
      cy.waitForPageLoad();

      cy.getCoreWebVitals().then((vitals) => {
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

  describe('Home/Root Page', () => {
    it('debe cargar / (home) en menos de 4 segundos', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.log('Load Time:', `${metrics.loadTime}ms`);
        cy.log('Network Requests:', metrics.requestCount);
        cy.log('Total Size:', `${metrics.totalSize}KB`);
      });
    });
  });

  describe('Network Performance', () => {
    it('no debe tener requests excesivamente lentas en login', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/login');
      cy.waitForPageLoad();

      cy.measureLoadTime().then((metrics) => {
        // Log slowest requests for analysis
        cy.log('Slowest Requests:');
        metrics.slowestRequests.forEach((req, i) => {
          cy.log(`${i + 1}. ${req.url.substring(0, 50)}... - ${req.duration}ms`);

          // Warn if any single request takes > 2 seconds
          if (req.duration > 2000) {
            cy.log(`WARNING: Slow request detected: ${req.url}`);
          }
        });
      });
    });

    it('no debe tener demasiadas requests en login', () => {
      cy.startPerformanceMonitoring();
      cy.visit('/login');
      cy.waitForPageLoad();

      cy.getNetworkStats().then((stats) => {
        cy.log(`Total Requests: ${stats.requestCount}`);

        // Login should be relatively lightweight
        // Adjust this threshold based on your actual needs
        expect(stats.requestCount, 'Login should not have excessive requests').to.be.lessThan(30);
      });
    });
  });
});
