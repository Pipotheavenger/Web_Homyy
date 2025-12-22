const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno desde .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl, supabaseServiceKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
  
  supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
  supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
} else {
  // Intentar desde variables de entorno del sistema
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('Necesitas configurar en .env.local:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Archivos a subir
const assets = [
  { localPath: 'public/Logo.svg', storagePath: 'Logo.svg' },
  { localPath: 'public/Logo.png', storagePath: 'Logo.png' },
  { localPath: 'public/Banner.png', storagePath: 'Banner.png' },
  { localPath: 'public/nequi.jpg', storagePath: 'nequi.jpg' },
];

async function uploadAssets() {
  console.log('🚀 Iniciando subida de assets a Supabase Storage...\n');

  // Verificar o crear bucket
  const bucketName = 'assets';
  
  try {
    // Intentar listar buckets para verificar si existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error al listar buckets:', listError);
      throw listError;
    }

    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creando bucket "${bucketName}"...`);
      const { data: bucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Error al crear bucket:', createError);
        throw createError;
      }
      console.log('✅ Bucket creado exitosamente\n');
    } else {
      console.log(`✅ Bucket "${bucketName}" ya existe\n`);
    }

    // Subir archivos
    const results = [];
    
    for (const asset of assets) {
      const fullLocalPath = path.join(process.cwd(), asset.localPath);
      
      if (!fs.existsSync(fullLocalPath)) {
        console.warn(`⚠️  Archivo no encontrado: ${asset.localPath}`);
        continue;
      }

      console.log(`📤 Subiendo ${asset.localPath}...`);
      
      const fileBuffer = fs.readFileSync(fullLocalPath);
      const fileName = path.basename(asset.localPath);
      const storagePath = asset.storagePath;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: getContentType(fileName)
        });

      if (error) {
        console.error(`❌ Error subiendo ${asset.localPath}:`, error);
        results.push({ asset: asset.localPath, success: false, error: error.message });
      } else {
        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);
        
        console.log(`✅ Subido exitosamente: ${publicUrl}`);
        results.push({ 
          asset: asset.localPath, 
          success: true, 
          url: publicUrl,
          storagePath: storagePath
        });
      }
    }

    console.log('\n📊 Resumen:');
    console.log('='.repeat(50));
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.asset}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Path: ${result.storagePath}\n`);
      } else {
        console.log(`❌ ${result.asset}`);
        console.log(`   Error: ${result.error}\n`);
      }
    });

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`\n✅ ${successCount} archivos subidos exitosamente`);
    if (failCount > 0) {
      console.log(`❌ ${failCount} archivos fallaron`);
    }

    // Generar archivo de configuración con las URLs
    const configPath = path.join(process.cwd(), 'src', 'lib', 'assets-config.ts');
    const configContent = `// Configuración de assets desde Supabase Storage
// Este archivo se genera automáticamente. No editar manualmente.

export const ASSETS_CONFIG = {
  logo: {
    svg: '${results.find(r => r.asset.includes('Logo.svg'))?.url || '/Logo.svg'}',
    png: '${results.find(r => r.asset.includes('Logo.png'))?.url || '/Logo.png'}',
  },
  banner: '${results.find(r => r.asset.includes('Banner.png'))?.url || '/Banner.png'}',
  nequi: '${results.find(r => r.asset.includes('nequi.jpg'))?.url || '/nequi.jpg'}',
};

// URLs base para referencia
export const SUPABASE_STORAGE_URL = '${supabaseUrl}/storage/v1/object/public/${bucketName}';
`;

    fs.writeFileSync(configPath, configContent);
    console.log(`\n📝 Configuración guardada en: ${configPath}`);

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const types = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
}

// Ejecutar
uploadAssets()
  .then(() => {
    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });

