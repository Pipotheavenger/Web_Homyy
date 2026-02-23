# Pruebas de Rendimiento con Cypress

Este directorio contiene pruebas de rendimiento automatizadas para medir objetivamente la velocidad de carga de todas las interfaces de Hommy Professional.

## Objetivo

Medir si cada página del proyecto carga completamente en **menos de 4 segundos**, incluyendo:
- ✅ Tiempo total de carga
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ Tiempo de respuesta de APIs
- ✅ Número y tamaño de requests
- ✅ Todas las requests de red finalizadas

## Estructura del Proyecto

```
test/
├── cypress.config.ts           # Configuración principal
├── tsconfig.json               # TypeScript config
├── fixtures/
│   ├── users.json              # Credenciales de usuarios de prueba
│   └── test-data.json          # Datos adicionales
├── support/
│   ├── auth.ts                 # Helpers de autenticación Supabase
│   ├── performance.ts          # Sistema de medición de rendimiento
│   ├── commands.ts             # Comandos personalizados
│   └── e2e.ts                  # Setup global
├── e2e/performance/
│   ├── public-routes.cy.ts     # Login, Register
│   ├── user-dashboard.cy.ts    # Dashboard cliente (CRÍTICO)
│   ├── worker-dashboard.cy.ts  # Dashboard trabajador (CRÍTICO)
│   ├── user-routes.cy.ts       # Rutas cliente
│   ├── worker-routes.cy.ts     # Rutas trabajador
│   ├── chats.cy.ts             # Mensajería
│   ├── professionals.cy.ts     # Búsqueda de profesionales
│   └── admin-routes.cy.ts      # Admin
└── reports/                    # Reportes generados
```

## Configuración Inicial

### 1. Instalar Dependencias

Las dependencias ya están instaladas si ejecutaste `npm install`. Si necesitas reinstalar:

```bash
npm install --save-dev cypress cypress-real-events start-server-and-test
```

### 2. Crear Usuarios de Prueba en Supabase

**IMPORTANTE:** Debes crear manualmente 3 usuarios de prueba en Supabase antes de ejecutar los tests.

#### A. Cliente de Prueba

```sql
-- 1. Crear usuario en Authentication
-- Email: test.client@hommy.test
-- Password: TestClient123!

-- 2. Insertar perfil en tabla profiles
INSERT INTO profiles (id, email, name, user_type, created_at, updated_at)
VALUES (
  '[ID_DEL_USUARIO_AUTH]',
  'test.client@hommy.test',
  'Cliente de Prueba',
  'client',
  NOW(),
  NOW()
);

-- 3. OPCIONAL: Crear 2-3 servicios de prueba para tener datos
INSERT INTO services (user_id, title, description, category_id, location, status, created_at)
VALUES
  ('[ID_DEL_USUARIO_AUTH]', 'Servicio de Prueba 1', 'Descripción', '[CATEGORY_ID]', 'Bogotá', 'active', NOW()),
  ('[ID_DEL_USUARIO_AUTH]', 'Servicio de Prueba 2', 'Descripción', '[CATEGORY_ID]', 'Bogotá', 'pending', NOW());
```

#### B. Trabajador de Prueba

```sql
-- 1. Crear usuario en Authentication
-- Email: test.worker@hommy.test
-- Password: TestWorker123!

-- 2. Insertar perfil en tabla profiles
INSERT INTO profiles (id, email, name, user_type, created_at, updated_at)
VALUES (
  '[ID_DEL_USUARIO_AUTH]',
  'test.worker@hommy.test',
  'Trabajador de Prueba',
  'worker',
  NOW(),
  NOW()
);

-- 3. Crear perfil profesional en tabla professionals
INSERT INTO professionals (user_id, bio, skills, hourly_rate, is_available, created_at)
VALUES (
  '[ID_DEL_USUARIO_AUTH]',
  'Profesional de prueba',
  ARRAY['Limpieza', 'Jardinería'],
  50000,
  true,
  NOW()
);

-- 4. OPCIONAL: Aplicar a 2-3 trabajos
INSERT INTO applications (worker_id, service_id, status, created_at)
VALUES
  ('[ID_DEL_USUARIO_AUTH]', '[SERVICE_ID_1]', 'pending', NOW()),
  ('[ID_DEL_USUARIO_AUTH]', '[SERVICE_ID_2]', 'accepted', NOW());
```

#### C. Admin de Prueba

```sql
-- 1. Crear usuario en Authentication
-- Email: test.admin@hommy.test
-- Password: TestAdmin123!

-- 2. Insertar perfil en tabla profiles
INSERT INTO profiles (id, email, name, user_type, created_at, updated_at)
VALUES (
  '[ID_DEL_USUARIO_AUTH]',
  'test.admin@hommy.test',
  'Admin de Prueba',
  'admin',
  NOW(),
  NOW()
);
```

### 3. Verificar Variables de Entorno

Asegúrate de que `.env.local` contenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kclglwxssvtwderrqgks.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Las pruebas leen estas variables automáticamente.

## Ejecutar Pruebas

### Modo Interactivo (Recomendado para desarrollo)

Abre la interfaz de Cypress para ver las pruebas en tiempo real:

```bash
npm run cypress:open
```

Luego selecciona los tests que quieres ejecutar.

### Modo Headless (Para CI/CD)

Ejecuta todas las pruebas sin interfaz gráfica:

```bash
npm run test:performance
```

Esto:
1. Inicia el servidor Next.js en modo desarrollo
2. Espera a que esté disponible en `http://localhost:3000`
3. Ejecuta todas las pruebas de Cypress
4. Cierra el servidor al terminar

### Otras Opciones

```bash
# Ver pruebas en navegador visible
npm run test:performance:headed

# Ejecutar en Chrome específicamente
npm run test:performance:chrome

# Generar reporte JSON
npm run test:performance:report
```

## Interpretar Resultados

### ✅ Prueba Exitosa

```
✓ debe cargar /user/dashboard en menos de 4 segundos (3850ms)
  === USER DASHBOARD METRICS ===
  Load Time: 3245ms
  Network Requests: 18
  Total Size: 456KB
  LCP: 1850ms
  CLS: 0.03
```

**Interpretación:**
- ✅ Carga total: 3.2 segundos (< 4s) ✓
- ✅ LCP: 1.85s (< 2.5s) ✓
- ✅ CLS: 0.03 (< 0.1) ✓
- 18 requests de red
- 456KB transferidos

### ❌ Prueba Fallida

```
✗ debe cargar /worker/trabajos en menos de 4 segundos (4500ms)
  AssertionError: expected 4500 to be less than 4000
  Load Time: 4500ms
  Slowest Requests:
    1. rest/v1/services - 2800ms
    2. storage/v1/object/public/images - 1200ms
```

**Interpretación:**
- ❌ Carga total: 4.5 segundos (> 4s) ✗
- Problema identificado: Query a `/services` tarda 2.8 segundos
- Acción: Optimizar query de Supabase o agregar índices

## Métricas Clave

### Tiempo de Carga Total

**Umbral:** < 4 segundos

**Qué mide:** Tiempo desde que se inicia la navegación hasta que:
- Todas las requests de red terminan
- No hay requests pendientes por 500ms consecutivos
- No hay skeleton loaders visibles

### Core Web Vitals

#### LCP (Largest Contentful Paint)
**Umbral:** < 2.5 segundos

**Qué mide:** Tiempo hasta que el contenido principal más grande es visible.

#### CLS (Cumulative Layout Shift)
**Umbral:** < 0.1

**Qué mide:** Estabilidad visual de la página (cuánto se mueven los elementos).

#### FID (First Input Delay)
**Umbral:** < 100ms

**Qué mide:** Tiempo hasta que la página responde a la primera interacción.
*Nota: En tests automatizados, FID es difícil de medir y puede aparecer como 0.*

### Requests de Red

**Qué mide:**
- Número total de peticiones HTTP/XHR
- Tamaño total transferido (KB)
- Las 5 requests más lentas

**Para qué sirve:**
- Identificar queries de Supabase lentas
- Detectar imágenes pesadas
- Encontrar requests innecesarias

## Rutas Probadas

### Rutas Públicas
- `/login` - Login page
- `/register` - Registration
- `/` - Home/Root

### Rutas de Cliente (User)
- `/user/dashboard` - Dashboard principal ⚠️ CRÍTICO
- `/user/crear-servicio` - Crear servicio
- `/user/profesionales` - Buscar profesionales
- `/user/perfil` - Perfil de usuario
- `/user/historial` - Historial de servicios
- `/user/notificaciones` - Notificaciones
- `/user/pagos` - Gestión de pagos
- `/user/chats` - Mensajería

### Rutas de Trabajador (Worker)
- `/worker/dashboard` - Dashboard trabajador ⚠️ CRÍTICO
- `/worker/trabajos` - Trabajos disponibles
- `/worker/perfil` - Perfil profesional
- `/worker/historial` - Historial de trabajos
- `/worker/pagos` - Ganancias
- `/worker/chats` - Mensajería

### Rutas de Admin
- `/admin/dashboard` - Panel de administración

**Total:** ~20+ rutas probadas

## Comandos Personalizados de Cypress

### Autenticación

```typescript
// Login como cliente
cy.loginAsClient();

// Login como trabajador
cy.loginAsWorker();

// Login como admin
cy.loginAsAdmin();

// Logout
cy.logout();
```

### Medición de Rendimiento

```typescript
// Iniciar monitoreo
cy.startPerformanceMonitoring();

// Esperar carga completa (máx 4s)
cy.waitForPageLoad(4000);

// Obtener métricas
cy.measureLoadTime().then((metrics) => {
  console.log(metrics.loadTime); // ms
  console.log(metrics.requestCount); // número
  console.log(metrics.totalSize); // KB
});

// Obtener Core Web Vitals
cy.getCoreWebVitals().then((vitals) => {
  console.log(vitals.lcp); // ms
  console.log(vitals.cls); // número
});

// Validar umbral de 4s
cy.assertPerformanceThreshold(metrics, 4000);
```

## Comparar Rendimiento Antes/Después

### 1. Ejecutar Baseline

Antes de hacer cambios, ejecuta las pruebas y guarda los resultados:

```bash
npm run test:performance:report
```

Esto genera `test/reports/results.json`.

### 2. Hacer Cambios de Optimización

Por ejemplo:
- Agregar índices a Supabase
- Optimizar queries de React Query
- Comprimir imágenes
- Lazy load de componentes

### 3. Ejecutar Nuevamente

```bash
npm run test:performance:report
```

### 4. Comparar

Compara los tiempos de carga:

```
ANTES:  /user/dashboard → 3800ms
DESPUÉS: /user/dashboard → 2900ms
MEJORA: -900ms (23% más rápido) ✓
```

## Troubleshooting

### Problema: "Usuario no autenticado"

**Causa:** Los usuarios de prueba no existen en Supabase.

**Solución:** Sigue la sección "Crear Usuarios de Prueba en Supabase" arriba.

### Problema: "Timeout: Page load exceeded 4000ms"

**Causa:** La página realmente tarda más de 4 segundos.

**Solución:**
1. Revisa los logs para identificar la request más lenta
2. Optimiza esa request (query, índice, caché, etc.)
3. Ejecuta nuevamente las pruebas

### Problema: Tests intermitentes (flaky)

**Causa:** Variabilidad en red o base de datos.

**Solución:**
- Las pruebas tienen 2 reintentos automáticos en modo CI
- Verifica conexión a internet estable
- Considera usar mocks para requests no críticas

### Problema: "ResizeObserver loop completed with undelivered notifications"

**Causa:** Error común en React apps, no afecta funcionalidad.

**Solución:** Ya está manejado en `support/e2e.ts`, se ignora automáticamente.

### Problema: Supabase rate limiting

**Causa:** Demasiadas requests en poco tiempo.

**Solución:**
- Ejecuta tests de a uno usando `cypress:open`
- Agrega delays entre tests en CI/CD
- Usa Supabase plan superior

## Mejores Prácticas

### 1. Ejecutar Tests Regularmente

```bash
# Antes de cada PR
npm run test:performance

# Después de optimizaciones
npm run test:performance:report
```

### 2. Mantener Datos de Prueba

- Los usuarios de prueba deben tener datos realistas
- Al menos 2-3 servicios para el cliente
- Al menos 2-3 aplicaciones para el trabajador
- Esto asegura que los tests midan rendimiento real

### 3. Monitorear Tendencias

Guarda los reportes JSON y compara a lo largo del tiempo:

```bash
# Guardar con fecha
npm run test:performance:report
cp test/reports/results.json test/reports/baseline-2026-01-11.json
```

### 4. Agregar Nuevas Rutas

Para agregar una nueva ruta:

1. Agrega el test en el archivo apropiado
2. Usa el template:

```typescript
it('debe cargar /nueva-ruta en menos de 4 segundos', () => {
  cy.startPerformanceMonitoring();
  cy.visit('/nueva-ruta');
  cy.waitForPageLoad(4000);

  cy.measureLoadTime().then((metrics) => {
    cy.assertPerformanceThreshold(metrics, 4000);
  });
});
```

## Preguntas Frecuentes

### ¿Por qué 4 segundos?

Es el umbral máximo aceptable para mantener la atención del usuario según estudios de UX.

### ¿Cómo se define "carga completa"?

Una página está completamente cargada cuando:
1. Todas las requests HTTP/XHR finalizaron
2. No hay requests pendientes por 500ms consecutivos
3. No hay skeleton loaders visibles
4. React Query no tiene queries en estado `loading`

### ¿Qué pasa si mi página tarda 4.1s?

El test falla. Debes optimizar la página o ajustar el umbral en `cypress.config.ts` (no recomendado).

### ¿Cómo optimizo una página lenta?

1. Identifica la request más lenta en los logs
2. Si es Supabase: agrega índices, reduce datos, usa select específico
3. Si es imagen: comprime, usa WebP, lazy load
4. Si es JavaScript: code splitting, lazy loading
5. Ejecuta tests nuevamente para validar

### ¿Puedo ejecutar solo un test específico?

Sí, en modo interactivo (`npm run cypress:open`) o:

```bash
npx cypress run --config-file test/cypress.config.ts --spec "test/e2e/performance/user-dashboard.cy.ts"
```

## Recursos Adicionales

- [Documentación de Cypress](https://docs.cypress.io)
- [Core Web Vitals](https://web.dev/vitals/)
- [Optimización de React Query](https://tanstack.com/query/latest/docs/react/guides/performance)
- [Optimización de Supabase](https://supabase.com/docs/guides/performance)

## Soporte

Si tienes problemas con las pruebas:

1. Revisa esta documentación
2. Verifica que los usuarios de prueba existen
3. Confirma que el servidor está corriendo
4. Revisa los logs de Cypress en `test/cypress/videos/` y `test/cypress/screenshots/`

---

**Última actualización:** 2026-01-11
