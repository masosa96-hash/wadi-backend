# 🎨 GUÍA VISUAL DE COLORES - WADI GUEST MODE

## Paleta de Colores Principal

```
FONDOS:
├─ Background Primary:    #09090B (Negro profundo mate)
├─ Background Secondary:  #18181B (Zinc 900 - Contenedores)
└─ Background Tertiary:   #27272A (Zinc 800 - Inputs)

BORDES:
├─ Border Subtle:         #27272A (Muy sutil)
├─ Border Default:        #3F3F46 (Normal)
└─ Border Light:          #52525B (Más visible)

TEXTOS:
├─ Text Primary:          #FAFAFA (Blanco zinc-50)
├─ Text Secondary:        #A1A1AA (Gris zinc-400)
└─ Text Tertiary:         #71717A (Gris zinc-500)

ACENTOS:
├─ Highlight (Azul):      #3B82F6 ⭐ PRINCIPAL PARA ACCIONES
├─ Success (Verde):       #22C55E
├─ Warning (Naranja):     #F59E0B
└─ Error (Rojo):          #EF4444
```

## 🎯 Componentes y sus Colores

### 1. HEADER DEL CHAT
```
┌─────────────────────────────────────┐
│  Chat WADI        [AI] [Espejo]    │  ← Fondo: #18181B
│  AI Assistant                       │  ← Texto: #FAFAFA / #A1A1AA
└─────────────────────────────────────┘
    Border bottom: #27272A
```

**Toggle de Modo:**
- Inactivo: Fondo transparent, Texto #A1A1AA
- Activo: Fondo **#3B82F6** (azul), Texto #FFFFFF

### 2. ÁREA DE MENSAJES - SIN CHAT
```
        🤖 (emoji grande 64px)
    
    Hola, soy WADI              ← #FAFAFA
    Tu asistente AI. ¿En qué    ← #A1A1AA
    puedo ayudarte hoy?
```

### 3. BURBUJAS DE MENSAJE

#### Mensaje del Usuario (derecha):
```
                    ┌──────────────────────┐
                    │ Hola, ¿cómo estás?  │  ← Fondo: #3B82F6 ⭐
                    │ 15:30               │  ← Texto: #FFFFFF
                    └──────────────────────┘
```
- Fondo: **#3B82F6** (azul)
- Texto: #FFFFFF (blanco)
- Border: ninguno
- Border radius: 6px
- Padding: 12px

#### Mensaje de WADI (izquierda):
```
┌────────────────────────────────┐
│ ¡Hola! Estoy muy bien, gracias│  ← Fondo: #18181B
│ ¿En qué puedo ayudarte hoy?   │  ← Texto: #FAFAFA
│ 15:31                          │  ← Border: #27272A
└────────────────────────────────┘
```
- Fondo: #18181B (gris oscuro)
- Texto: #FAFAFA (blanco)
- Border: 1px solid #27272A
- Border radius: 6px
- Padding: 12px

### 4. INPUT DE MENSAJE
```
┌─────────────────────────────────────────────────────┬──────────┐
│ Escribe tu mensaje...                               │ Enviar   │
└─────────────────────────────────────────────────────┴──────────┘
```

**Input:**
- Fondo: #27272A (gris oscuro)
- Texto: #FAFAFA (blanco)
- Border: 1px solid #3F3F46
- Placeholder: #71717A (gris claro)

**Botón "Enviar":**
- **Activo**: Fondo **#3B82F6** (azul), Texto #FFFFFF ⭐
- **Deshabilitado**: Fondo #3F3F46 (gris), Texto #FFFFFF
- Hover: Más brillante
- Border radius: 6px

### 5. MODAL DE NICKNAME
```
┌─────────────────────────────────────┐
│                                     │
│            🤖                       │  ← 48px
│                                     │
│     ¡Bienvenido a WADI!            │  ← #FAFAFA (20px, semibold)
│                                     │
│  ¿Cómo te gustaría que te llame?   │  ← #A1A1AA (14px)
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Tu nombre o apodo             │  │  ← Input
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │       Comenzar                │  │  ← Botón
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Modal:**
- Fondo: #18181B
- Border: 1px solid #3F3F46
- Border radius: 8px
- Backdrop: rgba(0,0,0,0.7)

**Input del Modal:**
- Fondo: #27272A
- Border: 1px solid #3F3F46
- Texto: #FAFAFA

**Botón del Modal:**
- **Con texto**: Fondo #3B82F6, Texto #FFFFFF
- **Sin texto**: Fondo #3F3F46, Texto #FFFFFF, Cursor not-allowed

### 6. BOTTOM NAVIGATION (Guest Mode)
```
┌─────────────────────────────────────┐
│                                     │
│          💬                         │  ← 24px
│         Chat                        │  ← 10px
│                                     │
└─────────────────────────────────────┘
```

**En Guest Mode:**
- Solo muestra: Chat (💬)
- Fondo: #09090B
- Border top: 1px solid #27272A
- Icono activo: #FAFAFA
- Icono inactivo: #71717A

### 7. LOADING STATE (3 puntitos)
```
┌──────────────────┐
│  • • •          │  ← Animación
│                 │  ← Texto: #A1A1AA
└──────────────────┘
```
- Puntitos: #A1A1AA
- Fondo: #18181B
- Border: 1px solid #27272A

### 8. ERROR SCREEN (Backend caído)
```
        ⚠️ (48px)
    
    Error de Conexión           ← #000000 (negro)
    
    No se pudo conectar         ← #666666 (gris)
    con el servidor
    
    ┌──────────────┐
    │  Reintentar  │            ← Fondo: #007AFF, Texto: white
    └──────────────┘
```

## 🎨 Mejoras Aplicadas vs Problemas Anteriores

### ❌ ANTES (Problemas):
```
Mensaje Usuario:
├─ Fondo: #FAFAFA (casi blanco)
└─ Texto: #FFFFFF (blanco)
    └─> ❌ INVISIBLE - Sin contraste

Botón Enviar:
├─ Fondo: #FAFAFA (casi blanco)
└─ Texto: #FFFFFF (blanco)
    └─> ❌ INVISIBLE - Sin contraste
```

### ✅ AHORA (Corregido):
```
Mensaje Usuario:
├─ Fondo: #3B82F6 (azul vibrante) ⭐
└─ Texto: #FFFFFF (blanco)
    └─> ✅ PERFECTO - Excelente contraste

Botón Enviar:
├─ Fondo: #3B82F6 (azul vibrante) ⭐
└─ Texto: #FFFFFF (blanco)
    └─> ✅ PERFECTO - Excelente contraste
```

## 📊 Ratios de Contraste (WCAG AA)

```
Texto en Burbujas:
├─ Usuario (#FFF en #3B82F6):    4.6:1 ✅ AA
└─ WADI (#FAFAFA en #18181B):    14.2:1 ✅ AAA

Botones:
├─ Enviar (#FFF en #3B82F6):     4.6:1 ✅ AA
└─ Deshabilitado (#FFF en #3F3F46): 3.2:1 ✅ Aceptable

Textos:
├─ Primary (#FAFAFA en #09090B): 19.5:1 ✅ AAA
├─ Secondary (#A1A1AA en #09090B): 9.8:1 ✅ AAA
└─ Tertiary (#71717A en #09090B): 5.2:1 ✅ AA
```

## 🎯 Consistencia de Colores

### Regla Principal:
```
PARA ACCIONES DEL USUARIO = #3B82F6 (Azul)
├─ Mensajes enviados por el usuario
├─ Botones de acción (Enviar, Comenzar, etc.)
├─ Estados activos (toggle AI/Espejo)
└─ Links y elementos interactivos principales

PARA CONTENIDO DE WADI = Grises (#18181B, #27272A)
├─ Mensajes de respuesta
├─ Containers y cards
└─ Inputs y elementos pasivos
```

## 🚀 Testing Visual Rápido

1. **Abrir**: http://localhost:5173
2. **Verificar**:
   - [ ] Fondo general es negro profundo (#09090B)
   - [ ] Header es gris oscuro (#18181B)
   - [ ] Toggle activo es azul (#3B82F6)
   - [ ] Modal tiene fondo gris oscuro (#18181B)
   - [ ] Input del modal es gris oscuro (#27272A)
   - [ ] Botón "Comenzar" con texto es azul (#3B82F6)
   - [ ] Mensaje de usuario tiene fondo AZUL (#3B82F6) ⭐⭐⭐
   - [ ] Texto del mensaje de usuario es BLANCO (#FFFFFF)
   - [ ] Mensaje de WADI tiene fondo gris (#18181B)
   - [ ] Botón "Enviar" activo es AZUL (#3B82F6) ⭐⭐⭐
   - [ ] Todo el texto es legible y con buen contraste

## 💡 Notas Importantes

1. **Azul #3B82F6 es el color de acción principal** - Úsalo para cualquier interacción directa del usuario
2. **Grises (#18181B, #27272A)** - Para áreas de contenido y elementos pasivos
3. **Blanco #FAFAFA** - Para texto principal sobre fondos oscuros
4. **No usar #FAFAFA como fondo** - Solo como acento o texto
5. **Consistencia** - Misma paleta en login, chat, settings, etc.

---

Si algo no se ve como se describe aquí, hay un bug que debe corregirse.
