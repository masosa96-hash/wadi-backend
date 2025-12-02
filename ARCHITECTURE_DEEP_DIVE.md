# 🧠 ARQUITECTURA PROFUNDA - WADI BRAIN

## 📐 Diseño del Sistema

### Cerebro Dual (Kivo + Wadi)

WADI utiliza una arquitectura de **doble procesamiento** inspirada en la cognición humana:

```
USER INPUT
    ↓
┌───────────────────────┐
│   KIVO (Reasoning)    │ ← "Sistema 2" (Pensamiento deliberado)
│   - Analiza intención │
│   - Crea plan         │
│   - Evalúa contexto   │
└───────────────────────┘
    ↓ KivoThought
┌───────────────────────┐
│   WADI (Execution)    │ ← "Sistema 1" (Acción rápida)
│   - Ejecuta plan      │
│   - Llama tools       │
│   - Genera respuesta  │
└───────────────────────┘
    ↓ WadiAction
┌───────────────────────┐
│   OpenAI API          │ ← Generación de lenguaje natural
│   - GPT-3.5-turbo     │
│   - Conversacional    │
│   - Contextual        │
└───────────────────────┘
    ↓
USER RESPONSE
```

---

## 🔍 KIVO: El Motor de Razonamiento

### Responsabilidades:

1. **Análisis de Intención**: Clasifica el tipo de solicitud
2. **Planificación**: Crea pasos para cumplir la solicitud
3. **Contexto**: Determina qué información adicional se necesita
4. **Confianza**: Evalúa qué tan seguro está del análisis

### Tipos de Intent:

```typescript
type Intent =
  | "chat" // Conversación general
  | "command" // Comando directo (crear, eliminar, etc)
  | "query" // Búsqueda de información
  | "creation"; // Creación de recursos (proyecto, archivo, etc)
```

### Implementación Actual:

```typescript
// apps/api/src/services/brain/kivo.ts
export async function pensar(
  input: string,
  context: any = {},
): Promise<KivoThought> {
  const normalizedInput = input.toLowerCase().trim();

  // 1. Análisis de palabras clave (heurística simple)
  let intent: Intent = "chat";
  const reasoning: string[] = [];
  const plan: string[] = [];

  // 2. Detección de patrones
  if (includes("crear", "nuevo")) {
    intent = "creation";
    reasoning.push("Usuario quiere crear algo");
    plan.push("Identificar tipo de recurso");
    plan.push("Pedir detalles faltantes");
    plan.push("Ejecutar creación");
  }
  // ... más patrones

  // 3. Retornar pensamiento estructurado
  return {
    intent,
    confidence: 0.8,
    reasoning,
    plan,
    context_needed: [],
  };
}
```

### 🚀 Mejora Futura (LLM-based):

```typescript
// Versión avanzada con OpenAI para análisis
async function pensarConLLM(input: string, context: any) {
  const analysisPrompt = `
  Analiza la siguiente solicitud del usuario y determina:
  1. Intención principal (chat, command, query, creation)
  2. Nivel de confianza (0-1)
  3. Razonamiento (lista de puntos)
  4. Plan de acción (pasos)
  5. Contexto necesario
  
  Usuario: "${input}"
  Contexto: ${JSON.stringify(context)}
  
  Responde en JSON con estructura:
  {
    "intent": "...",
    "confidence": 0.0,
    "reasoning": ["...", "..."],
    "plan": ["...", "..."],
    "context_needed": ["...", "..."]
  }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Eres un asistente de análisis de intención.",
      },
      { role: "user", content: analysisPrompt },
    ],
    temperature: 0.3, // Baja para análisis consistente
  });

  return JSON.parse(response.choices[0].message.content);
}
```

---

## ⚡ WADI: El Motor de Ejecución

### Responsabilidades:

1. **Interpretación**: Lee el pensamiento de Kivo
2. **Ejecución**: Llama a las herramientas necesarias
3. **Generación**: Crea la respuesta final
4. **Validación**: Verifica que la acción fue exitosa

### Tipos de Acción:

```typescript
type ActionType =
  | "response" // Respuesta directa de texto
  | "tool_call" // Llamada a una herramienta externa
  | "error"; // Error en la ejecución
```

### Implementación Actual:

```typescript
// apps/api/src/services/brain/wadi.ts
export async function ejecutar(
  thought: KivoThought,
  context: any = {},
): Promise<WadiAction> {
  switch (thought.intent) {
    case "creation":
      return {
        type: "tool_call",
        payload: {
          tool: "create_resource",
          params: extractParams(context),
        },
        thought_process: thought,
      };

    case "query":
      return {
        type: "tool_call",
        payload: {
          tool: "search",
          query: extractQuery(context),
        },
        thought_process: thought,
      };

    case "chat":
    default:
      // Para chat, delega a generateChatCompletion
      return {
        type: "response",
        payload: {
          text: await generateAIResponse(context),
        },
        thought_process: thought,
      };
  }
}
```

### 🚀 Mejora Futura (Tool Registry):

```typescript
// Sistema de herramientas registradas
interface Tool {
  name: string;
  description: string;
  parameters: ParameterSchema;
  execute: (params: any) => Promise<any>;
}

class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool) {
    this.tools.set(tool.name, tool);
  }

  async execute(toolName: string, params: any) {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);

    // Validar parámetros
    this.validateParams(params, tool.parameters);

    // Ejecutar
    return await tool.execute(params);
  }
}

// Uso en Wadi:
async function ejecutarConTools(thought: KivoThought) {
  if (thought.intent === "creation") {
    const result = await toolRegistry.execute("create_project", {
      name: extractedName,
      type: extractedType,
    });

    return {
      type: "tool_call",
      payload: result,
      thought_process: thought,
    };
  }
}
```

---

## 🎯 Flujo Completo de un Mensaje

### Paso a Paso:

```
1. USER: "Hola WADI, ¿cómo estás?"
   │
   ↓
2. FRONTEND: chatStore.sendMessage()
   │
   ├─ Optimistic update (agrega mensaje al UI)
   ├─ Obtiene historial completo de localStorage
   └─ POST /api/chat
      Headers: { x-guest-id: "uuid" }
      Body: {
        message: "Hola WADI, ¿cómo estás?",
        messages: [
          { role: "user", content: "Mensaje anterior..." },
          { role: "assistant", content: "Respuesta anterior..." }
        ]
      }
   │
   ↓
3. BACKEND: authMiddleware
   │
   ├─ Detecta guest_id en header
   ├─ GUEST_MODE=true → permite paso
   └─ req.user_id = undefined (es guest)
   │
   ↓
4. BACKEND: chatController.sendMessage()
   │
   ├─ Detecta !userId && guestId → modo guest
   ├─ Prepara mensajes para OpenAI:
   │  [
   │    { role: "system", content: "Sos WADI..." },
   │    ...historial previo,
   │    { role: "user", content: "Hola WADI, ¿cómo estás?" }
   │  ]
   │
   ↓
5. BRAIN: pensar() (Kivo)
   │
   ├─ Analiza: "Hola WADI, ¿cómo estás?"
   ├─ Intent: "chat" (no detecta keywords especiales)
   ├─ Confidence: 0.8
   ├─ Reasoning: ["Standard conversation detected."]
   └─ Plan: ["Analyze sentiment", "Generate helpful response"]
   │
   ↓
6. BRAIN: ejecutar() (Wadi)
   │
   ├─ Lee thought.intent === "chat"
   ├─ Decisión: Usar OpenAI directamente
   └─ Llama generateChatCompletion(messages)
   │
   ↓
7. OPENAI: generateChatCompletion()
   │
   ├─ Model: "gpt-3.5-turbo"
   ├─ Max tokens: 1000
   ├─ Temperature: 0.7 (conversacional)
   ├─ Messages: [system, ...history, user]
   │
   ↓  [API CALL]
   │
   ← "¡Hola! Estoy muy bien, gracias por preguntar. ¿Cómo puedo ayudarte hoy?"
   │
   ↓
8. BACKEND: Retorna respuesta
   │
   Response: {
     ok: true,
     data: {
       reply: "¡Hola! Estoy muy bien...",
       assistantMessage: {
         role: "assistant",
         content: "¡Hola! Estoy muy bien...",
         created_at: "2025-11-23T15:30:00Z"
       },
       thought: { intent: "chat", confidence: 0.8, ... }
     }
   }
   │
   ↓
9. FRONTEND: Recibe respuesta
   │
   ├─ Agrega assistantMessage al state
   ├─ Guarda en localStorage:
   │  localStorage.setItem(`wadi_conv_${guestId}`, JSON.stringify([
   │    ...previousMessages,
   │    userMessage,
   │    assistantMessage
   │  ]))
   └─ UI actualiza automáticamente (React state)
   │
   ↓
10. USER: Ve la respuesta en pantalla
```

---

## 🔧 Optimizaciones Implementadas

### 1. **Persistencia Eficiente**

```typescript
// En chatStore.ts
const updatedMessages = [...state.messages, assistantMessage];

// Guarda solo si es guest
if (guestId) {
  localStorage.setItem(`wadi_conv_${guestId}`, JSON.stringify(updatedMessages));
}
```

**Por qué es eficiente:**

- Solo guarda cuando hay cambios
- Serializa solo los datos necesarios
- No hace round-trips a servidor

### 2. **Optimistic Updates**

```typescript
// Antes de enviar al servidor
set((state) => ({
  messages: [...state.messages, newUserMessage],
}));

// Usuario ve el mensaje inmediatamente
// No espera respuesta del servidor
```

**Beneficio:**

- UI instantánea
- Mejor experiencia de usuario
- Reduce sensación de lag

### 3. **Context Windowing**

```typescript
// Solo últimos 10 mensajes para contexto
const { data: history } = await supabase
  .from("messages")
  .select("role, content")
  .eq("conversation_id", currentConversationId)
  .order("created_at", { ascending: true })
  .limit(10); // ← LIMITADO
```

**Por qué:**

- Reduce tokens enviados a OpenAI
- Mantiene costos bajos
- OpenAI tiene límite de contexto (4096 tokens para gpt-3.5-turbo)

### 4. **Error Handling Robusto**

```typescript
try {
  const response = await api.post("/api/chat", {...});
  // ...
} catch (error: any) {
  console.error("Error sending guest message:", error);
  set({ error: "Error al enviar mensaje", sendingMessage: false });
}
```

**Cobertura:**

- Network errors
- API errors (405, 422, 500)
- OpenAI rate limits
- Validation errors

---

## 📊 Métricas y Monitoreo

### Logs Estructurados:

```typescript
// En chatController.ts
console.log(
  "[sendMessage] Request from:",
  userId ? `User ${userId}` : `Guest ${guestId}`,
  { message: message?.substring(0, 50), conversationId },
);

console.log("[sendMessage] Kivo thought:", thought);
console.log("[sendMessage] Calling OpenAI with", messages.length, "messages");
```

### Qué monitorear:

1. **Tiempo de respuesta**:

   ```typescript
   const start = Date.now();
   const response = await generateChatCompletion(messages);
   const duration = Date.now() - start;
   console.log(`[Perf] OpenAI responded in ${duration}ms`);
   ```

2. **Tasa de error**:

   ```typescript
   let errorCount = 0;
   let totalRequests = 0;

   try {
     totalRequests++;
     await sendMessage();
   } catch {
     errorCount++;
   }

   console.log(
     `Error rate: ${((errorCount / totalRequests) * 100).toFixed(2)}%`,
   );
   ```

3. **Uso de tokens**:
   ```typescript
   const completion = await openai.chat.completions.create({...});
   const tokensUsed = completion.usage?.total_tokens || 0;
   console.log(`[OpenAI] Used ${tokensUsed} tokens`);
   ```

---

## 🚀 Optimizaciones Futuras

### 1. **Streaming Responses**

```typescript
// En lugar de esperar toda la respuesta:
export async function* streamChatCompletion(messages) {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    stream: true, // ← STREAMING
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content; // Envía palabra por palabra
    }
  }
}
```

**Beneficio:**

- Usuario ve respuesta aparecer en tiempo real
- Sensación de "pensando" más natural
- Mejor UX

### 2. **Caching de Respuestas**

```typescript
// Cache para preguntas comunes
const responseCache = new Map<string, string>();

async function getCachedOrGenerate(input: string) {
  const normalized = input.toLowerCase().trim();

  if (responseCache.has(normalized)) {
    return responseCache.get(normalized)!;
  }

  const response = await generateChatCompletion([...]);
  responseCache.set(normalized, response);

  return response;
}
```

**Casos de uso:**

- "Hola" → Siempre similar
- "¿Qué puedes hacer?" → FAQ
- "Ayuda" → Guía

### 3. **Embeddings para Contexto Semántico**

```typescript
// Buscar mensajes relevantes del historial
async function getRelevantContext(query: string, allMessages) {
  // 1. Generar embedding del query
  const queryEmbedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });

  // 2. Calcular similitud con historial
  const scored = allMessages.map((msg) => ({
    ...msg,
    similarity: cosineSimilarity(
      queryEmbedding.data[0].embedding,
      msg.embedding,
    ),
  }));

  // 3. Tomar top 5 más relevantes
  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}
```

### 4. **Rate Limiting Inteligente**

```typescript
// Límite por usuario
const userRateLimits = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

function checkRateLimit(userId: string) {
  const limit = userRateLimits.get(userId);
  const now = Date.now();

  if (!limit || now > limit.resetAt) {
    userRateLimits.set(userId, {
      count: 1,
      resetAt: now + 60000, // 1 minuto
    });
    return true;
  }

  if (limit.count >= 10) {
    // Max 10 mensajes/minuto
    throw new Error("Rate limit exceeded");
  }

  limit.count++;
  return true;
}
```

---

## 🎓 Conceptos Avanzados

### Chain of Thought (Cadena de Pensamiento):

```typescript
// Hacer que el LLM "piense en voz alta"
const thoughtPrompt = `
Piensa paso a paso para responder:

Usuario pregunta: "${userMessage}"

Paso 1: ¿Qué información necesito?
Paso 2: ¿Cómo puedo estructurar la respuesta?
Paso 3: ¿Hay algo que deba aclarar?

Ahora responde al usuario:
`;

const response = await generateChatCompletion([
  { role: "system", content: thoughtPrompt },
  { role: "user", content: userMessage },
]);
```

### Few-Shot Learning (Ejemplos):

```typescript
const systemPrompt = `
Eres WADI, un asistente amigable. Ejemplos:

Usuario: "Hola"
WADI: "¡Hola! ¿En qué puedo ayudarte hoy?"

Usuario: "¿Qué haces?"
WADI: "Soy un asistente de IA. Puedo ayudarte con preguntas, crear proyectos, buscar información y más. ¿Qué necesitas?"

Usuario: "Adiós"
WADI: "¡Hasta luego! Que tengas un excelente día."

Ahora responde al usuario:
`;
```

### Temperature Control (Control de Creatividad):

```typescript
// Para respuestas más predecibles (FAQ, datos)
temperature: 0.3;

// Para conversación natural
temperature: 0.7;

// Para respuestas creativas (historias, ideas)
temperature: 0.9;
```

---

## 🔬 Debugging Avanzado

### Console Logs Estructurados:

```typescript
const DEBUG = process.env.DEBUG === "true";

function debugLog(category: string, ...args: any[]) {
  if (DEBUG) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${category}]`, ...args);
  }
}

// Uso:
debugLog("KIVO", "Analyzing input:", input);
debugLog("WADI", "Executing action:", action);
debugLog("OPENAI", "Response received:", response);
```

### Request Tracing:

```typescript
// Generar ID único para cada request
import { v4 as uuid } from "uuid";

function generateTraceId() {
  return uuid();
}

// En cada endpoint:
const traceId = generateTraceId();
req.traceId = traceId;

console.log(`[${traceId}] Request started`);
console.log(`[${traceId}] Kivo analysis complete`);
console.log(`[${traceId}] OpenAI call initiated`);
console.log(`[${traceId}] Response sent`);
```

---

## 📈 Benchmarks

### Tiempos Esperados:

```
Kivo (análisis):       ~10ms (heurístico)
Kivo (LLM-based):      ~500ms (futuro)
Wadi (ejecución):      ~5ms (routing)
OpenAI API:            ~1000-3000ms (depende del prompt)
Total (guest mode):    ~1000-3500ms
```

### Optimización de Costos:

```
Modelo: gpt-3.5-turbo
Precio: $0.0005 / 1K tokens (input)
        $0.0015 / 1K tokens (output)

Mensaje promedio: ~200 tokens total
Costo por mensaje: ~$0.0004
1000 mensajes: ~$0.40

GPT-4 sería:
1000 mensajes: ~$6.00 (15x más caro)
```

---

Esta es la arquitectura completa del cerebro de WADI. ¿Quieres que profundice en algún aspecto específico?
