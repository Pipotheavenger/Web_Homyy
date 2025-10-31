# 🔐 Configuración de Recuperación de Contraseña

## ✅ Implementación Completa

### 📋 Componentes Implementados

1. **Modal de Recuperación de Contraseña** (`RecoverPasswordModal.tsx`)
   - ✅ Formulario para solicitar enlace de recuperación
   - ✅ Validación de email
   - ✅ Envío de correo mediante Supabase
   - ✅ Mensajes de éxito y error

2. **Ruta de Callback** (`/auth/callback/route.ts`)
   - ✅ Maneja el callback cuando el usuario hace clic en el enlace del correo
   - ✅ Intercambia el código por una sesión válida
   - ✅ Redirige a la página de cambio de contraseña
   - ✅ Manejo de errores completo

3. **Página de Cambio de Contraseña** (`/auth/reset-password/page.tsx`)
   - ✅ Verifica que existe una sesión válida
   - ✅ Permite cambiar la contraseña
   - ✅ Hash automático por Supabase
   - ✅ Validación de contraseñas
   - ✅ Pantallas de carga, error y éxito

---

## 🔄 Flujo Completo de Usuario

### **Paso 1: Usuario solicita recuperación**
```
1. Usuario hace clic en "¿Olvidaste tu contraseña?" en /login
   ↓
2. Se abre el modal RecoverPasswordModal
   ↓
3. Usuario ingresa su email
   ↓
4. Sistema envía correo mediante supabase.auth.resetPasswordForEmail()
   ↓
5. Usuario ve mensaje de éxito: "Revisa tu bandeja de entrada"
```

### **Paso 2: Usuario recibe el correo**
```
1. Supabase envía email con enlace de recuperación
   ↓
2. Enlace incluye un código de verificación
   Ejemplo: https://tuapp.com/auth/callback?code=abc123...
```

### **Paso 3: Usuario hace clic en el enlace**
```
1. Usuario hace clic en el enlace del correo
   ↓
2. Se abre /auth/callback/route.ts
   ↓
3. La ruta intercambia el código por una sesión
   ↓
4. Redirige a /auth/reset-password
```

### **Paso 4: Usuario cambia la contraseña**
```
1. Página /auth/reset-password verifica la sesión
   ↓
2. Si la sesión es válida → Muestra el formulario
   Si no es válida → Muestra error "Enlace inválido"
   ↓
3. Usuario ingresa nueva contraseña (2 veces)
   ↓
4. Sistema actualiza la contraseña con hash automático
   ↓
5. Muestra mensaje de éxito
   ↓
6. Redirige a /login después de 2 segundos
```

---

## 🔧 Configuración en Supabase

### **Paso 1: Configurar Email Templates**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Email Templates**
3. Selecciona **Reset Password** (Magic Link)
4. Personaliza el template:

```html
<h2>Recupera tu contraseña</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Hommy.</p>
<p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #743fc6 0%, #8a5fd1 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
  Cambiar Contraseña
</a>
<p>O copia y pega este enlace en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p><strong>Este enlace expira en 1 hora.</strong></p>
<p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
<p>Saludos,<br>El equipo de Hommy</p>
```

### **Paso 2: Configurar URLs de Redirección**

1. Ve a **Authentication** → **URL Configuration**
2. Configura las siguientes URLs:

**Site URL:**
- Desarrollo: `http://localhost:3000`
- Producción: `https://tudominio.com`

**Redirect URLs (agregar ambas):**
- Desarrollo: `http://localhost:3000/auth/callback`
- Producción: `https://tudominio.com/auth/callback`

### **Paso 3: Configurar Duración del Enlace**

1. Ve a **Authentication** → **Settings**
2. Busca **Email Link Expiry**
3. Configura según prefieras (recomendado: 3600 segundos = 1 hora)

---

## 🔐 Seguridad Implementada

### **Validaciones en el Cliente:**
- ✅ Email válido antes de enviar
- ✅ Contraseña mínimo 6 caracteres
- ✅ Confirmación de contraseña debe coincidir
- ✅ Deshabilita botones durante carga (evita múltiples envíos)

### **Validaciones en el Servidor:**
- ✅ Verifica sesión válida antes de mostrar formulario
- ✅ Enlace expira después de 1 hora (configurable)
- ✅ Enlace de un solo uso (no se puede reutilizar)
- ✅ Hash automático de contraseña por Supabase

### **Manejo de Errores:**
- ✅ Enlace inválido o expirado
- ✅ Sesión no válida
- ✅ Error al actualizar contraseña
- ✅ Mensajes claros para el usuario

---

## 📱 Interfaz de Usuario

### **Modal de Recuperación:**
- ✅ Diseño moderno con glassmorphism
- ✅ Iconos descriptivos (Lucide React)
- ✅ Animaciones suaves (fade-in, scale-in)
- ✅ Estados de carga con spinner
- ✅ Mensajes de éxito con animación bounce
- ✅ Nota informativa sobre spam

### **Página de Reset Password:**
- ✅ 4 estados visuales:
  1. **Cargando** - Verificando enlace
  2. **Error** - Enlace inválido con botón "Volver al Login"
  3. **Formulario** - Cambio de contraseña con validación
  4. **Éxito** - Confirmación con redirección automática
- ✅ Fondo con onda decorativa (BgWave)
- ✅ Toggle para mostrar/ocultar contraseña
- ✅ Validación en tiempo real

---

## 🧪 Cómo Probar

### **Prueba Local (Desarrollo):**

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Solicitar recuperación:**
   - Ve a `http://localhost:3000/login`
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa un email válido registrado
   - Haz clic en "Enviar Enlace"

3. **Revisar email:**
   - Revisa tu bandeja de entrada
   - Busca el correo de Supabase
   - **Nota:** En desarrollo, si no configuraste SMTP, revisa el Dashboard de Supabase

4. **Completar recuperación:**
   - Haz clic en el enlace del correo
   - Serás redirigido a `/auth/callback`
   - Luego a `/auth/reset-password`
   - Ingresa tu nueva contraseña (2 veces)
   - Haz clic en "Actualizar Contraseña"
   - Espera la redirección a login
   - Inicia sesión con tu nueva contraseña

### **Verificar en Supabase Dashboard:**

1. **Ver correos enviados:**
   - Ve a tu proyecto en Supabase
   - **Authentication** → **Logs**
   - Filtra por "reset_password"

2. **Ver usuarios:**
   - **Authentication** → **Users**
   - Verifica que el usuario existe
   - Después del cambio, puedes ver la última actividad

---

## 🚨 Solución de Problemas

### **Problema: No llega el correo**

**Soluciones:**
1. Verifica que el email esté registrado en Supabase
2. Revisa la carpeta de spam/correo no deseado
3. Configura SMTP en Supabase (ver abajo)
4. Verifica logs en Supabase Dashboard → Authentication → Logs

### **Problema: Enlace dice "Inválido o expirado"**

**Causas comunes:**
1. El enlace ya fue usado (son de un solo uso)
2. El enlace expiró (default: 1 hora)
3. La sesión ya fue cerrada

**Solución:**
- Solicita un nuevo enlace de recuperación

### **Problema: Error al actualizar contraseña**

**Verifica:**
1. La contraseña tiene al menos 6 caracteres
2. Ambas contraseñas coinciden
3. La sesión sigue activa

---

## 📧 Configurar SMTP Personalizado (Recomendado)

### **Opción 1: Gmail**

1. Ve a **Supabase Dashboard** → **Project Settings** → **Authentication**
2. Scroll hasta **SMTP Settings**
3. Configura:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: tu-email@gmail.com
   Password: [App Password de Gmail]*
   Sender email: tu-email@gmail.com
   Sender name: Hommy
   ```

**Obtener App Password de Gmail:**
1. Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Habilita "Verificación en 2 pasos"
3. Busca "Contraseñas de aplicaciones"
4. Genera una nueva para "Correo"
5. Usa esa contraseña (16 caracteres) en Supabase

### **Opción 2: SendGrid (Recomendado para Producción)**

1. Crea cuenta en [SendGrid](https://sendgrid.com/)
2. Obtén tu API Key
3. Configura en Supabase:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Tu SendGrid API Key]
   Sender email: noreply@tudominio.com
   Sender name: Hommy
   ```

### **Opción 3: AWS SES**

1. Configura AWS SES
2. Verifica tu dominio
3. Obtén credenciales SMTP
4. Configura en Supabase con esas credenciales

---

## 🎨 Personalización Adicional

### **Cambiar tiempo de expiración del enlace:**

En Supabase Dashboard:
- **Authentication** → **Settings** → **Email Link Expiry**
- Default: 3600 segundos (1 hora)
- Puedes ajustar según tus necesidades

### **Agregar rate limiting:**

Para prevenir abuso (múltiples solicitudes de recuperación):

```typescript
// En RecoverPasswordModal.tsx, agrega:
const [lastRequest, setLastRequest] = useState<number>(0);

const handleSubmit = async (e: React.FormEvent) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequest;
  
  // Solo permite 1 solicitud cada 60 segundos
  if (timeSinceLastRequest < 60000) {
    setError('Debes esperar 1 minuto entre solicitudes');
    return;
  }
  
  setLastRequest(now);
  // ... resto del código
};
```

---

## 📊 Monitoreo y Análitica

### **Métricas importantes a seguir:**

1. **Tasa de éxito de recuperación:**
   - Enlaces enviados vs contraseñas cambiadas

2. **Tiempo promedio de recuperación:**
   - Desde solicitud hasta cambio exitoso

3. **Enlaces expirados:**
   - Cuántos usuarios dejan expirar el enlace

4. **Errores comunes:**
   - Revisa logs para identificar problemas

### **Ver en Supabase:**
- **Dashboard** → **Authentication** → **Logs**
- Filtra por eventos de "reset_password"

---

## ✅ Checklist Pre-Producción

Antes de lanzar a producción, verifica:

- [ ] SMTP configurado con servicio profesional (SendGrid, AWS SES, etc.)
- [ ] Templates de email personalizados con branding
- [ ] URLs de producción configuradas correctamente
- [ ] Rate limiting implementado
- [ ] Tiempo de expiración apropiado (1 hora recomendado)
- [ ] Flujo completo probado end-to-end
- [ ] Mensajes de error claros y en español
- [ ] Responsive design verificado en mobile
- [ ] Logs y monitoreo configurados
- [ ] Políticas de seguridad revisadas

---

## 🔗 Archivos Relacionados

- **Modal:** `src/components/ui/RecoverPasswordModal.tsx`
- **Callback:** `src/app/auth/callback/route.ts`
- **Reset Page:** `src/app/auth/reset-password/page.tsx`
- **Supabase Client:** `src/lib/supabase.ts`

---

## 💡 Mejoras Futuras

### **Opción 1: Agregar preguntas de seguridad**
- Validación adicional antes de permitir cambio de contraseña

### **Opción 2: Autenticación de dos factores**
- Código SMS o app autenticadora antes del cambio

### **Opción 3: Historial de contraseñas**
- Evitar que el usuario reutilice contraseñas recientes

### **Opción 4: Fuerza de contraseña**
- Indicador visual de qué tan segura es la nueva contraseña
- Requisitos: mayúsculas, números, símbolos

---

¡El sistema de recuperación de contraseña está completamente implementado y listo para usar! 🎉

**La contraseña se guarda automáticamente con hash por Supabase Auth, no necesitas implementar el hashing manualmente.**
