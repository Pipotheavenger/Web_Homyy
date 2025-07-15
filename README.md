# 🏠 Hommy - Frontend

Aplicación web moderna para conectar usuarios con expertos del hogar, construida con Next.js 15, TypeScript y Supabase.

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   └── app/
│       ├── login/           # Página de autenticación
│       │   ├── page.tsx     # Componente principal de login
│       │   └── BgWave.tsx   # Componente de fondo animado
│       ├── layout.tsx       # Layout principal de la aplicación
│       ├── page.tsx         # Página principal (redirige a /login)
│       └── globals.css      # Estilos globales
├── public/
│   ├── Logo.svg            # Logo principal de Hommy
│   └── Logo.png            # Logo en formato PNG
├── package.json            # Dependencias y scripts
├── tailwind.config.js      # Configuración de Tailwind CSS
├── tsconfig.json           # Configuración de TypeScript
└── env.example             # Variables de entorno de ejemplo
```

## 🚀 Tecnologías Utilizadas

- **Next.js 15.3.5** - Framework de React con App Router
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript 5** - Tipado estático para JavaScript
- **Tailwind CSS 4** - Framework de CSS utility-first
- **Supabase** - Backend-as-a-Service para autenticación y base de datos

## 📦 Dependencias Principales

```json
{
  "@supabase/supabase-js": "^2.39.0",  // Cliente de Supabase
  "next": "15.3.5",                    // Framework de React
  "react": "^19.0.0",                  // Biblioteca de UI
  "react-dom": "^19.0.0",              // Renderizado de React
  "tailwindcss": "^4.1.11"             // Framework de CSS
}
```

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🎨 Componentes Principales

### `src/app/login/page.tsx`
**Propósito**: Página principal de autenticación
**Funcionalidades**:
- Formulario de login con email y contraseña
- Login con Google usando Supabase OAuth
- Validación de formularios en tiempo real
- Animaciones y efectos visuales
- Diseño responsive para móvil, tablet y desktop

**Conexiones**:
- Se conecta con Supabase para autenticación
- Usa el componente `BgWave` para el fondo
- Redirige a `/dashboard` después del login exitoso

### `src/app/login/BgWave.tsx`
**Propósito**: Componente de fondo animado
**Funcionalidades**:
- SVG animado con gradientes
- Formas redondeadas que salen desde las esquinas
- Completamente responsive
- Optimizado para rendimiento

**Conexiones**:
- Importado por `login/page.tsx`
- Usa CSS personalizado para animaciones

### `src/app/layout.tsx`
**Propósito**: Layout principal de la aplicación
**Funcionalidades**:
- Configuración de fuentes (Roboto)
- Metadatos de la aplicación
- Estructura HTML base
- Configuración de idioma (español)

**Conexiones**:
- Envuelve todas las páginas de la aplicación
- Importa `globals.css` para estilos globales

### `src/app/page.tsx`
**Propósito**: Página principal (redirección)
**Funcionalidades**:
- Redirige automáticamente a `/login`
- Muestra un spinner de carga durante la redirección
- Página temporal mientras se desarrolla el dashboard

**Conexiones**:
- Usa Next.js router para redirección
- Se ejecuta en el cliente (`'use client'`)

## 🎯 Flujo de Autenticación

1. **Usuario accede a la aplicación** → Redirigido a `/login`
2. **Página de login** → Muestra formulario y botón de Google
3. **Login con Google** → Usa Supabase OAuth
4. **Autenticación exitosa** → Redirigido a `/dashboard` (futuro)
5. **Manejo de errores** → Alertas informativas al usuario

## 🔒 Seguridad

- **Variables de entorno**: Configuración sensible en `.env.local`
- **Supabase**: Autenticación segura con OAuth
- **TypeScript**: Tipado estático para prevenir errores
- **Next.js**: Protección automática contra XSS

## 📱 Responsive Design

La aplicación está optimizada para:
- **Móvil**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🎨 Diseño y UX

- **Paleta de colores**: Púrpura y lavanda como colores principales
- **Tipografía**: Roboto para texto, Fredoka para títulos
- **Animaciones**: Transiciones suaves y efectos hover
- **Accesibilidad**: Contraste adecuado y navegación por teclado

## 🚀 Scripts Disponibles

```bash
npm run dev      # Desarrollo con Turbopack
npm run build    # Construcción para producción
npm run start    # Servidor de producción
npm run lint     # Verificación de código
```

## 🔄 Integración con Backend

El frontend está preparado para integrarse con:
- **Supabase**: Autenticación y base de datos
- **API REST**: Endpoints para funcionalidades adicionales
- **WebSockets**: Comunicación en tiempo real (futuro)

## 📈 Optimizaciones

- **Next.js 15**: App Router y optimizaciones automáticas
- **Turbopack**: Compilación rápida en desarrollo
- **Tailwind CSS 4**: CSS optimizado y purgado
- **TypeScript**: Detección temprana de errores
- **Imágenes optimizadas**: Next.js Image component

## 🛠️ Desarrollo

### Estructura de Carpetas Recomendada

```
src/
├── app/                    # App Router de Next.js
├── components/             # Componentes reutilizables (futuro)
├── lib/                    # Utilidades y configuraciones (futuro)
├── types/                  # Definiciones de TypeScript (futuro)
└── utils/                  # Funciones auxiliares (futuro)
```

### Convenciones de Código

- **Componentes**: PascalCase (`LoginPage.tsx`)
- **Archivos**: camelCase (`bgWave.tsx`)
- **Carpetas**: kebab-case (`login/`)
- **Variables**: camelCase (`userData`)
- **Constantes**: UPPER_SNAKE_CASE (`API_URL`)

## 🔮 Próximas Características

- [ ] Dashboard principal
- [ ] Perfil de usuario
- [ ] Búsqueda de expertos
- [ ] Sistema de chat
- [ ] Calificaciones y reseñas
- [ ] Página de registro
- [ ] Recuperación de contraseña
- [ ] Notificaciones push
