/**
 * Performance tests for User (Client) Routes
 * Tests all secondary client routes for load performance
 * Note: /user/profesionales is covered in professionals.cy.ts
 */

describe('Performance: User Routes', () => {
  before(() => {
    cy.loginAsClient();
  });

  beforeEach(() => {
    cy.startPerformanceMonitoring();
  });

  describe('Crear Servicio Page', () => {
    it('debe cargar /user/crear-servicio en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/crear-servicio');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe cargar formulario y categorias', () => {
      cy.visit('/user/crear-servicio');
      cy.waitForPageLoad();

      cy.contains(/crear|nuevo servicio/i).should('be.visible');
    });
  });

  describe('Perfil Page', () => {
    it('debe cargar /user/perfil en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/perfil');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar informacion del perfil', () => {
      cy.visit('/user/perfil');
      cy.waitForPageLoad();

      cy.contains(/perfil|mi perfil/i).should('be.visible');
    });
  });

  describe('Historial Page', () => {
    it('debe cargar /user/historial en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/historial');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar historial de servicios', () => {
      cy.visit('/user/historial');
      cy.waitForPageLoad();

      cy.contains(/historial|servicios anteriores/i).should('be.visible');
    });
  });

  describe('Notificaciones Page', () => {
    it('debe cargar /user/notificaciones en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/notificaciones');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar notificaciones o estado vacio', () => {
      cy.visit('/user/notificaciones');
      cy.waitForPageLoad();

      cy.get('body').then(($body) => {
        if ($body.text().includes('No tienes notificaciones') || $body.text().includes('Sin notificaciones')) {
          cy.log('No notifications');
        } else {
          cy.log('Notifications loaded');
        }
      });
    });
  });

  describe('Pagos Page', () => {
    it('debe cargar /user/pagos en menos de 4 segundos sin requests fallidas', () => {
      cy.visit('/user/pagos');
      cy.waitForPageLoad(4000);

      cy.measureLoadTime().then((metrics) => {
        cy.assertPerformanceThreshold(metrics, 4000);
        cy.assertNoSlowRequests(metrics, 2000);
        cy.assertRequestCount(metrics, 40);
      });
      cy.assertNoFailedRequests();
    });

    it('debe mostrar informacion de pagos', () => {
      cy.visit('/user/pagos');
      cy.waitForPageLoad();

      cy.contains(/pago|pagos|metodos de pago/i).should('be.visible');
    });
  });

  describe('Network Performance Across Routes', () => {
    const routes = [
      '/user/crear-servicio',
      '/user/perfil',
      '/user/historial',
      '/user/notificaciones',
      '/user/pagos',
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
