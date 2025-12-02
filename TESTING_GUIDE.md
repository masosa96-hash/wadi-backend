# 🧪 GUÍA DE TESTING - WADI GUEST MODE

## 📋 Pre-requisitos

✅ Backend corriendo en `http://localhost:4000`
✅ Frontend corriendo en `http://localhost:5173`

## 🎯 Test 1: Health Check del Backend

### Verificar en terminal del backend:

Deberías ver:

```
🚀 WADI API running on http://localhost:4000
📊 Health check: http://localhost:4000/health
🔌 WebSocket: ws://localhost:4000/ws
```

### Verificar en navegador:

1. Abre: `http://localhost:4000/health`
2. Deberías ver:

```json
{
  "status": "ok",
  "supabase": "connected"
}
```

## 🎯 Test 2: Primera Visita (Guest Mode)

### Paso 1: Limpiar datos anteriores

1. Abre `http://localhost:5173`
2. Presiona `F12` para abrir DevTools
3. Ve a la pestaña "Console"
4. Ejecuta:

```javascript
localStorage.clear();
location.reload();
```

### Paso 2: Ver modal de nickname

✅ **Esperado**: Deberías ver un modal con:

- Emoji de robot 🤖
- Título: "¡Bienvenido a WADI!"
- Texto: "¿Cómo te gustaría que te llame?"
- Input para nombre
- Botón "Comenzar" (deshabilitado hasta escribir algo)

### Paso 3: Ingresar nickname

1. Escribe tu nombre (ej: "Juan")
2. El botón "Comenzar" debería activarse (azul #3B82F6)
3. Click en "Comenzar"
4. El modal debería cerrarse

### Paso 4: Verificar localStorage

En Console, ejecuta:

```javascript
// Ver el auth storage
JSON.parse(localStorage.getItem("wadi-auth-storage"));

// Deberías ver algo como:
// {
//   state: {
//     guestId: "a1b2c3d4-...",
//     guestNick: "Juan",
//     user: null,
//     session: null
//   }
// }
```

## 🎯 Test 3: Interfaz del Chat

### Verificar colores:

✅ **Fondo**: Negro oscuro (#09090B)
✅ **Header**:

- Fondo: #18181B (gris oscuro)
- Título "Chat WADI": Color blanco (#FAFAFA)
- Toggle AI/Espejo: Botones con fondo oscuro, activo en azul

✅ **Área de mensajes**:

- Sin mensajes: Emoji 🤖 grande
- Título "Hola, soy WADI" en blanco
- Subtítulo en gris claro

✅ **Input de mensaje**:

- Fondo: #27272A (gris oscuro)
- Texto: Blanco
- Borde: #3F3F46

✅ **Botón "Enviar"**:

- Vacío/Enviando: Gris (#3F3F46)
- Con texto: **Azul (#3B82F6)** 👈 IMPORTANTE
- Texto: Blanco

### Verificar BottomNav:

✅ Debería mostrar SOLO el icono de Chat (💬)
✅ No debe mostrar: Inicio, Historial, Perfil

## 🎯 Test 4: Enviar Mensaje

### Paso 1: Escribir mensaje

1. Click en el input
2. Escribe: "Hola, ¿cómo estás?"
3. Presiona Enter o click en "Enviar"

### Paso 2: Ver respuesta optimista

✅ **Mensaje de usuario**:

- Alineado a la derecha
- Fondo: **Azul (#3B82F6)** 👈 IMPORTANTE
- Texto: Blanco
- Timestamp abajo

✅ **Loading**:

- Aparece en la izquierda
- Tres puntitos animados (... )

### Paso 3: Ver respuesta de WADI

✅ **Mensaje de WADI**:

- Alineado a la izquierda
- Fondo: #18181B (gris oscuro)
- Borde: 1px solid #27272A
- Texto: Blanco
- Timestamp abajo

### Paso 4: Verificar en DevTools

1. Ve a Network tab
2. Busca la request a `/api/chat`
3. Verifica:
   - Method: POST
   - Headers: `x-guest-id: <tu-uuid>`
   - Request Body:
     ```json
     {
       "message": "Hola, ¿cómo estás?",
       "messages": [...]
     }
     ```
   - Response:
     ```json
     {
       "ok": true,
       "data": {
         "reply": "...",
         "assistantMessage": {...}
       }
     }
     ```

## 🎯 Test 5: Persistencia

### Paso 1: Verificar guardado en localStorage

En Console:

```javascript
const auth = JSON.parse(localStorage.getItem("wadi-auth-storage"));
const guestId = auth.state.guestId;
const history = JSON.parse(localStorage.getItem(`wadi_conv_${guestId}`));
console.log("Historial:", history);

// Deberías ver tu array de mensajes
```

### Paso 2: Recargar página

1. Presiona `F5` o `Ctrl+R`
2. ✅ **NO** debería aparecer el modal de nickname
3. ✅ El historial de chat debería cargarse automáticamente
4. ✅ Deberías ver tus mensajes anteriores

### Paso 3: Enviar otro mensaje

1. Envía otro mensaje
2. Verifica que se agregue correctamente
3. Recarga de nuevo
4. Verifica que ambos mensajes persistan

## 🎯 Test 6: Conversación Completa

### Prueba múltiples mensajes:

1. "¿Qué es WADI?"
2. "¿Qué puedes hacer?"
3. "Cuéntame un chiste"
4. "¿En qué lenguaje estás programado?"

### Verificar:

✅ Cada mensaje se guarda correctamente
✅ El scroll baja automáticamente al nuevo mensaje
✅ Los timestamps son correctos
✅ El historial se mantiene al recargar

## 🎯 Test 7: Cambio de Modo (AI vs Espejo)

### Toggle entre modos:

1. Click en "Espejo"
2. ✅ Fondo del botón cambia a azul
3. ✅ Se muestra ChatInterface (componente diferente)
4. Click en "AI"
5. ✅ Vuelve al chat normal
6. ✅ Los mensajes se mantienen

## 🎯 Test 8: Casos Edge

### Test 8.1: Mensaje vacío

1. Click en "Enviar" sin escribir nada
2. ✅ El botón debe estar deshabilitado (gris)
3. ✅ No debe enviar nada

### Test 8.2: Mensaje muy largo

1. Copia y pega un texto largo (500+ caracteres)
2. ✅ El input debe aceptarlo
3. ✅ El mensaje debe enviarse
4. ✅ Debe mostrarse con word-wrap correcto

### Test 8.3: Mensajes rápidos

1. Envía 3 mensajes seguidos rápidamente
2. ✅ Todos deben procesarse
3. ✅ El orden debe mantenerse
4. ✅ Los loading states deben funcionar correctamente

### Test 8.4: Error de backend

1. Detén el servidor backend (`Ctrl+C` en terminal)
2. Intenta enviar un mensaje
3. ✅ Debería mostrar error en Console
4. ✅ El estado de "enviando" debería terminar
5. Reinicia backend y vuelve a intentar
6. ✅ Debería funcionar normalmente

## 🎯 Test 9: Health Check del Frontend

### Al cargar la app:

1. Abre DevTools → Network
2. Recarga la página
3. Busca request a `/api/health`
4. ✅ Debería hacerse automáticamente
5. ✅ Si falla, debería mostrar pantalla de error con botón "Reintentar"

### Test de error de conexión:

1. Detén el backend
2. Recarga el frontend
3. ✅ Deberías ver:
   - Emoji ⚠️
   - "Error de Conexión"
   - Mensaje: "No se pudo conectar con el servidor"
   - Botón azul "Reintentar"

## ✅ Checklist Final

- [ ] Modal de nickname aparece en primera visita
- [ ] Nickname se guarda en localStorage
- [ ] Chat se muestra correctamente (colores, diseño)
- [ ] Mensajes de usuario: **fondo azul (#3B82F6), texto blanco**
- [ ] Mensajes de WADI: fondo gris oscuro, texto blanco, borde sutil
- [ ] Botón enviar: **azul cuando activo (#3B82F6)**
- [ ] BottomNav solo muestra Chat en guest mode
- [ ] Mensajes se envían correctamente al backend
- [ ] Respuesta de WADI se muestra correctamente
- [ ] Historial se guarda en localStorage
- [ ] Historial se carga al recargar la página
- [ ] Health check funciona correctamente
- [ ] Error screen se muestra si backend está caído
- [ ] No hay errores 405/422 en Console
- [ ] No hay warnings de React en Console
- [ ] Scroll automático funciona
- [ ] Timestamps se muestran correctamente
- [ ] Dark mode consistente en toda la app

## 🐛 Si encuentras problemas:

### Backend no responde:

1. Verifica que esté corriendo: `pnpm dev:api`
2. Check puerto 4000 libre
3. Verifica `.env` tiene `OPENAI_API_KEY` válida

### Frontend no carga:

1. Verifica que esté corriendo: `pnpm dev:front`
2. Check puerto 5173 libre
3. Limpia cache: `Ctrl+Shift+R`

### Errores de CORS:

1. Verifica `FRONTEND_URL=http://localhost:5173` en backend `.env`
2. Reinicia el backend

### OpenAI no responde:

1. Verifica tu API key en `apps/api/.env`
2. Check que tienes créditos en tu cuenta OpenAI
3. Verifica en Console del backend si hay errores

---

**¡Disfruta probando WADI en modo Guest!** 🚀
