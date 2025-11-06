# 📚 Guía Detallada: Configuración de SonarQube

## 🎯 Objetivo de esta guía

Esta guía explica paso a paso cómo configuré SonarQube en tu proyecto, para que entiendas cada componente y puedas replicarlo o modificarlo en el futuro.

---

## 📋 1. Entendiendo SonarQube

### ¿Qué es SonarQube?
SonarQube es una herramienta de análisis de código que:
- Detecta bugs, vulnerabilidades y code smells
- Mide la calidad del código
- Genera reportes y métricas
- Ayuda a mantener estándares de código

### SonarCloud vs SonarQube Server
- **SonarCloud**: Versión cloud (gratis para proyectos open source)
- **SonarQube Server**: Instalación local (requiere servidor propio)

**Tu proyecto usa SonarCloud** (cloud.sonarqube.org)

---

## 🔧 2. Componentes de la Configuración

### A. Archivo `sonar-project.properties`

Este es el archivo principal de configuración. SonarQube lo lee automáticamente para saber:
- Qué proyecto analizar
- Dónde están los archivos
- Qué excluir
- Cómo conectarse al servidor

#### Estructura del archivo:

```properties
# ============================================
# IDENTIFICACIÓN DEL PROYECTO
# ============================================
sonar.projectKey=hommy_hommy
sonar.projectName=Web Homyy
sonar.projectVersion=1.0
sonar.organization=hommy
```

**Explicación:**
- `projectKey`: Identificador único del proyecto en SonarCloud (como un ID)
- `projectName`: Nombre que se muestra en la interfaz
- `projectVersion`: Versión del proyecto
- `organization`: Organización en SonarCloud (equivalente a un usuario o grupo)

```properties
# ============================================
# CONEXIÓN AL SERVIDOR
# ============================================
sonar.host.url=https://sonarcloud.io
```

**Explicación:**
- `host.url`: URL del servidor de SonarQube
- Para SonarCloud siempre es `https://sonarcloud.io`
- Para servidor local sería `http://localhost:9000`

```properties
# ============================================
# RUTAS DE CÓDIGO FUENTE
# ============================================
sonar.sources=src
sonar.sourceEncoding=UTF-8
```

**Explicación:**
- `sources`: Carpeta donde está tu código fuente
- `sourceEncoding`: Codificación de caracteres (UTF-8 para español y caracteres especiales)
- **IMPORTANTE**: No incluimos `sonar.tests` porque no hay tests separados

**¿Por qué no `sonar.tests=src`?**
Si configuraras `sonar.tests=src`, SonarQube trataría TODOS los archivos de `src` como:
- Archivos fuente (porque `sources=src`)
- Archivos de prueba (porque `tests=src`)

Esto causa el error: "File can't be indexed twice"

**Solución:** Solo define `sonar.tests` si tienes una carpeta separada para tests, ejemplo:
```properties
sonar.sources=src
sonar.tests=src/test  # Solo si existe esta carpeta
```

```properties
# ============================================
# EXCLUSIONES E INCLUSIONES
# ============================================
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/build/**,**/coverage/**,**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/scripts/**
sonar.inclusions=**/*.ts,**/*.tsx,**/*.js,**/*.jsx
```

**Explicación:**

**Exclusions (archivos a ignorar):**
- `**/node_modules/**` - Dependencias de npm
- `**/dist/**` - Archivos compilados
- `**/.next/**` - Build de Next.js
- `**/build/**` - Archivos de build
- `**/coverage/**` - Reportes de cobertura
- `**/*.test.ts` - Archivos de test TypeScript
- `**/*.test.tsx` - Archivos de test React
- `**/*.spec.ts` - Archivos spec TypeScript
- `**/*.spec.tsx` - Archivos spec React
- `**/scripts/**` - Carpeta de scripts (no es código de producción)

**Inclusions (solo analizar estos tipos):**
- `**/*.ts` - TypeScript
- `**/*.tsx` - TypeScript React
- `**/*.js` - JavaScript
- `**/*.jsx` - JavaScript React

**Patrón `**`:**
- `**` significa "cualquier carpeta y subcarpetas"
- `**/*.ts` = "cualquier archivo .ts en cualquier nivel"

```properties
# ============================================
# REPORTES OPCIONALES
# ============================================
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.eslint.reportPaths=eslint-report.json
```

**Explicación:**
- Estos son opcionales, solo si generas reportes de cobertura o ESLint
- Si no los tienes, SonarQube simplemente los ignora

---

## 🔐 3. Manejo de Credenciales y Variables de Entorno

### ¿Por qué usar variables de entorno?

**Problema de seguridad:**
Si guardas el token directamente en archivos que se suben a Git:
- ❌ Cualquiera con acceso al repo puede verlo
- ❌ Si el repo es público, el token está expuesto
- ❌ Si alguien roba el token, puede analizar tu código sin permiso

**Solución: Variables de entorno**
- ✅ El token no está en el código
- ✅ Cada desarrollador usa su propio token
- ✅ Se puede revocar fácilmente sin afectar el código

### Opciones de Configuración del Token

#### Opción 1: Directamente en el comando (Simple, pero menos seguro)

```bash
sonar-scanner -Dsonar.token=tu_token_aqui
```

**Ventajas:**
- ✅ Fácil de usar
- ✅ No requiere configuración adicional

**Desventajas:**
- ❌ El token aparece en el historial de comandos
- ❌ Si alguien ve tu terminal, ve el token
- ❌ No es ideal para CI/CD

#### Opción 2: Variable de entorno (Recomendado)

**Windows PowerShell:**
```powershell
# Configurar variable (sesión actual)
$env:SONAR_TOKEN="fc7fbb8edc0befafade0eff80805d0389421b368"

# Ejecutar
sonar-scanner
```

**Windows CMD:**
```cmd
set SONAR_TOKEN=fc7fbb8edc0befafade0eff80805d0389421b368
sonar-scanner
```

**Linux/Mac:**
```bash
export SONAR_TOKEN="fc7fbb8edc0befafade0eff80805d0389421b368"
sonar-scanner
```

**Ventajas:**
- ✅ El token no aparece en el comando
- ✅ Se puede usar en scripts
- ✅ Más seguro

**Desventajas:**
- ⚠️ Se pierde al cerrar la terminal
- ⚠️ Hay que configurarlo cada vez

#### Opción 3: Archivo .env.local (Más seguro y permanente)

**Crear archivo `.env.local`:**
```bash
SONAR_TOKEN=fc7fbb8edc0befafade0eff80805d0389421b368
```

**Cargar en el script:**
```bash
# Windows PowerShell
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}
```

**Ventajas:**
- ✅ Persistente
- ✅ No se sube a Git (si está en .gitignore)
- ✅ Fácil de compartir con el equipo

**Desventajas:**
- ⚠️ Requiere script adicional para cargar

#### Opción 4: En package.json (Lo que tenemos ahora)

```json
"scripts": {
  "sonar": "sonar-scanner -Dsonar.token=fc7fbb8edc0befafade0eff80805d0389421b368"
}
```

**Ventajas:**
- ✅ Muy fácil de usar: `npm run sonar`
- ✅ No requiere configuración adicional

**Desventajas:**
- ❌ El token está visible en el código
- ❌ Si alguien ve el repo, ve el token
- ❌ **NO recomendado para repos públicos**

**Mejora recomendada:**
Usar variable de entorno incluso en package.json:

```json
"scripts": {
  "sonar": "sonar-scanner -Dsonar.token=%SONAR_TOKEN%"
}
```

Luego configurar la variable antes de ejecutar:
```bash
set SONAR_TOKEN=tu_token
npm run sonar
```

---

## 📁 4. Configuración de .gitignore

### ¿Por qué ignorar ciertos archivos?

**Archivos que NO deben subirse a Git:**
- `.scannerwork/` - Archivos temporales de SonarQube
- `.sonarqube/` - Cache de SonarQube
- `sonar-project.properties` - **DEPENDE**: Si tiene tokens, NO subirlo

**En tu proyecto:**
```gitignore
# SonarQube
.scannerwork/
.sonarqube/
```

**¿Por qué NO ignorar `sonar-project.properties`?**
- ✅ No contiene tokens (los tokens están en el comando o variables)
- ✅ Es útil para el equipo (todos saben la configuración)
- ✅ Se puede compartir sin problemas

**Si tuvieras tokens en el archivo:**
```gitignore
sonar-project.properties  # Ignorar si contiene tokens
```

---

## 🚀 5. Scripts de npm

### Configuración en package.json

```json
{
  "scripts": {
    "sonar": "sonar-scanner -Dsonar.token=fc7fbb8edc0befafade0eff80805d0389421b368",
    "sonar:env": "sonar-scanner -Dsonar.token=%SONAR_TOKEN%"
  }
}
```

**Explicación:**

**Script `sonar`:**
- Ejecuta `sonar-scanner` con el token directamente
- Uso: `npm run sonar`
- **Nota**: El token está visible en el código

**Script `sonar:env`:**
- Usa la variable de entorno `SONAR_TOKEN`
- Uso: `set SONAR_TOKEN=tu_token && npm run sonar:env`
- **Más seguro**: El token no está en el código

**Cómo funcionan los scripts npm:**
1. `npm run sonar` busca en `package.json` → `scripts.sonar`
2. Ejecuta el comando que está ahí
3. Reemplaza variables si es necesario

---

## 🔍 6. Flujo Completo de Ejecución

### Paso a paso cuando ejecutas `npm run sonar`:

1. **npm lee package.json**
   ```
   "sonar": "sonar-scanner -Dsonar.token=fc7fbb8edc0befafade0eff80805d0389421b368"
   ```

2. **Se ejecuta sonar-scanner**
   - Busca el archivo `sonar-project.properties` en la raíz
   - Lee todas las configuraciones

3. **SonarQube lee la configuración**
   ```
   sonar.projectKey=hommy_hommy
   sonar.organization=hommy
   sonar.host.url=https://sonarcloud.io
   sonar.sources=src
   ```

4. **Se conecta a SonarCloud**
   - URL: `https://sonarcloud.io`
   - Token: `fc7fbb8edc0befafade0eff80805d0389421b368`
   - Organización: `hommy`
   - Proyecto: `hommy_hommy`

5. **Escanea los archivos**
   - Lee `src/**/*.ts`
   - Lee `src/**/*.tsx`
   - Ignora `node_modules`, `.next`, etc.

6. **Analiza el código**
   - Detecta bugs
   - Encuentra code smells
   - Mide complejidad
   - Calcula métricas

7. **Sube los resultados**
   - Envía los datos a SonarCloud
   - Actualiza el dashboard

8. **Muestra resultados**
   - Puedes verlos en: https://sonarcloud.io/project/overview?id=hommy_hommy

---

## 🛠️ 7. Resolución del Error que Tuviste

### Error original:
```
[ERROR] File src/app/admin/dashboard/page.tsx can't be indexed twice
```

### Causa:
```properties
sonar.sources=src    # ← Archivos como FUENTE
sonar.tests=src      # ← Archivos como TEST
                     # ¡Mismo archivo indexado dos veces!
```

### Solución:
```properties
sonar.sources=src    # Solo fuentes
# sonar.tests=src    # ← Comentado/eliminado
```

### Regla importante:
**`sonar.sources` y `sonar.tests` deben ser DISJUNTOS**
- ✅ `sources=src` y `tests=src/test` → OK (diferentes)
- ❌ `sources=src` y `tests=src` → ERROR (mismo)

---

## 📝 8. Mejores Prácticas

### ✅ Hacer:
1. **Usar variables de entorno para tokens**
2. **Ignorar archivos temporales** (`.scannerwork/`)
3. **Excluir dependencias** (`node_modules/`)
4. **Excluir builds** (`.next/`, `dist/`)
5. **Documentar la configuración**

### ❌ Evitar:
1. **Hardcodear tokens en archivos públicos**
2. **Incluir archivos de test en sources**
3. **Subir archivos temporales a Git**
4. **Analizar dependencias externas**
5. **Configurar sources y tests iguales**

---

## 🎓 9. Comandos Útiles

### Verificar configuración:
```bash
# Ver qué archivos se incluirán
sonar-scanner -Dsonar.scanner.dumpToFile=sonar-scanner-dump.txt
```

### Ejecutar solo validación (sin subir):
```bash
sonar-scanner -Dsonar.analysis.mode=preview
```

### Ver logs detallados:
```bash
sonar-scanner -X  # Modo verbose
```

---

## 🔗 10. Recursos Adicionales

- **Documentación oficial**: https://docs.sonarsource.com/sonarqube/
- **SonarCloud**: https://sonarcloud.io
- **Patrones de exclusión**: https://docs.sonarsource.com/sonarqube/latest/project-administration/narrowing-the-focus/

---

## ✅ Resumen

1. **sonar-project.properties**: Configuración del proyecto
2. **Token**: Usa variables de entorno cuando sea posible
3. **.gitignore**: Ignora archivos temporales
4. **package.json**: Scripts para facilitar ejecución
5. **sources vs tests**: Deben ser disjuntos

¿Preguntas? ¡Ahora eres un experto en SonarQube! 🎉

