#!/usr/bin/env node

/**
 * Script para enviar una notificación de prueba por WhatsApp
 * 
 * Uso:
 *   node scripts/test-whatsapp-notification.js <phoneNumber> [name]
 * 
 * Ejemplo:
 *   node scripts/test-whatsapp-notification.js 3001234567 SEBAS
 *   node scripts/test-whatsapp-notification.js +573001234567 SEBAS
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Leer variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let baseUrl = 'http://localhost:3000';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key.trim() === 'NEXT_PUBLIC_APP_URL' && value) {
        baseUrl = value;
      }
    }
  });
}

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = requestModule.request(requestOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function sendTestNotification(phoneNumber, name = 'Usuario') {
  try {
    console.log('📱 Enviando notificación de prueba por WhatsApp...');
    console.log('   Teléfono:', phoneNumber);
    console.log('   Nombre:', name);
    console.log('   URL:', `${baseUrl}/api/whatsapp/test`);
    console.log('');

    const response = await makeRequest(
      `${baseUrl}/api/whatsapp/test`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        phoneNumber: phoneNumber,
        name: name,
      }
    );

    if (response.status >= 400) {
      console.error('❌ Error:', response.data.error || 'Error desconocido');
      if (response.data.details) {
        console.error('   Detalles:', JSON.stringify(response.data.details, null, 2));
      }
      if (response.data.suggestion) {
        console.error('   Sugerencia:', response.data.suggestion);
      }
      process.exit(1);
    }

    console.log('✅ Notificación enviada exitosamente!');
    if (response.data.messageId) {
      console.log('   Message ID:', response.data.messageId);
    }
    if (response.data.data) {
      console.log('   Respuesta:', JSON.stringify(response.data.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`   Verifica que el servidor esté corriendo en ${baseUrl}`);
      console.error('   Ejecuta: npm run dev');
    }
    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('📱 Script de prueba de notificaciones WhatsApp');
  console.log('');
  console.log('Uso:');
  console.log('  node scripts/test-whatsapp-notification.js <phoneNumber> [name]');
  console.log('');
  console.log('Ejemplos:');
  console.log('  node scripts/test-whatsapp-notification.js 3001234567 SEBAS');
  console.log('  node scripts/test-whatsapp-notification.js +573001234567 SEBAS');
  console.log('');
  console.log('El número de teléfono será normalizado automáticamente.');
  console.log(`URL del servidor: ${baseUrl}`);
  process.exit(1);
}

const phoneNumber = args[0];
const name = args[1] || 'Usuario';

sendTestNotification(phoneNumber, name);
