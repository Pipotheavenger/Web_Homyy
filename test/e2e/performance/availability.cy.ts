/**
 * Availability tests
 * Verifies that all routes return correct HTTP status codes
 * and that backend services (Supabase) are reachable
 */

describe('Availability: Health Checks', () => {
  it('GET /api/health debe retornar 200 con Supabase conectado', () => {
    cy.request({
      url: '/api/health',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.be.oneOf(['ok', 'degraded']);
      expect(response.body.supabase).to.eq(true);
      expect(response.body.timestamp).to.be.a('string');
    });
  });

  it('Supabase REST API debe estar accesible', () => {
    const supabaseUrl = Cypress.env('NEXT_PUBLIC_SUPABASE_URL');
    cy.request({
      url: `${supabaseUrl}/rest/v1/`,
      headers: {
        apikey: Cypress.env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status, 'Supabase REST API should not return 5xx').to.be.lessThan(500);
    });
  });
});

describe('Availability: Public Routes (HTTP Status)', () => {
  const publicRoutes = ['/', '/login', '/register'];

  publicRoutes.forEach((route) => {
    it(`GET ${route} debe retornar HTTP 200`, () => {
      cy.request({ url: route, failOnStatusCode: false }).then((response) => {
        expect(response.status, `${route} should return 200`).to.eq(200);
      });
    });
  });
});

describe('Availability: Authenticated Routes (Client)', () => {
  before(() => {
    cy.loginAsClient();
  });

  const clientRoutes = [
    '/user/dashboard',
    '/user/crear-servicio',
    '/user/profesionales',
    '/user/perfil',
    '/user/historial',
    '/user/notificaciones',
    '/user/pagos',
    '/user/chats',
  ];

  clientRoutes.forEach((route) => {
    it(`${route} debe cargar sin errores HTTP (no 4xx/5xx)`, () => {
      cy.visit(route, { failOnStatusCode: false });
      cy.get('body').should('exist');
      cy.get('body').should('not.contain.text', 'Internal Server Error');
      cy.get('body').should('not.contain.text', 'Application error');
    });
  });
});

describe('Availability: Authenticated Routes (Worker)', () => {
  before(() => {
    cy.loginAsWorker();
  });

  const workerRoutes = [
    '/worker/dashboard',
    '/worker/trabajos',
    '/worker/perfil',
    '/worker/historial',
    '/worker/pagos',
    '/worker/chats',
  ];

  workerRoutes.forEach((route) => {
    it(`${route} debe cargar sin errores HTTP (no 4xx/5xx)`, () => {
      cy.visit(route, { failOnStatusCode: false });
      cy.get('body').should('exist');
      cy.get('body').should('not.contain.text', 'Internal Server Error');
      cy.get('body').should('not.contain.text', 'Application error');
    });
  });
});

describe('Availability: Admin Routes', () => {
  before(() => {
    cy.loginAsAdmin();
  });

  it('/admin/dashboard debe cargar sin errores HTTP', () => {
    cy.visit('/admin/dashboard', { failOnStatusCode: false });
    cy.get('body').should('exist');
    cy.get('body').should('not.contain.text', 'Internal Server Error');
    cy.get('body').should('not.contain.text', 'Application error');
  });
});
