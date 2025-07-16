#!/usr/bin/env node

/**
 * Script para verificar la configuración de Supabase
 * Ejecutar: node scripts/check-supabase-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de Supabase...\n');

// Verificar variables de entorno
const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ No se encontró el archivo .env.local');
  console.log('📝 Crea el archivo frontend/.env.local con:');
  console.log('');
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase');
  console.log('NEXT_PUBLIC_SITE_URL=http://localhost:3000');
  console.log('');
  process.exit(1);
}

// Leer variables de entorno
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Verificar variables requeridas
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let allVarsPresent = true;

requiredVars.forEach(varName => {
  if (!envVars[varName]) {
    console.log(`❌ Falta la variable: ${varName}`);
    allVarsPresent = false;
  } else {
    console.log(`✅ ${varName}: ${envVars[varName].substring(0, 20)}...`);
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Configuración incompleta');
  process.exit(1);
}

console.log('\n✅ Configuración de variables de entorno correcta');

// Verificar estructura de archivos
const requiredFiles = [
  'src/lib/supabase.ts',
  'src/app/auth/callback/page.tsx',
  'src/app/login/page.tsx',
  'src/app/register/page.tsx'
];

console.log('\n📁 Verificando archivos requeridos...');

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
  }
});

console.log('\n🎯 Pasos para completar la configuración:');
console.log('');
console.log('1. Ve a tu dashboard de Supabase');
console.log('2. Ir a Authentication > URL Configuration');
console.log('3. Agregar estas URLs de redirección:');
console.log('   - http://localhost:3000/auth/callback');
console.log('   - http://localhost:3000/login');
console.log('   - http://localhost:3000/register');
console.log('   - https://www.mcdonalds.com.co/');
console.log('');
console.log('4. Reinicia el servidor de desarrollo:');
console.log('   npm run dev');
console.log('');
console.log('5. Prueba el registro con un email real');
console.log('');
console.log('✅ ¡Listo para probar!'); 