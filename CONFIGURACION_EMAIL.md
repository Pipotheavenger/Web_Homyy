# 📧 Configuración de Confirmación de Email en Supabase

## ✅ Cambios Implementados

### 1. **Flujo de Registro Actualizado**
- ✅ Después del registro exitoso → Redirige a `/login`
- ✅ Muestra mensaje sobre verificación de email
- ✅ No permite login sin confirmar email

### 2. **Validación en Login**
- ✅ Verifica si `email_confirmed_at` existe
- ✅ Muestra mensaje claro si falta confirmación
- ✅ Cierra la sesión automáticamente si no está confirmado
- ✅ Mensajes de error mejorados con iconos

---

## 🔧 Configuración en Supabase Dashboard

Para que funcione la confirmación de email, debes configurar Supabase:

### **Paso 1: Habilitar Confirmación de Email**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Providers** → **Email**
3. Asegúrate de que esté habilitado: **"Confirm email"**
4. Configura la URL de confirmación:
   - **Site URL**: `http://localhost:3000` (desarrollo) o tu URL de producción
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - Tu URL de producción con `/auth/callback`

### **Paso 2: Configurar Email Templates**

1. Ve a **Authentication** → **Email Templates**
2. Personaliza el template de **Confirm signup**:

```html
<h2>Confirma tu correo electrónico</h2>
<p>Gracias por registrarte en Hommy!</p>
<p>Haz clic en el botón de abajo para confirmar tu correo electrónico:</p>
<a href="{{ .ConfirmationURL }}">Confirmar mi correo</a>
<p>O copia y pega este enlace en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
```

### **Paso 3: Configurar SMTP (Opcional pero Recomendado)**

Por defecto, Supabase usa su propio servicio de email, pero para producción es mejor usar tu propio SMTP:

1. Ve a **Project Settings** → **Authentication**
2. Scroll hasta **SMTP Settings**
3. Configura tu servidor SMTP (Gmail, SendGrid, etc.)

**Ejemplo con Gmail:**
```
Host: smtp.gmail.com
Port: 587
Username: tu-email@gmail.com
Password: tu-app-password
Sender email: tu-email@gmail.com
Sender name: Hommy
```

---

## 📝 Flujo de Usuario Actualizado

### **Registro:**
```
1. Usuario completa el formulario de registro
   ↓
2. Se crea la cuenta en Supabase Auth
   ↓
3. Se crea el perfil en user_profiles
   ↓
4. Supabase envía email de confirmación automáticamente
   ↓
5. Usuario ve pantalla de éxito con instrucciones
   ↓
6. Redirige a /login después de 4 segundos
```

### **Login:**
```
1. Usuario intenta iniciar sesión
   ↓
2. Sistema verifica credenciales
   ↓
3. ¿Email confirmado?
   
   SI → Permite login y redirige al dashboard
   NO → Muestra mensaje:
        "⚠️ Tu cuenta está registrada pero aún no has 
        confirmado tu correo electrónico. Por favor, 
        revisa tu bandeja de entrada..."
        + Cierra la sesión automáticamente
```

---

## 🎨 Mensajes de Error Mejorados

### **Credenciales incorrectas:**
```
❌ Correo electrónico o contraseña incorrectos. 
   Verifica tus datos e intenta de nuevo.
```

### **Email no confirmado:**
```
⚠️ Tu cuenta está registrada pero aún no has confirmado 
   tu correo electrónico. Por favor, revisa tu bandeja 
   de entrada (y spam) para activar tu cuenta.
```

### **Demasiados intentos:**
```
⏰ Demasiados intentos. Por favor, espera unos minutos 
   antes de intentar nuevamente.
```

### **Usuario no existe:**
```
❌ No existe una cuenta con este correo electrónico. 
   ¿Deseas registrarte?
```

---

## 🧪 Cómo Probar

### **Opción 1: Desarrollo Local**
Si no quieres configurar SMTP, puedes:

1. Ir a **Supabase Dashboard** → **Authentication** → **Users**
2. Encontrar el usuario recién registrado
3. Hacer clic en los 3 puntos → **Send email verification**
4. O marcar manualmente como confirmado (solo para testing)

### **Opción 2: Con Email Real**
1. Registra un usuario con tu email real
2. Revisa tu bandeja de entrada
3. Haz clic en el enlace de confirmación
4. Intenta hacer login

---

## 🔒 Seguridad Adicional

### **Ventajas de este flujo:**
- ✅ Previene registros con emails falsos
- ✅ Verifica que el usuario tiene acceso al email
- ✅ Evita spam y cuentas bot
- ✅ Mejora la calidad de la base de usuarios
- ✅ Permite recuperación de contraseña confiable

### **Manejo de Sesiones:**
- Si un usuario intenta login sin confirmar email → Se cierra la sesión automáticamente
- El token de sesión no se mantiene hasta que se confirme el email
- Esto previene accesos no autorizados

---

## 🚀 Para Producción

Antes de lanzar a producción:

1. ✅ Configura un servicio SMTP profesional (SendGrid, AWS SES, etc.)
2. ✅ Personaliza todos los templates de email con tu branding
3. ✅ Configura las URLs de producción correctamente
4. ✅ Prueba el flujo completo de registro → confirmación → login
5. ✅ Configura Rate Limiting para prevenir abuso
6. ✅ Agrega opción "Reenviar email de confirmación"

---

## 📌 Notas Importantes

- **Modo desarrollo**: Puedes desactivar temporalmente la confirmación de email en Supabase para testing rápido
- **Email templates**: Puedes incluir el logo de Hommy y personalizar los colores
- **Rate limiting**: Supabase tiene rate limiting por defecto, pero puedes ajustarlo
- **Expiración**: Los enlaces de confirmación expiran después de 24 horas por defecto

---

## 🔄 Reenvío de Email de Confirmación (Próxima Feature)

Para mejorar la experiencia, puedes agregar un botón "Reenviar email de confirmación" en la pantalla de login:

```typescript
const resendConfirmationEmail = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  });
  
  if (!error) {
    alert('Email de confirmación reenviado. Revisa tu bandeja de entrada.');
  }
}
```

---

¡El flujo de registro con confirmación de email está completamente implementado! 🎉

