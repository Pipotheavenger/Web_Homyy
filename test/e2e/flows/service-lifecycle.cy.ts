/**
 * Functional E2E Test: Complete Service Lifecycle
 *
 * Validates the full business flow:
 * 1. Client creates a service
 * 2. Worker applies to the service
 * 3. Client hires the worker
 * 4. Client and Worker exchange 3 chat messages
 * 5. Worker enters PIN to complete the service
 *
 * Uses existing test users:
 * - test.client@hommy.test (client)
 * - test.worker@hommy.test (worker)
 */

describe('Flujo Completo: Ciclo de Vida del Servicio', () => {
  // Shared state across ordered tests
  const testState: {
    clientUserId: string | null;
    workerUserId: string | null;
    serviceId: string | null;
    serviceTitle: string;
    completionPin: string | null;
    balanceTransactionId: string | null;
  } = {
    clientUserId: null,
    workerUserId: null,
    serviceId: null,
    serviceTitle: `[E2E Test] Limpieza ${Date.now()}`,
    completionPin: null,
    balanceTransactionId: null,
  };

  before(() => {
    // Get user IDs for later API operations
    cy.task('getUserIdByEmail', 'test.client@hommy.test').then((id) => {
      testState.clientUserId = id as string;
    });
    cy.task('getUserIdByEmail', 'test.worker@hommy.test').then((id) => {
      testState.workerUserId = id as string;
    });
  });

  after(() => {
    // Cleanup: remove all test data created during this run
    if (testState.serviceId) {
      cy.task('cleanupTestService', testState.serviceId);
    }
    if (testState.clientUserId) {
      cy.task('cleanupTestBalance', testState.clientUserId);
    }
  });

  // ============================================================
  // STEP 1: Client creates a service via UI
  // ============================================================
  it('Step 1: Cliente crea un servicio', () => {
    cy.loginAsClient();
    cy.visit('/user/crear-servicio');
    cy.url().should('include', '/crear-servicio');

    // Fill in the service form
    cy.get('input[placeholder="Ej: Limpieza general de casa"]').type(
      testState.serviceTitle
    );

    cy.get(
      'textarea[placeholder="Describe detalladamente el servicio que necesitas..."]'
    ).type(
      'Necesito una limpieza general de toda la casa, incluyendo cocina y baños. Test E2E automatizado.'
    );

    // Select the first available category from the dropdown
    cy.get('select').select(1);

    // Fill barrio
    cy.get('input[placeholder="Chapinero"]').clear().type('Chapinero');

    // Select a date: use native DOM API to bypass Cypress element wrapping
    // (Cypress internal visibility checks fail on React-rerendered calendar buttons)
    cy.wait(500);
    cy.window().then((win) => {
      const grids = win.document.querySelectorAll('[class*="grid-cols-7"]');
      for (const grid of Array.from(grids)) {
        const buttons = grid.querySelectorAll('button:not([disabled])');
        if (buttons.length > 0) {
          (buttons[buttons.length - 1] as HTMLButtonElement).click();
          return;
        }
      }
      throw new Error('No enabled calendar buttons found');
    });

    // Use the "Mañana" preset for quick time selection
    cy.contains('button', 'Mañana').click();

    // Click "Agregar Horario"
    cy.contains('button', 'Agregar Horario').click();

    // Verify the schedule was added (a schedule chip/tag should appear)
    cy.get('body').should('contain.text', ':');

    // Submit the form
    cy.get('button[type="submit"]').contains('Crear Servicio').click();

    // Assert success
    cy.contains('Servicio creado exitosamente', { timeout: 15000 }).should(
      'be.visible'
    );

    // Retrieve the created service ID from the database
    cy.wrap(null).then(() => {
      cy.task('getLastServiceByUser', testState.clientUserId).then(
        (service) => {
          const svc = service as { id: string; title: string; status: string };
          expect(svc).to.not.be.null;
          expect(svc.title).to.eq(testState.serviceTitle);
          testState.serviceId = svc.id;
          cy.log(`Service created: ${svc.id}`);
        }
      );
    });
  });

  // ============================================================
  // STEP 2: Worker applies to the service via UI
  // ============================================================
  it('Step 2: Worker se postula al servicio', () => {
    expect(testState.serviceId, 'Service ID should exist from Step 1').to.not.be
      .null;

    cy.loginAsWorker();
    cy.visit(`/worker/trabajos/${testState.serviceId}`);

    // Wait for the page to load and show the service
    cy.contains(testState.serviceTitle, { timeout: 10000 }).should(
      'be.visible'
    );

    // Click "Aplicar a este trabajo"
    cy.contains('button', 'Aplicar a este trabajo').click();

    // Modal "Establecer Precio" should appear
    cy.contains('Establecer Precio', { timeout: 5000 }).should('be.visible');

    // Fill in application details
    cy.get('input[type="number"][placeholder="0"]').type('150000');
    cy.get('input[placeholder="Ej: 3-4 horas, 2 días, etc."]').type(
      '3-4 horas'
    );
    cy.get('textarea[placeholder*="mejor para este trabajo"]').type(
      'Tengo amplia experiencia en limpieza profesional. Test E2E.'
    );

    // Submit the application
    cy.contains('button', 'Aplicar').click();

    // Assert success
    cy.contains('¡Aplicación Enviada!', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  // ============================================================
  // STEP 3: Client hires the worker via UI
  // ============================================================
  it('Step 3: Cliente contrata al worker', () => {
    expect(testState.serviceId, 'Service ID should exist from Step 1').to.not.be
      .null;

    // First, add balance for the client so the escrow transaction succeeds
    cy.task('addTestBalance', {
      userId: testState.clientUserId,
      amount: 500000,
    }).then((result) => {
      const tx = result as { id: string } | null;
      if (tx) testState.balanceTransactionId = tx.id;
    });

    cy.loginAsClient();
    cy.visit(`/user/detalles-postulantes?id=${testState.serviceId}`);

    // Wait for the page to load
    cy.contains('Postulantes', { timeout: 10000 }).should('be.visible');

    // Click "Seleccionar" on the applicant card
    cy.contains('button', 'Seleccionar', { timeout: 10000 }).click();

    // WorkerSelectionModal should appear
    cy.contains('Confirmar Selección', { timeout: 5000 }).should('be.visible');

    // Click "Confirmar"
    cy.contains('button', 'Confirmar').click();

    // Assert success
    cy.contains('¡Trabajador Seleccionado!', { timeout: 15000 }).should(
      'be.visible'
    );

    // Retrieve the completion PIN from the database
    cy.wrap(null).then(() => {
      cy.task('getCompletionPin', testState.serviceId).then((pin) => {
        expect(pin, 'Completion PIN should be generated').to.not.be.null;
        testState.completionPin = pin as string;
        cy.log(`Completion PIN: ${pin}`);
      });
    });
  });

  // ============================================================
  // STEP 4: Client and Worker exchange 3 messages via chat
  // ============================================================
  it('Step 4: Intercambio de 3 mensajes por chat', () => {
    expect(testState.serviceId, 'Service ID should exist').to.not.be.null;

    // --- Message 1: Client sends ---
    cy.loginAsClient();
    cy.visit('/user/chats');

    // Click on the chat (identified by service title)
    cy.contains(testState.serviceTitle, { timeout: 10000 }).click();

    // Wait for chat window to load
    cy.get('input[placeholder="Escribe un mensaje..."]', {
      timeout: 10000,
    }).should('be.visible');

    // Send message 1
    cy.get('input[placeholder="Escribe un mensaje..."]').type(
      'Hola, necesito confirmar la hora del servicio.'
    );
    cy.get('input[placeholder="Escribe un mensaje..."]').type('{enter}');

    // Assert message appears
    cy.contains('Hola, necesito confirmar la hora del servicio.', {
      timeout: 5000,
    }).should('be.visible');

    // --- Message 2: Worker sends ---
    cy.loginAsWorker();
    cy.visit('/worker/chats');

    // Click on the chat
    cy.contains(testState.serviceTitle, { timeout: 10000 }).click();

    // Wait for chat window
    cy.get('input[placeholder="Escribe un mensaje..."]', {
      timeout: 10000,
    }).should('be.visible');

    // Send message 2
    cy.get('input[placeholder="Escribe un mensaje..."]').type(
      'Puedo ir mañana a las 9am, ¿le sirve?'
    );
    cy.get('input[placeholder="Escribe un mensaje..."]').type('{enter}');

    // Assert message appears
    cy.contains('Puedo ir mañana a las 9am', { timeout: 5000 }).should(
      'be.visible'
    );

    // --- Message 3: Client sends ---
    cy.loginAsClient();
    cy.visit('/user/chats');

    // Click on the chat
    cy.contains(testState.serviceTitle, { timeout: 10000 }).click();

    // Wait for chat window
    cy.get('input[placeholder="Escribe un mensaje..."]', {
      timeout: 10000,
    }).should('be.visible');

    // Send message 3
    cy.get('input[placeholder="Escribe un mensaje..."]').type(
      'Perfecto, te espero a las 9am.'
    );
    cy.get('input[placeholder="Escribe un mensaje..."]').type('{enter}');

    // Assert message appears
    cy.contains('Perfecto, te espero a las 9am.', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  // ============================================================
  // STEP 5: Worker enters PIN to complete the service
  // ============================================================
  it('Step 5: Worker ingresa PIN para finalizar el servicio', () => {
    expect(testState.completionPin, 'PIN should exist from Step 3').to.not.be
      .null;

    cy.loginAsWorker();
    cy.visit('/worker/dashboard');

    // Wait for the dashboard to load
    cy.contains('Mis Aplicaciones', { timeout: 10000 }).should('be.visible');

    // Find the "Finalizar" button for our test service
    // The button appears when app.status === 'accepted'
    cy.contains('Finalizar', { timeout: 10000 }).click();

    // WorkCompletionModal should appear
    cy.contains('Finalizar Trabajo', { timeout: 5000 }).should('be.visible');

    // Enter PIN digit by digit (auto-advances focus)
    const pin = testState.completionPin!;
    cy.get('input[data-pin-index="0"]').type(pin[0]);
    cy.get('input[data-pin-index="1"]').type(pin[1]);
    cy.get('input[data-pin-index="2"]').type(pin[2]);
    cy.get('input[data-pin-index="3"]').type(pin[3]);

    // Click "Completar Trabajo"
    cy.contains('button', 'Completar Trabajo').click();

    // Assert success
    cy.contains('¡Trabajo Completado!', { timeout: 15000 }).should(
      'be.visible'
    );
  });
});
