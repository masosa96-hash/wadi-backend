# WADI Chat - Inicio Rápido 🚀

## ⚡ 3 Pasos para Tener Chat Funcionando

### Paso 1: Base de Datos (2 minutos)

1. Abrí Supabase Dashboard → SQL Editor
2. Copiá todo el contenido de `docs/database/chat-schema.sql`
3. Pegalo y ejecutá
4. Verificá que aparezcan las tablas `conversations` y `messages`

### Paso 2: Variables de Entorno (1 minuto)

Verificá que tu archivo `.env` (en la raíz del proyecto) tenga:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
```

### Paso 3: Iniciar Todo (1 minuto)

**Terminal 1 - Backend:**

```bash
cd apps/api
pnpm dev
```

**Terminal 2 - Frontend:**

```bash
cd apps/frontend
pnpm dev
```

---

## ✅ Probá que Funciona

1. Abrí `http://localhost:5173`
2. Hacé login
3. En la pantalla de Home, escribí: **"Hola WADI, ¿cómo estás?"**
4. Click en el botón de enviar (✈️)
5. Deberías ver:
   - Redirección a `/chat`
   - Tu mensaje aparecer
   - WADI responder en español

---

## 🎯 Flujos Disponibles

### Desde Hero Input (Home)

- Escribí mensaje → Enter → Te lleva al chat con el mensaje ya enviado

### Desde Card "Conversa con WADI"

- Click en la card → Te lleva al chat vacío

### Desde Bottom Nav

- Click en "Workspaces" → Te lleva al chat

---

## 🐛 Si Algo Falla

### Backend no responde

```bash
# Verificar que esté corriendo
curl http://localhost:4000/health

# Debería responder:
# {"status":"ok","supabase":"connected"}
```

### OpenAI no funciona

- Verificá que `OPENAI_API_KEY` esté en `.env`
- Verificá que tengas créditos en tu cuenta de OpenAI
- Mirá los logs del backend (terminal 1) para ver errores

### No veo mis mensajes después de recargar

- Verificá que el schema de DB se haya ejecutado correctamente
- Mirá en Supabase → Table Editor si aparecen `conversations` y `messages`

### TypeScript errors

```bash
# Frontend
cd apps/frontend
npx tsc --noEmit

# Backend
cd apps/api
npx tsc --noEmit
```

---

## 📝 Archivos Clave

**Backend:**

- `apps/api/src/controllers/chatController.ts` - Lógica del chat
- `apps/api/src/routes/chat.ts` - Rutas API
- `apps/api/src/services/openai.ts` - Integración OpenAI

**Frontend:**

- `apps/frontend/src/pages/Chat.tsx` - Pantalla de chat
- `apps/frontend/src/store/chatStore.ts` - Estado del chat
- `apps/frontend/src/pages/Home.tsx` - Navegación al chat

**Database:**

- `docs/database/chat-schema.sql` - Schema completo

---

## 🎉 ¡Listo!

Ahora WADI puede conversar de verdad, mantiene historial, y responde en español con un tono amigable. Todo el código está tipado, sin errores de compilación, y usando el diseño web3 que ya tenías.

Para más detalles técnicos, ver: `CHAT_IMPLEMENTATION_GUIDE.md`
