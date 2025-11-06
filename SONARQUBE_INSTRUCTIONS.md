# 📊 Guía para Ejecutar SonarQube Manualmente

## Opciones para ejecutar SonarQube

### Opción 1: Usando el CLI de SonarQube (Recomendado)

#### Paso 1: Instalar SonarQube Scanner

**Windows:**
```bash
# Descargar SonarQube Scanner desde:
# https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/
# O usar Chocolatey:
choco install sonarscanner-msbuild-net46
```

**O usando npm (si tienes Node.js instalado):**
```bash
npm install -g sonarqube-scanner
```

#### Paso 2: Configurar variables de entorno (si es necesario)

Si usas SonarQube Cloud o un servidor remoto, configura las variables:

```bash
# Windows (PowerShell)
$env:SONAR_TOKEN="tu_token_de_sonarqube"
$env:SONAR_HOST_URL="https://tu-instancia.sonarcloud.io"  # Para SonarCloud
# O para servidor local:
$env:SONAR_HOST_URL="http://localhost:9000"

# Windows (CMD)
set SONAR_TOKEN=tu_token_de_sonarqube
set SONAR_HOST_URL=https://tu-instancia.sonarcloud.io
```

#### Paso 3: Ejecutar el análisis

**Método 1: Usando el script npm (más fácil)**
```bash
npm run sonar
```

**Método 2: Ejecutar directamente**
```bash
sonar-scanner
```

**Método 3: Para servidor local**
```bash
npm run sonar:local
```

### Opción 2: Usando Docker

Si tienes Docker instalado:

```bash
# Ejecutar SonarQube en un contenedor
docker run --rm \
  -v "%cd%":/usr/src \
  -w /usr/src \
  sonarsource/sonar-scanner-cli \
  sonar-scanner
```

### Opción 3: Usando SonarQube Cloud (SonarCloud)

Si estás usando SonarCloud:

1. **Obtén tu token:**
   - Ve a https://sonarcloud.io
   - Perfil → My Account → Security
   - Genera un token

2. **Configura las variables de entorno:**
```bash
# Windows PowerShell
$env:SONAR_TOKEN="tu_token_aqui"
$env:SONAR_HOST_URL="https://sonarcloud.io"

# Windows CMD
set SONAR_TOKEN=tu_token_aqui
set SONAR_HOST_URL=https://sonarcloud.io
```

3. **Ejecuta el análisis:**
```bash
sonar-scanner
```

### Opción 4: Usando un servidor SonarQube local

Si tienes SonarQube corriendo localmente:

1. **Inicia SonarQube:**
   ```bash
   # Si usas Docker
   docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
   ```

2. **Obtén el token:**
   - Ve a http://localhost:9000
   - Login (admin/admin por defecto)
   - Perfil → Security → Generate Token

3. **Ejecuta el análisis:**
```bash
sonar-scanner \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=tu_token_aqui
```

## Configuración del archivo sonar-project.properties

El archivo `sonar-project.properties` ya está configurado en la raíz del proyecto. Si necesitas personalizarlo:

```properties
# Clave única del proyecto
sonar.projectKey=web_homyy

# URL del servidor (opcional, puede venir de variables de entorno)
sonar.host.url=http://localhost:9000

# Token de autenticación (NUNCA lo pongas aquí, usa variables de entorno)
# sonar.login=tu_token
```

## Ver los resultados

- **SonarCloud:** https://sonarcloud.io → Tu proyecto
- **Servidor local:** http://localhost:9000 → Tu proyecto

## Troubleshooting

### Error: "sonar-scanner: command not found"
- Instala SonarQube Scanner (ver Opción 1)
- O usa `npx sonarqube-scanner` si está instalado via npm

### Error: "Unauthorized"
- Verifica que tu token sea correcto
- Asegúrate de tener permisos en el proyecto

### Error: "Project already exists"
- El proyecto ya existe en SonarQube
- Puedes cambiar `sonar.projectKey` o usar el mismo proyecto

## Ejecución rápida

```bash
# 1. Asegúrate de tener las variables de entorno configuradas
# 2. Ejecuta:
npm run sonar

# O directamente:
sonar-scanner
```

