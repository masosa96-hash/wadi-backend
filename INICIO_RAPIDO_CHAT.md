# 🚀 Inicio Rápido - Chat WADI

## ⚡ Setup en 3 Pasos

### 1️⃣ Completar SUPABASE_SERVICE_KEY

**Archivo**: `apps/api/.env`

```bash
# Ir a: https://app.supabase.com/project/smkbiguvgiscojwxgbae/settings/api
# Copiar la "service_role secret" key
# Pegar en apps/api/.env:

SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu_key_real_aqui...
```

📖 **Guía detallada**: Ver `COMPLETAR_SUPABASE_SERVICE_KEY.md`

---

### 2️⃣ Verificar Configuración

```powershell
.\test-chat-ready.ps1
```

**Debes ver**:

```
✅ ¡Todo listo! El chat está configurado correctamente.
```

Si ves advertencias o errores, seguí las instrucciones del script.

---

### 3️⃣ Iniciar Servicios

**Terminal 1 - Backend**:

```powershell
pnpm --filter api dev
```

**Debes ver**:

```
🚀 WADI API running on http://localhost:4000
📊 Health check: http://localhost:4000/health
```

**Terminal 2 - Frontend**:

```powershell
pnpm --filter frontend dev
```

**Debes ver**:

```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

---

## 🧪 Probar el Chat

### Paso 1: Login

1. Abrir: http://localhost:5173/login
2. Loguear con tu cuenta (la que ya tenés)
3. Deberías caer en `/home`

### Paso 2: Enviar Mensaje desde Home

1. En `/home`, escribir en el input grande: **"Hola WADI"**
2. Click en el botón enviar (✈️)
3. Deberías ser redirigido a `/chat`
4. Tu mensaje aparece inmediatamente
5. Ves el indicador "WADI pensando..." (3 dots animados)
6. Respuesta de WADI aparece

### Paso 3: Conversación Continua

1. Escribir otro mensaje en `/chat`
2. Presionar Enter o click enviar
3. Mensaje aparece → Typing indicator → Respuesta

### Paso 4: Persistencia

1. Presionar F5 (refresh página)
2. Los mensajes siguen ahí ✅
3. Podés seguir conversando

---

## ✅ Checklist Rápido

```
□ Backend corriendo en puerto 4000
□ Frontend corriendo en puerto 5173
□ Login exitoso → caes en /home
□ Escribir en input de home → enviar
□ Navegación a /chat funciona
□ Mensaje aparece como "user"
□ Indicador "pensando" se muestra
□ Respuesta de WADI aparece
□ Auto-scroll al último mensaje
□ F5 → mensajes persisten
□ Nuevo mensaje continúa conversación
```

---

## 🔍 Verificaciones de Consola

### ✅ Frontend Console (F12)

```javascript
[API] POST /api/chat - XXXms
[Chat] Message sent successfully
```

### ✅ Backend Console

```javascript
[sendMessage] Request from user: <userId>
[sendMessage] User message saved: <messageId>
[sendMessage] Calling OpenAI with X messages
[sendMessage] AI response generated
[sendMessage] Success - conversation: <conversationId>
```

---

## 🚨 Problemas Comunes

### ❌ Error: "Missing Supabase environment variables"

**Solución**: Verificar que `apps/frontend/.env` tiene:

```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### ❌ Error: 401 Unauthorized

**Solución**:

1. Cerrar sesión
2. Volver a loguear
3. Verificar que el token está en sessionStorage/localStorage

### ❌ Error: "Failed to send message"

**Causa**: Backend no está corriendo o CORS error  
**Solución**:

1. Verificar backend en http://localhost:4000/health
2. Verificar `FRONTEND_URL=http://localhost:5173` en `apps/api/.env`

### ❌ No aparece respuesta de WADI

**Causa**: OpenAI API key inválida  
**Solución**:

1. Verificar `OPENAI_API_KEY` en `apps/api/.env`
2. Ver logs del backend para error específico
3. Verificar créditos en cuenta de OpenAI

### ❌ Mensajes no persisten después de refresh

**Causa**: SUPABASE_SERVICE_KEY faltante  
**Solución**: Completar Paso 1 de esta guía

---

## 📊 URLs de Verificación

| Servicio           | URL                                                   | Descripción        |
| ------------------ | ----------------------------------------------------- | ------------------ |
| Frontend Home      | http://localhost:5173/home                            | Pantalla principal |
| Frontend Chat      | http://localhost:5173/chat                            | Pantalla de chat   |
| Frontend Login     | http://localhost:5173/login                           | Login              |
| Backend Health     | http://localhost:4000/health                          | Health check       |
| Supabase Dashboard | https://app.supabase.com/project/smkbiguvgiscojwxgbae | Panel admin        |

---

## 📖 Documentación Completa

| Archivo                             | Descripción                               |
| ----------------------------------- | ----------------------------------------- |
| `CHECKLIST_PRUEBA_CHAT.md`          | Checklist completo de pruebas funcionales |
| `COMPLETAR_SUPABASE_SERVICE_KEY.md` | Guía para obtener Service Role Key        |
| `RESUMEN_CONFIGURACION_CHAT.md`     | Resumen técnico completo                  |
| `test-chat-ready.ps1`               | Script de verificación automática         |

---

## 🎯 Flujo Completo en 30 Segundos

```bash
# 1. Completar Service Key (5 min)
# Ver: COMPLETAR_SUPABASE_SERVICE_KEY.md

# 2. Verificar (5 seg)
.\test-chat-ready.ps1

# 3. Iniciar backend (10 seg)
pnpm --filter api dev

# 4. Iniciar frontend (10 seg) - Nueva terminal
pnpm --filter frontend dev

# 5. Abrir navegador (5 seg)
http://localhost:5173/login

# 6. Loguear y probar (30 seg)
# Login → Home → Escribir mensaje → Enviar → Chat
```

---

## 📞 ¿Algo no funciona?

1. **Ejecutar**: `.\test-chat-ready.ps1`
2. **Revisar**: Consola del navegador (F12)
3. **Revisar**: Terminal del backend
4. **Reportar**:
   - URL donde ocurre el problema
   - Captura de errores de consola
   - Pasos para reproducir

---

**🎉 ¡Listo! Con estos 3 pasos tenés el chat funcionando.**

Si todo está OK, seguí con `CHECKLIST_PRUEBA_CHAT.md` para hacer pruebas exhaustivas.
