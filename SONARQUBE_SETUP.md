# 🔧 Configuración de SonarQube para Web Homyy

## ✅ Configuración completada

Tu proyecto ya está configurado con SonarCloud:

- **Project Key:** `hommy_hommy`
- **Organization:** `hommy`
- **URL:** `https://sonarcloud.io`

## 🚀 Cómo ejecutar SonarQube

### Opción 1: Usando npm (Más fácil)

```bash
npm run sonar
```

Este comando ejecutará el análisis con todas las credenciales configuradas.

### Opción 2: Usando variable de entorno (Más seguro)

1. **Configura la variable de entorno:**

**Windows PowerShell:**
```powershell
$env:SONAR_TOKEN="fc7fbb8edc0befafade0eff80805d0389421b368"
npm run sonar:env
```

**Windows CMD:**
```cmd
set SONAR_TOKEN=fc7fbb8edc0befafade0eff80805d0389421b368
npm run sonar:env
```

2. **Ejecuta:**
```bash
npm run sonar:env
```

### Opción 3: Ejecutar directamente con sonar-scanner

```bash
sonar-scanner \
  -Dsonar.token=fc7fbb8edc0befafade0eff80805d0389421b368 \
  -Dsonar.projectKey=hommy_hommy \
  -Dsonar.organization=hommy
```

## 📋 Ver los resultados

Una vez ejecutado, puedes ver los resultados en:
**https://sonarcloud.io/project/overview?id=hommy_hommy**

## 🔒 Seguridad del token

**⚠️ IMPORTANTE:** El token está actualmente en el `package.json`. Para mayor seguridad:

1. **Mueve el token a una variable de entorno:**
   - Crea un archivo `.env.local` (ya está en `.gitignore`)
   - Agrega: `SONAR_TOKEN=fc7fbb8edc0befafade0eff80805d0389421b368`
   - Usa `npm run sonar:env` en lugar de `npm run sonar`

2. **O usa el token directamente en el comando:**
   ```bash
   sonar-scanner -Dsonar.token=$env:SONAR_TOKEN
   ```

## 🛠️ Instalación de SonarQube Scanner

Si no tienes SonarQube Scanner instalado:

**Windows (Chocolatey):**
```bash
choco install sonarscanner-msbuild-net46
```

**O descarga manualmente:**
1. Ve a: https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/
2. Descarga el scanner para Windows
3. Extrae y agrega a tu PATH

**O usa npm global:**
```bash
npm install -g sonarqube-scanner
```

## 📝 Troubleshooting

### Error: "sonar-scanner: command not found"
- Instala SonarQube Scanner (ver arriba)
- O verifica que esté en tu PATH

### Error: "Unauthorized"
- Verifica que el token sea correcto
- Asegúrate de tener permisos en la organización `hommy`

### Error: "Project already exists"
- El proyecto ya existe en SonarCloud, esto es normal
- Los resultados se actualizarán en el mismo proyecto

## ✅ Ejecución rápida

```bash
# Simplemente ejecuta:
npm run sonar
```

Y espera a que termine el análisis. Los resultados aparecerán en SonarCloud.

