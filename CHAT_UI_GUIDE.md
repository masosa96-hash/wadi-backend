# WADI Chat - Guía Visual de Interfaz 🎨

## 📱 Pantallas Implementadas

### 1. Home (Modificada)

**Ruta:** `/home`

**Cambios realizados:**

- ✅ Hero input ahora navega a `/chat` (antes iba a `/workspaces/default`)
- ✅ Card "Conversa con WADI" ahora navega a `/chat`
- ✅ Bottom nav "Workspaces" ahora navega a `/chat`

**Elementos clave:**

```
┌─────────────────────────────────────┐
│  WADI            🔔  👤             │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ╭─────────────────────────────╮   │
│  │    [W] WADI Orb (pulsante)  │   │
│  │                             │   │  ← Hero Card
│  │  Hola, soy WADI.           │   │
│  │  ¿Qué hacemos hoy?         │   │
│  │                             │   │
│  │  ┌─────────────────────┐   │   │
│  │  │ Contame qué...  ✈️  │   │   │  ← Input + Send
│  │  └─────────────────────┘   │   │
│  ╰─────────────────────────────╯   │
│                                     │
│  Lo que venimos trabajando          │
│  ╭─────────────────────────────╮   │
│  │ 💬  Conversa con WADI       │   │  ← Main Card
│  │     Tu espacio principal    │   │     (Click → /chat)
│  ╰─────────────────────────────╯   │
│                                     │
├─────────────────────────────────────┤
│  🏠    💼    📜    👤              │  ← Bottom Nav
│ Home  Chat  Hist  Perfil           │
└─────────────────────────────────────┘
```

---

### 2. Chat (Nueva)

**Ruta:** `/chat`

**Estructura:**

```
┌─────────────────────────────────────┐
│  ← Conversa con WADI      [W]      │  ← Header
│     Tu espacio principal            │
├─────────────────────────────────────┤
│                                     │
│  [W]  ┌──────────────────┐         │  ← Mensaje WADI
│       │ Hola! ¿Cómo      │         │     (blanco/glass)
│       │ puedo ayudarte?  │         │
│       └──────────────────┘         │
│                                     │
│           ┌──────────────────┐     │  ← Mensaje Usuario
│           │ Hola WADI, todo  │     │     (gradiente azul)
│           │ bien, gracias    │     │
│           └──────────────────┘     │
│                                     │
│  [W]  ┌──────────────────┐         │  ← Mensaje WADI
│       │ • • •             │         │     (typing indicator)
│       └──────────────────┘         │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ Escribime como si...     ✈️  │  │  ← Input fijo
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Características visuales:**

#### Header

- Botón back (←) para volver a Home
- Título: "Conversa con WADI"
- Subtítulo: "Tu espacio principal de trabajo"
- Orb de WADI pulsante con animación

#### Área de Mensajes

- **Mensajes de usuario:**
  - Alineados a la derecha
  - Gradiente azul-morado
  - Texto blanco
  - Sin avatar
  - Shadow azul sutil

- **Mensajes de WADI:**
  - Alineados a la izquierda
  - Fondo blanco/glass con blur
  - Texto oscuro
  - Avatar "W" con gradiente
  - Border sutil

- **Typing indicator:**
  - Tres puntos animados (bouncing)
  - Color azul primario
  - Aparece mientras WADI está "pensando"

#### Input Area

- Fijo en la parte inferior
- Textarea multilinea
  - Placeholder: "Escribime como si me hablaras a un amigo…"
  - Auto-resize hasta 120px
  - Enter envía, Shift+Enter nueva línea
- Botón de envío circular (✈️)
  - Gradiente azul
  - Glow animado al hover
  - Disabled si no hay texto

---

## 🎨 Elementos de Diseño

### Colores

```
Gradiente Principal: #255FF5 → #7B8CFF
Gradiente Button:    #255FF5 0%, #7B8CFF 100%

Background:
  - Primary:    #FFFFFF
  - Secondary:  rgba(255, 255, 255, 0.95)
  - Glass:      rgba(255, 255, 255, 0.9)

Text:
  - Primary:    #0F172A
  - Secondary:  #64748B
  - Tertiary:   #94A3B8

Border:
  - Light:      #D6E1F2
  - Subtle:     rgba(214, 225, 242, 0.5)
  - Accent:     rgba(37, 95, 245, 0.3)

Error:          #EF4444
```

### Tipografía

```
Font Family: Inter, system-ui, sans-serif

Tamaños:
  - h1: 28px
  - h2: 20px
  - h3: 18px
  - body: 16px
  - bodySmall: 14px
  - caption: 12px

Weights:
  - bold: 700
  - semibold: 600
  - medium: 500
  - normal: 400
```

### Espaciado

```
xs:  4px
sm:  8px
md:  12px
lg:  16px
xl:  24px
2xl: 32px
```

### Border Radius

```
small:  6px
medium: 8px
large:  16px
xlarge: 24px
```

---

## 🎭 Animaciones

### Entrada de Mensajes

```typescript
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.3, delay: index * 0.05 }
```

### Orb de WADI (Header)

```typescript
animate: {
  scale: [1, 1.05, 1],
  boxShadow: [
    "0 0 20px rgba(37, 95, 245, 0.3)",
    "0 0 30px rgba(37, 95, 245, 0.5)",
    "0 0 20px rgba(37, 95, 245, 0.3)",
  ]
}
transition: { duration: 3, repeat: Infinity }
```

### Typing Indicator

```typescript
animate: { y: [-3, 0, -3] }
transition: {
  duration: 0.6,
  repeat: Infinity,
  delay: i * 0.15  // Para cada punto
}
```

### Botón de Envío

```typescript
whileHover: {
  scale: 1.08,
  boxShadow: "0 0 20px rgba(37, 95, 245, 0.4)"
}
whileTap: { scale: 0.95 }
```

---

## 📐 Layout Responsivo

### PhoneShell

- Ancho máximo: 480px
- Altura mínima: 100vh
- Centrado horizontal
- Shadow externa sutil

### Área de Mensajes

```css
flex: 1
overflow: auto
padding: 16px
paddingBottom: 120px  /* Para el input fijo */
```

### Input Fijo

```css
position: sticky
bottom: 0
background: rgba(255, 255, 255, 0.95)
backdropFilter: blur(20px)
boxShadow: 0 -4px 24px rgba(15, 23, 42, 0.06)
```

---

## 🔄 Estados de la UI

### Estado Vacío (Primera vez)

```
┌─────────────────────────────────────┐
│                                     │
│              💬                     │
│        (animación rotación)         │
│                                     │
│   ¡Empecemos a conversar!           │
│                                     │
│   Escribime lo que necesités        │
│   y te ayudo con lo que sea         │
│                                     │
└─────────────────────────────────────┘
```

### Enviando Mensaje

```
┌─────────────────────────────────────┐
│                                     │
│           ┌──────────────────┐     │
│           │ Mi mensaje aquí  │     │  ← Aparece inmediato
│           └──────────────────┘     │
│                                     │
│  [W]  ┌──────────────────┐         │
│       │ • • •             │         │  ← Typing indicator
│       └──────────────────┘         │
│                                     │
└─────────────────────────────────────┘
```

### Error

```
┌─────────────────────────────────────┐
│  ⚠️ No pude enviar el mensaje.   ✕ │  ← Banner rojo
│     Intentá de nuevo.               │
├─────────────────────────────────────┤
│  ... mensajes normales ...          │
└─────────────────────────────────────┘
```

---

## 🎯 Interacciones del Usuario

### 1. Enviar mensaje desde Home

```
Home > Hero Input
  ↓
Escribir "Hola WADI"
  ↓
Click ✈️ o Enter
  ↓
Navigate → /chat (state: { initialMessage: "Hola WADI" })
  ↓
Chat.tsx recibe state
  ↓
useEffect envía automáticamente
  ↓
Aparece mensaje + respuesta
```

### 2. Enviar mensaje desde Chat

```
Chat > Input
  ↓
Escribir mensaje
  ↓
Click ✈️ o Enter
  ↓
chatStore.sendMessage()
  ↓
Input se limpia
  ↓
Mensaje aparece
  ↓
Typing indicator
  ↓
Respuesta aparece
```

### 3. Multilinea

```
Chat > Input
  ↓
Escribir texto
  ↓
Shift + Enter → Nueva línea
Enter solo → Enviar
```

### 4. Volver a Home

```
Chat > Header
  ↓
Click ← (back button)
  ↓
Navigate → /home
  ↓
Conversación queda guardada
```

---

## 🌟 Detalles de Pulido

### Glassmorphism

- **Hero card:** `backdrop-filter: blur(10px)`
- **Mensajes WADI:** `backdrop-filter: blur(10px)`
- **Input area:** `backdrop-filter: blur(20px)`

### Shadows

- **User messages:** `0 4px 12px rgba(37, 95, 245, 0.2)`
- **WADI messages:** `0 4px 12px rgba(15, 23, 42, 0.08)`
- **Input:** `0 4px 16px rgba(15, 23, 42, 0.12)`

### Auto-scroll

- Referencia: `messagesEndRef`
- Comportamiento: `smooth scroll` al agregar mensaje
- Se mantiene en el fondo al recibir nuevos mensajes

### Accesibilidad

- Input con placeholder descriptivo
- Estados disabled claros (opacidad 0.5)
- Cursor `not-allowed` cuando disabled
- Focus visible en inputs

---

## 📱 Flujo de Navegación Completo

```
Login (/login)
  ↓
Home (/home)
  ↓
  ├─→ Hero Input + Enter → Chat (/chat) [con mensaje inicial]
  ├─→ Card "Conversa..." → Chat (/chat) [vacío]
  └─→ Bottom Nav "Chat" → Chat (/chat) [vacío]
       ↓
       Chat (/chat)
         ↓
         ├─→ Back button ← Home (/home)
         ├─→ Bottom Nav → Otras páginas
         └─→ Escribir y conversar → Stay in Chat
```

---

## 🎬 Resumen Visual

**Lo que el usuario ve:**

1. **Home:**
   - Orb de WADI pulsante
   - Input con prompt amigable
   - Card principal para chat

2. **Chat:**
   - Header elegante con back button
   - Mensajes diferenciados (burbujas)
   - Animaciones suaves
   - Input siempre visible
   - Typing indicator cuando WADI piensa

3. **Transiciones:**
   - Fade in/out suaves
   - Slide animations
   - No cortes bruscos
   - Loading states claros

**Resultado:** Una experiencia fluida, moderna y amigable que mantiene la identidad visual de WADI. 🎨✨
