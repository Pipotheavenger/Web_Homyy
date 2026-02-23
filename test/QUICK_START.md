# Quick Start - Pruebas de Rendimiento

## ⚡ Inicio Rápido (5 minutos)

### 1. Crear Usuarios de Prueba

**IMPORTANTE:** Antes de ejecutar los tests, crea estos usuarios en Supabase:

```
Cliente:    test.client@hommy.test  / TestClient123!
Trabajador: test.worker@hommy.test  / TestWorker123!
Admin:      test.admin@hommy.test   / TestAdmin123!
```

Ver instrucciones completas en `README.md` sección "Crear Usuarios de Prueba".

### 2. Ejecutar Tests

```bash
# Abrir interfaz de Cypress (recomendado para primera vez)
npm run cypress:open

# O ejecutar todos los tests
npm run test:performance
```

### 3. Ver Resultados

Los tests fallan si cualquier página tarda más de 4 segundos en cargar completamente.

**Ejemplo de resultado exitoso:**
```
✓ debe cargar /user/dashboard en menos de 4 segundos (3245ms)
  Load Time: 3245ms
  Requests: 18
  Size: 456KB
  LCP: 1850ms
```

## 📊 Qué Se Mide

- ✅ **Tiempo total de carga** (< 4 segundos)
- ✅ **Core Web Vitals** (LCP, FID, CLS)
- ✅ **Número de requests** de red
- ✅ **Tamaño total** transferido
- ✅ **Requests más lentas** (para identificar cuellos de botella)

## 📁 Archivos Creados

```
test/
├── cypress.config.ts          # Configuración
├── README.md                  # Documentación completa
├── QUICK_START.md            # Esta guía
├── fixtures/
│   └── users.json            # Credenciales de test
├── support/
│   ├── auth.ts               # Login con Supabase
│   ├── performance.ts        # Medición de métricas
│   ├── commands.ts           # Comandos custom
│   └── e2e.ts               # Setup global
└── e2e/performance/
    ├── public-routes.cy.ts   # Login, Register
    ├── user-dashboard.cy.ts  # Dashboard cliente
    ├── worker-dashboard.cy.ts # Dashboard trabajador
    ├── user-routes.cy.ts     # Otras rutas cliente
    ├── worker-routes.cy.ts   # Otras rutas trabajador
    ├── chats.cy.ts           # Mensajería
    ├── professionals.cy.ts   # Búsqueda
    └── admin-routes.cy.ts    # Admin
```

## 🎯 Rutas Probadas

**Total: 20+ rutas**

- Públicas: Login, Register, Home
- Cliente: Dashboard, Crear servicio, Profesionales, Perfil, Historial, Notificaciones, Pagos, Chats
- Trabajador: Dashboard, Trabajos, Perfil, Historial, Pagos, Chats
- Admin: Dashboard

## 🔧 Scripts Disponibles

```bash
# Interfaz interactiva
npm run cypress:open

# Ejecutar todos los tests
npm run test:performance

# Ver tests en navegador
npm run test:performance:headed

# Chrome específicamente
npm run test:performance:chrome

# Generar reporte JSON
npm run test:performance:report
```

## ❓ Problemas Comunes

### "Usuario no autenticado"
→ Crea los usuarios de prueba en Supabase (ver paso 1)

### "Page load timeout"
→ La página realmente tarda > 4s. Revisa los logs para identificar requests lentas.

### Tests intermitentes
→ Normal. Los tests tienen 2 reintentos automáticos.

## 📖 Documentación Completa

Ver `README.md` para:
- Instrucciones detalladas de setup
- Cómo interpretar resultados
- Cómo comparar rendimiento antes/después
- Troubleshooting avanzado
- Mejores prácticas

## 💡 Uso Recomendado

1. **Antes de optimizar:** Ejecuta tests y guarda resultados
2. **Haz cambios:** Optimiza queries, caché, imágenes, etc.
3. **Después de optimizar:** Ejecuta tests nuevamente
4. **Compara:** Verifica si hay mejora en los tiempos

## ✅ ¿Funcionó?

Si ves esto, ¡está todo listo!:

```bash
npm run cypress:open
```

Debería abrir la interfaz de Cypress mostrando todos los tests disponibles.

---

**Siguiente paso:** Lee `README.md` para documentación completa.
