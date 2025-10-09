#!/usr/bin/env node

/**
 * Script para configurar las variables de entorno necesarias para MCP Server
 * Ejecutar: node scripts/setup-mcp-env.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupMCPEnvironment() {
  console.log('🔧 Configuración del MCP Server de Supabase\n');
  
  // Verificar si ya existe .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  const envExists = fs.existsSync(envPath);
  
  let envContent = '';
  
  if (envExists) {
    console.log('📄 Archivo .env.local encontrado, leyendo contenido existente...');
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  console.log('\n📝 Necesitamos configurar las siguientes variables para MCP Server:\n');
  
  // Variables necesarias para MCP
  const mcpVars = [
    {
      key: 'SUPABASE_PROJECT_REF',
      description: 'Referencia del proyecto (se encuentra en la URL del dashboard)',
      example: 'https://supabase.com/dashboard/project/TU_PROJECT_REF'
    },
    {
      key: 'SUPABASE_DB_PASSWORD',
      description: 'Contraseña de la base de datos de Supabase',
      example: 'Tu contraseña de DB'
    },
    {
      key: 'SUPABASE_REGION',
      description: 'Región del proyecto (opcional, por defecto: us-east-1)',
      example: 'us-east-1'
    },
    {
      key: 'SUPABASE_ACCESS_TOKEN',
      description: 'Token de acceso para la API de gestión (opcional)',
      example: 'Tu access token'
    }
  ];
  
  const newEnvVars = {};
  
  for (const varInfo of mcpVars) {
    console.log(`\n🔑 ${varInfo.key}`);
    console.log(`   Descripción: ${varInfo.description}`);
    console.log(`   Ejemplo: ${varInfo.example}`);
    
    const value = await question(`   Ingresa el valor (o presiona Enter para omitir): `);
    
    if (value.trim()) {
      newEnvVars[varInfo.key] = value.trim();
    }
  }
  
  // Agregar las nuevas variables al contenido existente
  let updatedContent = envContent;
  
  for (const [key, value] of Object.entries(newEnvVars)) {
    // Verificar si la variable ya existe
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(updatedContent)) {
      // Reemplazar valor existente
      updatedContent = updatedContent.replace(regex, `${key}=${value}`);
    } else {
      // Agregar nueva variable
      if (updatedContent && !updatedContent.endsWith('\n')) {
        updatedContent += '\n';
      }
      updatedContent += `\n# MCP Server Configuration\n${key}=${value}`;
    }
  }
  
  // Escribir el archivo actualizado
  fs.writeFileSync(envPath, updatedContent);
  
  console.log('\n✅ Variables de entorno configuradas en .env.local');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Ejecuta: python scripts/start-mcp-server.py');
  console.log('2. O usa el comando directo: supabase-mcp-server');
  console.log('3. Configura tu cliente MCP (como Cursor) para usar este servidor');
  
  rl.close();
}

setupMCPEnvironment().catch(console.error);

