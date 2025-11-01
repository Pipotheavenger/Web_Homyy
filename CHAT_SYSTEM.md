# 💬 Sistema de Chat - Hommy

## 📋 Descripción

Sistema de mensajería en tiempo real entre clientes y trabajadores. Solo se activa cuando existe un **booking confirmado** (servicio contratado).

---

## ✨ Características

### 🔐 Seguridad
- **Solo usuarios autenticados** pueden acceder
- **RLS (Row Level Security)** en todas las tablas
- Los usuarios **solo ven sus propios chats**
- Validación de permisos en cada acción

### 💡 Funcionalidades
- ✅ Chat en tiempo real con Supabase Realtime
- ✅ Lista de conversaciones ordenadas por más reciente
- ✅ Contador de mensajes no leídos
- ✅ Marcar mensajes como leídos automáticamente
- ✅ Diseño responsive (mobile y desktop)
- ✅ EmptyState cuando no hay conversaciones

### 🎯 Reglas de Negocio
1. **Chat solo se activa con booking confirmado** (status: `scheduled`, `in_progress`, `completed`)
2. **Un chat por booking** (constraint UNIQUE en booking_id)
3. **Dos participantes por chat**: cliente y trabajador
4. **Actualización automática** del último mensaje

---

## 📊 Estructura de Base de Datos

### Tabla: `chats`
```sql
- id: UUID (PK)
- booking_id: UUID (FK → bookings, UNIQUE)
- client_id: UUID (ID del cliente)
- worker_id: UUID (ID del trabajador)
- last_message: TEXT (último mensaje enviado)
- last_message_at: TIMESTAMP (fecha del último mensaje)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Índices:**
- `idx_chats_client_id`
- `idx_chats_worker_id`
- `idx_chats_booking_id`
- `idx_chats_last_message_at`

### Tabla: `chat_messages`
```sql
- id: UUID (PK)
- chat_id: UUID (FK → chats)
- sender_id: UUID (ID del remitente)
- message: TEXT (contenido del mensaje)
- message_type: VARCHAR ('text', 'image', 'document')
- is_read: BOOLEAN (default: false)
- created_at: TIMESTAMP
```

**Índices:**
- `idx_chat_messages_chat_id`
- `idx_chat_messages_sender_id`
- `idx_chat_messages_created_at`
- `idx_chat_messages_is_read`

### Trigger: `update_chat_last_message`
- Se ejecuta **AFTER INSERT** en `chat_messages`
- Actualiza automáticamente `last_message` y `last_message_at` en la tabla `chats`

---

## 🛠️ Arquitectura del Código

### 1. API Service (`src/lib/api/chat.ts`)

```typescript
chatService.getOrCreateChat(bookingId)     // Obtener o crear chat
chatService.getMyChats()                   // Lista de chats del usuario
chatService.getMessages(chatId)            // Mensajes de un chat
chatService.sendMessage(data)              // Enviar mensaje
chatService.markMessagesAsRead(chatId)     // Marcar como leídos
chatService.subscribeToMessages(...)       // Suscripción en tiempo real
```

### 2. Hook (`src/hooks/useChat.ts`)

```typescript
const {
  chats,              // Lista de conversaciones
  messages,           // Mensajes del chat actual
  loading,            // Estado de carga
  sending,            // Enviando mensaje
  sendMessage,        // Función para enviar
  loadMessages,       // Cargar mensajes
  getOrCreateChatForBooking  // Crear chat para booking
} = useChat(chatId);
```

### 3. Componentes UI

**ChatList** (`src/components/ui/ChatList.tsx`)
- Lista de conversaciones
- Muestra último mensaje y tiempo
- Contador de no leídos
- Responsive y optimizado

**ChatWindow** (`src/components/ui/ChatWindow.tsx`)
- Ventana de conversación
- Input para escribir
- Burbujas de mensajes
- Scroll automático
- Estados de envío

### 4. Páginas

**Cliente:** `/user/chats`
**Trabajador:** `/worker/chats`

Ambas páginas comparten la misma lógica:
- Lista de chats a la izquierda
- Ventana de chat a la derecha
- Responsive con navegación móvil

---

## 🚀 Cómo Usar

### Para Desarrolladores

1. **Crear las tablas en Supabase:**
   ```bash
   # Ejecutar en Supabase SQL Editor
   scripts/chat-tables.sql
   ```

2. **Las rutas están configuradas:**
   - `/user/chats` - Página de chats para clientes
   - `/worker/chats` - Página de chats para trabajadores

3. **El Sidebar ya incluye la opción "Chats"**

### Para Usuarios

1. **Cliente contrata un servicio:**
   - Crea un servicio
   - Un trabajador postula
   - Cliente acepta la postulación → Se crea un **booking**

2. **Chat se activa automáticamente:**
   - Cliente y trabajador pueden ir a "Chats"
   - Aparece la conversación en la lista
   - Pueden enviar mensajes en tiempo real

3. **Mensajes en tiempo real:**
   - Los mensajes aparecen instantáneamente
   - Se marcan como leídos automáticamente
   - Se mantiene el historial completo

---

## 📱 Flujo de Usuario

```
CLIENTE:
1. Crea servicio
2. Acepta trabajador → Booking creado
3. Ve "Chats" en sidebar
4. Abre chat con el trabajador
5. Envía mensajes en tiempo real

TRABAJADOR:
1. Postula a servicio
2. Cliente acepta → Booking creado
3. Ve "Chats" en sidebar
4. Abre chat con el cliente
5. Coordina detalles del trabajo
```

---

## 🎨 Estados Visuales

### EmptyState (Sin chats)
```
📱 Cliente: "En este espacio puede hablar con las personas que 
             acepten tus trabajos, empieza un servicio y podrás 
             hablar con el prestador"

👷 Worker: "Aquí podrás conversar con los clientes que contraten 
            tus servicios. Una vez acepten tu postulación, podrás 
            chatear con ellos"
```

### Lista de Chats
- Avatar del otro usuario
- Nombre del servicio
- Último mensaje
- Tiempo relativo ("hace 5 min")
- Badge de mensajes no leídos

### Ventana de Chat
- Header con info del otro usuario
- Mensajes con burbujas (izq/der según sender)
- Input con botón de envío
- Indicador de "enviando..."

---

## 🔄 Tiempo Real con Supabase

El chat usa **Supabase Realtime** para mensajes instantáneos:

```typescript
// Suscripción automática en useChat
supabase
  .channel(`chat_${chatId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `chat_id=eq.${chatId}`
  }, (payload) => {
    // Nuevo mensaje recibido
    addMessageToUI(payload.new)
  })
  .subscribe()
```

---

## 🔒 Políticas de Seguridad (RLS)

### Chats
- ✅ Usuarios pueden **ver** sus propios chats
- ✅ Usuarios pueden **crear** chats para sus bookings

### Chat Messages
- ✅ Usuarios pueden **ver** mensajes de sus chats
- ✅ Usuarios pueden **enviar** mensajes en sus chats
- ✅ Usuarios pueden **marcar como leídos** mensajes

---

## 📦 Dependencias

```json
{
  "date-fns": "^latest",        // Formateo de fechas
  "@supabase/supabase-js": "^2", // Cliente de Supabase
  "lucide-react": "^latest"      // Iconos
}
```

---

## 🐛 Troubleshooting

### "No aparece el chat"
- ✅ Verificar que existe un **booking** con status válido
- ✅ Verificar que el usuario es **participante** del booking

### "No se ven los mensajes"
- ✅ Verificar las **políticas RLS** en Supabase
- ✅ Verificar que el usuario está **autenticado**

### "Los mensajes no llegan en tiempo real"
- ✅ Verificar que **Realtime está habilitado** en Supabase
- ✅ Revisar la **consola del navegador** por errores

---

## 📈 Próximas Mejoras

- [ ] Soporte para imágenes en mensajes
- [ ] Indicador de "escribiendo..."
- [ ] Notificaciones push
- [ ] Búsqueda de mensajes
- [ ] Archivos adjuntos
- [ ] Reacciones a mensajes

---

## 💡 Notas Importantes

1. **Los chats persisten** incluso después de completar el servicio
2. **No se pueden eliminar** chats (solo los mensajes se pueden marcar como leídos)
3. **Un booking = Un chat** (relación 1:1)
4. **Solo texto por ahora** (imágenes y archivos en futuras versiones)

---

¡El sistema de chat está listo para usar! 🎉
