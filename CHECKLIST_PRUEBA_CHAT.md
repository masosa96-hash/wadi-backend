# ✅ Checklist de Prueba - Chat WADI

## 📋 Estado de la Implementación

### ✅ Variables de Entorno Verificadas

#### **Backend (`apps/api/.env`)**
```env
PORT=4000
NODE_ENV=development
SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=your-service-role-key-here ⚠️ NECESITA COMPLETARSE
OPENAI_API_KEY=sk-svcacct-QWwACZRb_rO8wihg09a457Cw8n... ✅
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo ✅
FRONTEND_URL=http://localhost:5173
```

**⚠️ ACCIÓN REQUERIDA:**
- Completar `SUPABASE_SERVICE_KEY` con la Service Role Key real de Supabase

#### **Frontend (`apps/frontend/.env`)**
```env
SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co ✅
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
OPENAI_API_KEY=sk-svcacct-QWwACZRb_rO8wihg09a457Cw8n... ✅
API_URL=http://localhost:4000 ✅
FRONTEND_URL=http://localhost:5173 ✅
API_PORT=4000
FRONTEND_PORT=5173
```

**✅ Frontend .env creado y configurado**

---

## 🛣️ Endpoints del Backend

### Ruta del Chat
- **Archivo**: `apps/api/src/routes/chat.ts`
- **Base Path**: `/api/chat`
- **Controlador**: `apps/api/src/controllers/chatController.ts`

### Endpoints Disponibles
1. ✅ **POST /api/chat** - Enviar mensaje y recibir respuesta AI
2. ✅ **GET /api/chat** - Obtener todas las conversaciones
3. ✅ **GET /api/chat/:conversationId** - Obtener conversación específica
4. ✅ **DELETE /api/chat/:conversationId** - Eliminar conversación

### Configuración del Servidor
- **Puerto Backend**: 4000
- **Puerto Frontend**: 5173
- **CORS**: Configurado para `http://localhost:5173`
- **Autenticación**: Middleware activo en todas las rutas de chat

---

## 🔧 Configuración de OpenAI

### Servicio OpenAI
- **Archivo**: `apps/api/src/services/openai.ts`
- **Modelo por defecto**: `gpt-3.5-turbo` (configurable via env)
- **Modelos válidos soportados**:
  - `gpt-3.5-turbo` ✅
  - `gpt-4`
  - `gpt-4-turbo`
  - `gpt-4o`
  - `gpt-4o-mini`

### Personalidad de WADI
```javascript
{
  role: "system",
  content: "Sos WADI, un asistente de IA amigable y útil. Hablás en español de forma cercana y natural, como si fueras un amigo que ayuda con cualquier tarea. Respondés de manera clara, concisa y práctica."
}
```

---

## 🧪 Pruebas a Realizar

### 1️⃣ Flujo: Home → Chat con mensaje inicial

**Ruta**: `/home` → `/chat`

**Pasos:**
```
□ 1. Loguearse con cuenta real
□ 2. Verificar que caes en /home
□ 3. Escribir mensaje en el input del hero card
□ 4. Click en botón enviar (✈️)
□ 5. Verificar navegación a /chat
□ 6. Verificar que el mensaje aparece como "user"
□ 7. Verificar indicador "WADI pensando..." (3 dots animados)
□ 8. Verificar respuesta del asistente
```

**Código relevante:**
- Input: `apps/frontend/src/pages/Home.tsx` (línea 29-36)
- Chat: `apps/frontend/src/pages/Chat.tsx`
- Store: `apps/frontend/src/store/chatStore.ts`

---

### 2️⃣ Chat: Envío de mensajes

**Ruta**: `/chat`

**Pasos:**
```
□ 1. En /chat, escribir nuevo mensaje
□ 2. Presionar Enter o click en botón enviar
□ 3. Mensaje aparece inmediatamente como "user"
□ 4. Input se limpia automáticamente
□ 5. Indicador de typing aparece (dots animados)
□ 6. Respuesta de WADI aparece con avatar "W"
□ 7. Auto-scroll al último mensaje
```

**Elementos UI:**
- Avatar WADI: Círculo azul con "W"
- Mensaje usuario: Fondo azul gradiente, alineado derecha
- Mensaje asistente: Fondo blanco glassmorphism, alineado izquierda
- Typing indicator: 3 dots azules animados

---

### 3️⃣ Persistencia: Refresh de página

**Pasos:**
```
□ 1. Estando en /chat con mensajes
□ 2. Presionar F5 (refresh)
□ 3. Verificar que los mensajes permanecen
□ 4. Verificar conversationId se mantiene
□ 5. Enviar nuevo mensaje
□ 6. Verificar que se agrega a la misma conversación
```

**Implementación:**
- Store usa Zustand con persist
- Los mensajes se cargan del backend al montar el componente

---

### 4️⃣ Manejo de Errores

**Escenarios a probar:**

#### A. Error de red
```
□ 1. Cortar internet 10 segundos
□ 2. Enviar mensaje
□ 3. Verificar mensaje de error amigable
□ 4. Verificar que no se pierde el historial
□ 5. Reconectar y reintentar
□ 6. Verificar que funciona correctamente
```

**Mensaje esperado:**
```
"Network error. Please check your connection."
```

#### B. API Key inválida
```
□ 1. Modificar OPENAI_API_KEY en backend .env (temporalmente)
□ 2. Reiniciar backend
□ 3. Enviar mensaje
□ 4. Verificar error amigable
□ 5. Verificar respuesta fallback del servidor
```

**Respuesta fallback del servidor:**
```
"Lo siento, tuve un problema al generar la respuesta. ¿Podés intentar de nuevo?"
```

#### C. Timeout
```
□ 1. Enviar mensaje
□ 2. Si tarda más de 30 segundos
□ 3. Verificar mensaje de timeout
□ 4. Verificar botón para reintentar
```

---

## 📊 Verificaciones de Consola

### Frontend Console (F12)
```javascript
// Mensajes esperados:
✅ [API] POST /api/chat { data: {...} }
✅ [API] POST /api/chat - XXXms { response: {...} }
✅ [Chat] Message sent successfully
✅ [Chat] Assistant response received

// Errores a buscar:
❌ 401 Unauthorized
❌ 404 Not Found
❌ 500 Internal Server Error
❌ CORS errors
```

### Backend Console
```javascript
// Mensajes esperados:
✅ [sendMessage] Request from user: <userId>
✅ [sendMessage] User message saved: <messageId>
✅ [sendMessage] Calling OpenAI with X messages
✅ [sendMessage] AI response generated: <preview>
✅ [sendMessage] Success - conversation: <conversationId>

// Errores a buscar:
❌ Missing OpenAI API key
❌ OpenAI API error: 401
❌ Supabase connection error
❌ Error saving user message
```

---

## 🗂️ Estructura de Datos

### Mensaje en Frontend
```typescript
interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  error?: string | null;
  created_at: string;
}
```

### Request POST /api/chat
```typescript
{
  message: string;          // Requerido
  conversationId?: string;  // Opcional (se crea si no existe)
}
```

### Response POST /api/chat
```typescript
{
  ok: true;
  data: {
    conversationId: string;
    userMessage: Message;
    assistantMessage: Message;
  }
}
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema: 401 Unauthorized
**Causa**: Token de Supabase expirado o inválido
**Solución**: 
1. Cerrar sesión y volver a loguear
2. Verificar que el middleware de auth está funcionando

### Problema: CORS Error
**Causa**: Frontend y backend en diferentes orígenes
**Solución**: 
1. Verificar `FRONTEND_URL` en backend .env
2. Verificar configuración CORS en `apps/api/src/index.ts`

### Problema: No aparece respuesta
**Causa**: OPENAI_API_KEY inválida o modelo no soportado
**Solución**:
1. Verificar API key en backend .env
2. Verificar logs del backend para ver error específico
3. Verificar que el modelo existe en OpenAI

### Problema: Mensajes no persisten
**Causa**: Supabase no está guardando correctamente
**Solución**:
1. Verificar SUPABASE_SERVICE_KEY en backend
2. Verificar schema de base de datos (tabla `conversations` y `messages`)
3. Revisar logs de Supabase

---

## 📝 Comandos de Inicio

### Iniciar Backend
```bash
cd apps/api
pnpm install
pnpm dev
# Debe mostrar: 🚀 WADI API running on http://localhost:4000
```

### Iniciar Frontend
```bash
cd apps/frontend
pnpm install
pnpm dev
# Debe mostrar: Local: http://localhost:5173
```

### Iniciar ambos (desde root)
```bash
# Terminal 1
pnpm --filter api dev

# Terminal 2
pnpm --filter frontend dev
```

---

## ✅ Checklist Final de Entrega

```
□ Backend corriendo en puerto 4000
□ Frontend corriendo en puerto 5173
□ Variables de entorno configuradas
□ Usuario logueado correctamente
□ Navegación Home → Chat funciona
□ Mensajes se envían y reciben
□ Indicador de "pensando" se muestra
□ Respuestas de WADI aparecen
□ Mensajes persisten después de refresh
□ Errores se manejan graciosamente
□ Consola sin errores críticos
□ UI responsive y animaciones funcionan
```

---

## 🎯 URLs para Probar

- **Home**: http://localhost:5173/home
- **Chat**: http://localhost:5173/chat
- **Login**: http://localhost:5173/login
- **API Health**: http://localhost:4000/health
- **API Chat**: http://localhost:4000/api/chat

---

## 📞 Cómo Reportar Problemas

Si algo falla, reportar:

1. **URL exacta** donde ocurre (ejemplo: `/chat`, `/home`)
2. **Consola del navegador** (F12 → Console tab, copiar errores rojos)
3. **Consola del backend** (terminal donde corre `pnpm dev`)
4. **Pasos para reproducir**:
   - Qué hiciste
   - Qué esperabas
   - Qué pasó en realidad
5. **Screenshot** si hay error visual

---

**Última actualización**: {{ timestamp }}
**Versión**: Beta 1.0
