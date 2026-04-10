# Prompt para IA — Flujo teléfono primero (solo pantallas)

Copia el bloque siguiente y pégalo en el agente de IA.

---

```
Alcance estricto (obligatorio):
- No modificar absolutamente nada que no sea las pantallas listadas abajo.
- Prohibido: APIs (`route.ts`), hooks, `src/lib`, servicios (SNS, Supabase helpers), migraciones SQL, RLS, `Layout.tsx`, componentes en `@/components/ui` salvo lo que ya esté definido dentro de los archivos de pantalla permitidos, tests, configuración, ni ningún otro archivo del repositorio.
- Si hace falta lógica nueva para cumplir el objetivo y no cabe solo en estas pantallas, detén el trabajo y describe en un comentario al final del último archivo permitido qué archivo adicional sería necesario (sin crearlo ni editarlo).

Objetivo de producto (solo reflejado en UI de estas pantallas):
- Registro: el paso principal visible es el número de teléfono; flujo coherente con verificación por SMS/OTP en la medida en que la UI de estas páginas pueda enlazarlo (textos, pasos, orden de formularios, validación visual de campos obligatorios vacíos o inválidos en español).
- Login: pantalla de ingreso alineada a identificador por teléfono (no email) en etiquetas, placeholders y campos mostrados, más validación visual cuando falten datos obligatorios.
- Eliminar referencias a correo electrónico en textos, campos y mensajes de estas pantallas (incluido “confirmar email”, “revisa tu bandeja”, etc.) donde aparezcan en estos archivos.
- No introducir nuevas dependencias ni rutas.

Pantallas permitidas a editar (son las únicas rutas `page.tsx` del alcance; no hay más):

1. `src/app/register/page.tsx` — wizard de registro (usuario / trabajador).
2. `src/app/login/page.tsx` — inicio de sesión.
3. `src/app/auth/callback/page.tsx` — callback tras OAuth o verificación (mensajes y flujo visible).
4. `src/app/auth/reset-password/page.tsx` — recuperación / restablecimiento de contraseña (si la pantalla asume email, adaptar solo la UI dentro de este archivo al criterio teléfono o mensajes neutros, sin tocar el backend).

Criterio de validación en formularios (solo dentro de estos archivos):
- Mostrar errores claros cuando falten campos obligatorios o el formato no sea válido (teléfono, OTP si hay campo en la página, nombre, fechas, contraseñas, etc., según lo que cada pantalla exponga).
- No permitir avanzar o enviar desde la UI sin pasar validación local definida en el mismo archivo (estado + mensajes).

Entrega: diff únicamente en los cuatro archivos anteriores. Sin refactors colaterales. Sin cambiar estilos globales ni tokens de diseño salvo lo mínimo en esas páginas para los nuevos campos o textos.
```

---

## Referencia rápida (humanos)

| Ruta en el navegador | Archivo |
|----------------------|---------|
| `/register` | `src/app/register/page.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/auth/callback` | `src/app/auth/callback/page.tsx` |
| `/auth/reset-password` | `src/app/auth/reset-password/page.tsx` |
