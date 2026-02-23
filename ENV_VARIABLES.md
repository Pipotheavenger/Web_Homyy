# Variables de Entorno Requeridas

## 📋 Lista Completa de Variables de Entorno


### 🗄️ Supabase (Base de Datos)

```env
# URLs y claves públicas (van al cliente)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Clave de servicio (secreta - solo servidor, para bypass RLS)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**Cómo obtenerlas:**
- Ve a Supabase Dashboard → Configuración del proyecto → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (⚠️ secreta)

---

### 📱 Infobip (WhatsApp) - Opcional

```env
# API Key de Infobip
INFOBIP_API_KEY=tu_api_key

# URL base (por defecto: https://api.infobip.com)
INFOBIP_BASE_URL=https://api.infobip.com

# WhatsApp
INFOBIP_WHATSAPP_SENDER_ID=tu_sender_id
INFOBIP_WHATSAPP_TEMPLATE_NAME=notification_template
INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE=es

# Email
INFOBIP_EMAIL_FROM=no-reply@hommy.app
```

**Nota:** Estas son opcionales. Solo necesitas configurarlas si usas WhatsApp/Email.

---

### 🌐 Aplicación (Opcional)

```env
# URL base de la aplicación (por defecto: http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email del administrador (por defecto: admin@hommy.app)
ADMIN_EMAIL=admin@hommy.app
```

---

## ✅ Resumen de Variables Esenciales

### Mínimas Requeridas (para que la app funcione):

```env
# Supabase (obligatorio)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Recomendadas (para funcionalidades adicionales):

```env
# Supabase Service Role (para operaciones admin)
SUPABASE_SERVICE_ROLE_KEY=

# Infobip (para WhatsApp)
INFOBIP_API_KEY=
INFOBIP_WHATSAPP_SENDER_ID=
INFOBIP_WHATSAPP_TEMPLATE_NAME=
INFOBIP_WHATSAPP_TEMPLATE_LANGUAGE=es
```

---

## 🔍 Verificación

Para verificar que todas las variables están configuradas, puedes ejecutar:

```bash
# Verificar variables de Supabase
node scripts/check-supabase-config.js

npm run dev
```

---

## ⚠️ Notas Importantes

1. **Variables `NEXT_PUBLIC_*`**: Son públicas y se exponen al cliente. No pongas secretos aquí.
2. **Variables sin `NEXT_PUBLIC_*`**: Son secretas y solo están disponibles en el servidor.
3. **`.env.local`**: Nunca lo subas a Git. Asegúrate de que esté en `.gitignore`.
4. **Service Account**: El JSON debe estar en una sola línea. Usa el script `prepare-service-account.js` para convertirlo.


