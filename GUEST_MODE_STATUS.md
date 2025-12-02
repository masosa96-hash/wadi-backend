# 🎯 GUEST MODE - Estado de Implementación

## ✅ Completado

### Backend (API)

1. **Variable de entorno**: `GUEST_MODE=true` agregada a `.env`
2. **Endpoint /api/health**: Funcional en `/health` y `/api/health`
3. **authMiddleware**: Permite guest access cuando `GUEST_MODE=true` y hay `x-guest-id` header
4. **chatController.sendMessage**:
   - Soporta guest mode (sin DB)
   - Acepta historial del cliente
   - No crea profiles/workspaces/projects para guests
   - Retorna `{ reply }` para guests

### Frontend

1. **Variable de entorno**: `VITE_GUEST_MODE=true` agregada
2. **authStore**:
   - `guestId`: Generado automáticamente con crypto.randomUUID()
   - `guestNick`: Almacenado en localStorage
   - `setGuestNick()`: Función para actualizar nickname

3. **chatStore**:
   - Detecta guest mode vía `useAuthStore.getState().user`
   - Envía historial completo en cada request (POST /api/chat)
   - Guarda mensajes en `localStorage` con key `wadi_conv_${guestId}`
   - Carga historial de localStorage al iniciar
   - No llama WebSocket para guests
   - Usa header `x-guest-id` para identificar guest

4. **Componentes**:
   - `GuestNicknameModal`: Modal para capturar nickname
   - `Chat.tsx`:
     - Muestra modal si `!user && !guestNick`
     - Carga historial desde localStorage
     - Funciona sin autenticación

5. **Router**:
   - Root (`/`) redirige a `/chat` cuando `VITE_GUEST_MODE=true`
   - `/chat` no requiere auth (guard removido)

6. **App.tsx**:
   - Llama `/api/health` al iniciar
   - Muestra error visual si backend no responde
   - Botón de reintentar

## 🎨 Tema y Estilos

- **theme.ts**: Paleta consistente (dark mode con acentos blancos)
- **Chat**: Usa `theme.colors` correctamente
- **Botones**: Colores del tema aplicados

## 🔄 Flujo Guest Mode

### Al entrar por primera vez:

1. Se genera `guestId` único
2. Se pide `nickname` (modal)
3. Se guarda todo en localStorage
4. Se muestra chat vacío

### Al enviar mensaje:

1. Cliente optimistically agrega mensaje de usuario
2. POST /api/chat con:
   ```json
   {
     "message": "...",
     "messages": [...historial previo]
   }
   ```
   Headers: `x-guest-id: <uuid>`
3. Backend:
   - Detecta guest (no userId, pero sí x-guest-id)
   - Llama al cerebro (Kivo → Wadi)
   - Retorna `{ reply, assistantMessage }`
4. Cliente:
   - Agrega respuesta al state
   - Guarda todo en `localStorage`

### Al volver:

1. Se detecta `guestId` y `guestNick` en localStorage
2. Se carga historial desde `wadi_conv_${guestId}`
3. Chat continúa donde se dejó

## ⚠️ Endpoints NO usados en Guest Mode

- `/api/projects/*`
- `/api/sessions/*`
- `/api/runs/*`
- `/api/workspaces/*`
- `/api/chat` (GET, DELETE) - solo POST

## 📊 Verificación Pendiente

- [ ] Build prod limpio
- [ ] Test end-to-end en navegador
- [ ] Verificar persistencia de historial
- [ ] Confirmar que no hay errores 405/422
- [ ] Verificar que el cerebro (OpenAI) responde

## 🚀 Para Testing

```bash
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev

# Ir a http://localhost:5173
```
