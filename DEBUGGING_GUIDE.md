# 🔧 DEBUGGING & TROUBLESHOOTING AVANZADO - WADI

## 🎯 Herramientas de Debugging

### 1. DevTools del Navegador (Frontend)

#### Console Logging Avanzado:

```javascript
// Ver estado completo de zustand
window.zustandDevTools = {
  auth: () => console.log(useAuthStore.getState()),
  chat: () => console.log(useChatStore.getState()),
};

// Uso en console:
zustandDevTools.auth()
zustandDevTools.chat()
```

#### Network Monitoring:

```
DevTools → Network Tab

Filtros útiles:
- `/api/chat` - Ver todas las llamadas de chat
- `x-guest-id` - Verific

ar header guest
- Status: `4xx` - Ver errores client
- Status: `5xx` - Ver errores server

Click en request → Headers → Ver payload completo
```

#### LocalStorage Inspector:

```javascript
// Ver todo el storage
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});

// Ver storage de WADI específicamente
const wadiKeys = Object.keys(localStorage).filter(k => 
  k.startsWith('wadi')
);
console.table(wadiKeys.map(k => ({
  key: k,
  size: `${localStorage.getItem(k)?.length || 0} chars`
})));

// Parsear y ver contenido
const auth = JSON.parse(localStorage.getItem('wadi-auth-storage'));
console.log('Guest ID:', auth.state.guestId);
console.log('Nickname:', auth.state.guestNick);

const conv = JSON.parse(
  localStorage.getItem(`wadi_conv_${auth.state.guestId}`)
);
console.table(conv.map(m => ({
  role: m.role,
  preview: m.content.substring(0, 30) + '...',
  time: new Date(m.created_at).toLocaleTimeString()
})));
```

#### React DevTools:

```
Componentes útiles para inspeccionar:
- Chat → Ver props y state
- GuestNicknameModal → Ver showNicknameModal state
- BottomNav → Ver isGuestMode calculation

Store inspection:
- useAuthStore → Ver user, guestId, guestNick
- useChatStore → Ver messages, sendingMessage, error
```

---

### 2. Backend Logging (Terminal)

#### Logs Personalizados:

```typescript
// Agregar en apps/api/src/middleware/logger.ts
import morgan from 'morgan';

// Custom token para trace ID
morgan.token('trace-id', (req: any) => req.traceId || 'no-trace');
morgan.token('guest-id', (req: any) => 
  req.headers['x-guest-id'] || 'no-guest'
);

// Formato custom
export const morganLogger = morgan(
  ':trace-id :guest-id :method :url :status :response-time ms'
);

// Uso:
app.use(morganLogger);
```

#### Debugging específico:

```typescript
// En chatController.ts - agregar más logs
export async function sendMessage(req: Request, res: Response) {
  const startTime = Date.now();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 [CHAT REQUEST]');
  console.log('  Guest ID:', req.headers['x-guest-id']);
  console.log('  Message:', req.body.message?.substring(0, 50) + '...');
  console.log('  History len:', req.body.messages?.length || 0);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // ... código existente ...
    
    console.log('🧠 [KIVO] Thought:', {
      intent: thought.intent,
      confidence: thought.confidence,
      reasoning: thought.reasoning[0]
    });
    
    console.log('⚡ [WADI] Calling OpenAI...');
    const startAI = Date.now();
    
    const response = await generateChatCompletion(messages);
    
    console.log(`✅ [OPENAI] Responded in ${Date.now() - startAI}ms`);
    console.log('  Response preview:', response.substring(0, 50) + '...');
    
    console.log(`🏁 [TOTAL] Request completed in ${Date.now() - startTime}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    res.json({...});
  } catch (error) {
    console.error('❌ [ERROR]', error);
  }
}
```

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "No se pudo conectar con el servidor"

**Síntoma:**
```
Error screen en frontend:
⚠️ Error de Conexión
No se pudo conectar con el servidor
```

**Debug:**
```bash
# 1. Verificar que backend esté corriendo
curl http://localhost:4000/health

# Debería retornar:
# {"status":"ok","supabase":"connected"}

# 2. Si no responde, ver logs del backend:
# Terminal donde corre pnpm dev:api

# 3. Si hay error, verificar .env:
cat apps/api/.env | grep OPENAI_API_KEY

# 4. Verificar puerto no esté ocupado:
netstat -ano | findstr :4000
# Si hay proceso, matarlo:
taskkill /PID <PID> /F
```

**Solución:**
```bash
# Reiniciar backend
cd e:\WADI
pnpm dev:api
```

---

### Problema 2: Mensaje no se envía (queda en "enviando")

**Síntoma:**
- Input desaparece
- Botón dice "..."
- No aparece respuesta
- No hay error visible

**Debug en Frontend:**
```javascript
// En console del navegador
const chatState = useChatStore.getState();
console.log('Sending message?', chatState.sendingMessage);
console.log('Error?', chatState.error);
console.log('Messages count:', chatState.messages.length);

// Ver último request
// DevTools → Network → Filter: /api/chat
// Ver response: Status, Headers, Preview
```

**Debug en Backend:**
```bash
# Terminal del backend - buscar errores:
# [ERROR] ...
# [sendMessage] Exception: ...

# Posibles causas:
# 1. OpenAI API key inválida
# 2. Rate limit de OpenAI
# 3. CORS error
# 4. Timeout
```

**Soluciones:**

```typescript
// 1. Si es OpenAI key error:
// Verificar en apps/api/.env
OPENAI_API_KEY=sk-proj-...

// 2. Si es rate limit:
// En chatController.ts, agregar retry:
async function sendMessageWithRetry(req, res) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await sendMessage(req, res);
      return;
    } catch (error: any) {
      if (error.message.includes('Rate limit')) {
        attempt++;
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw error;
    }
  }
}

// 3. Si es CORS:
// Verificar apps/api/src/index.ts:
app.use(cors({
  origin: "http://localhost:5173", // ← Debe coincidir
  credentials: true,
}));
```

---

### Problema 3: Historial no persiste al recargar

**Síntoma:**
- Envías mensajes
- Recargas página
- Historial desaparece

**Debug:**
```javascript
// En console
const authState = JSON.parse(localStorage.getItem('wadi-auth-storage'));
console.log('Guest ID:', authState?.state?.guestId);

const convKey = `wadi_conv_${authState?.state?.guestId}`;
console.log('Conversation key:', convKey);

const conv = localStorage.getItem(convKey);
console.log('Conversation exists?', !!conv);
console.log('Conversation length:', conv?.length);

if (conv) {
  const parsed = JSON.parse(conv);
  console.log('Messages count:', parsed.length);
  console.table(parsed);
}
```

**Solución:**
```typescript
// Verificar que se esté guardando en chatStore.ts

// En sendMessage, después de recibir respuesta:
set((state) => {
  const updatedMessages = [...state.messages, assistantMessage];
  
  // CRUCIAL: Guardar en localStorage
  if (guestId) {
    const key = `wadi_conv_${guestId}`;
    console.log('💾 Saving to localStorage:', key);
    localStorage.setItem(key, JSON.stringify(updatedMessages));
  }
  
  return {
    messages: updatedMessages,
    sendingMessage: false
  };
});

// Verificar que se cargue en Chat.tsx:
useEffect(() => {
  if (!user && guestId && import.meta.env.VITE_GUEST_MODE === 'true') {
    const stored = localStorage.getItem(`wadi_conv_${guestId}`);
    console.log('📂 Loading from localStorage:', `wadi_conv_${guestId}`);
    console.log('📊 Stored data exists?', !!stored);
    
    if (stored) {
      try {
        const history = JSON.parse(stored);
        console.log('✅ Loaded messages:', history.length);
        useChatStore.setState({ messages: history });
      } catch (e) {
        console.error('❌ Error loading history:', e);
      }
    }
  }
}, [user, guestId]);
```

---

### Problema 4: Modal de nickname aparece siempre

**Síntoma:**
- Ingresas nickname
- Recargas
- Modal aparece de nuevo

**Debug:**
```javascript
// Ver si se guardó el nickname
const auth = JSON.parse(localStorage.getItem('wadi-auth-storage'));
console.log('Nickname:', auth?.state?.guestNick);

// Ver si el modal debería aparecer
const shouldShow = !auth?.state?.user && !auth?.state?.guestNick;
console.log('Should show modal?', shouldShow);
```

**Solución:**
```typescript
// Verificar en Chat.tsx:
useEffect(() => {
  if (!user && !guestNick && import.meta.env.VITE_GUEST_MODE === 'true') {
    console.log('🎭 Showing nickname modal');
    setShowNicknameModal(true);
  } else {
    console.log('🎯 Nickname exists:', guestNick);
  }
}, [user, guestNick]);

// Verificar que se guarde en authStore.ts:
setGuestNick: (nick: string) => {
  console.log('💾 Setting guest nick:', nick);
  set({ guestNick: nick });
  // El persist middleware de zustand debería guardar automáticamente
}

// Si no funciona, forzar guardado manual:
setGuestNick: (nick: string) => {
  set({ guestNick: nick });
  
  // Forzar guardado
  const state = get();
  localStorage.setItem('wadi-auth-storage', JSON.stringify({
    state: {
      guestId: state.guestId,
      guestNick: nick,
      user: null,
      session: null
    }
  }));
}
```

---

### Problema 5: Colores incorrectos (blanco invisible)

**Síntoma:**
- Mensajes de usuario son blancos sobre fondo blanco
- Botón "Enviar" es blanco sobre fondo blanco
- No se puede leer nada

**Debug:**
```javascript
// Inspeccionar elemento en DevTools
// Click derecho en mensaje → Inspeccionar

// Ver computed styles:
// background-color: rgb(250, 250, 250) ← #FAFAFA (mal)
// color: rgb(255, 255, 255) ← #FFFFFF (mal)

// Debería ser:
// background-color: rgb(59, 130, 246) ← #3B82F6 (azul)
// color: rgb(255, 255, 255) ← #FFFFFF (bien)
```

**Solución:**
```typescript
// En Chat.tsx, cambiar línea:
background: message.role === "user"
  ? theme.colors.accent.highlight // #3B82F6 AZUL ✅
  : theme.colors.background.secondary,

// NO usar:
background: message.role === "user"
  ? theme.colors.accent.primary // #FAFAFA BLANCO ❌
  : theme.colors.background.secondary,
```

---

## 🔬 Testing Avanzado

### Test de Carga:

```javascript
// Enviar 100 mensajes rápidamente
async function stressTest() {
  const messages = Array.from({length: 100}, (_, i) => 
    `Test message ${i + 1}`
  );
  
  for (const msg of messages) {
    await useChatStore.getState().sendMessage(msg);
    // Esperar un poco para no saturar
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log('Stress test complete');
  console.log('Messages in store:', useChatStore.getState().messages.length);
  console.log('Messages in localStorage:', 
    JSON.parse(localStorage.getItem('wadi_conv_XXX')).length
  );
}
```

### Test de Error Handling:

```javascript
// Simular error de red
async function testNetworkError() {
  // Detener backend (Ctrl+C en terminal)
  console.log('Backend stopped. Sending message...');
  
  try {
    await useChatStore.getState().sendMessage('Test');
  } catch (error) {
    console.log('✅ Error caught:', error);
  }
  
  // Verificar estado
  const state = useChatStore.getState();
  console.log('Error in state?', state.error);
  console.log('Still sending?', state.sendingMessage);
}
```

### Test de Performance:

```javascript
// Medir tiempo de renderizado
performance.mark('chat-start');

// Cargar 1000 mensajes
const manyMessages = Array.from({length: 1000}, (_, i) => ({
  id: `msg-${i}`,
  role: i % 2 === 0 ? 'user' : 'assistant',
  content: `Message ${i}`,
  created_at: new Date().toISOString()
}));

useChatStore.setState({ messages: manyMessages });

performance.mark('chat-end');
performance.measure('chat-render', 'chat-start', 'chat-end');

const measure = performance.getEntriesByName('chat-render')[0];
console.log(`Rendered 1000 messages in ${measure.duration.toFixed(2)}ms`);
```

---

## 📊 Métricas de Producción

### Custom Metrics:

```typescript
// Crear servicio de métricas
class MetricsService {
  private metrics = {
    requests: 0,
    errors: 0,
    avgResponseTime: 0,
    totalResponseTime: 0,
  };

  recordRequest(duration: number, error: boolean = false) {
    this.metrics.requests++;
    if (error) this.metrics.errors++;
    
    this.metrics.totalResponseTime += duration;
    this.metrics.avgResponseTime = 
      this.metrics.totalResponseTime / this.metrics.requests;
  }

  getMetrics() {
    return {
      ...this.metrics,
      errorRate: (this.metrics.errors / this.metrics.requests) * 100,
      uptime: process.uptime(),
    };
  }
}

export const metrics = new MetricsService();

// Uso en endpoint:
app.get('/metrics', (req, res) => {
  res.json(metrics.getMetrics());
});
```

---

## 🎓 Herramientas Externas

### 1. Postman/Thunder Client

```http
### Health Check
GET http://localhost:4000/health

### Send Message (Guest)
POST http://localhost:4000/api/chat
Content-Type: application/json
x-guest-id: test-guest-123

{
  "message": "Hola WADI",
  "messages": []
}
```

### 2. Chrome DevTools Performance

```
1. Abrir DevTools → Performance
2. Click en Record
3. Interactuar con la app (enviar mensajes)
4. Stop recording
5. Analizar:
   - Rendering time
   - JavaScript execution
   - Memory usage
   - Network requests
```

### 3. React DevTools Profiler

```
1. Instalar React DevTools extension
2. Abrir DevTools → Profiler
3. Start profiling
4. Enviar mensaje
5. Stop profiling
6. Ver:
   - Qué componentes re-renderizaron
   - Tiempo de cada render
   - Por qué se re-renderizó
```

---

## 🚨 Red Flags (Señales de Alerta)

### Backend:
- Response time > 5 segundos
- Error rate > 5%
- Memory usage creciendo constantemente
- CPU usage > 80% sostenido

### Frontend:
- FPS < 30 al scrollear
- Memory leaks (heap size creciendo)
- localStorage > 5MB
- Re-renders excesivos

---

## 🔍 Comandos Útiles

```bash
# Ver procesos en puerto 4000
netstat -ano | findstr :4000

# Ver uso de memoria de Node
node --inspect apps/api/src/index.ts
# Abrir chrome://inspect

# Limpiar node_modules y reinstalar
rm -rf node_modules
pnpm install

# Ver tamaño de localStorage
# En browser console:
new Blob(Object.values(localStorage)).size

# Exportar localStorage para backup
JSON.stringify(localStorage)

# Importar localStorage desde backup
Object.keys(backup).forEach(key => 
  localStorage.setItem(key, backup[key])
)
```

---

Esta guía cubre el 99% de problemas que puedas encontrar. ¿Necesitas ayuda con algún error específico?
