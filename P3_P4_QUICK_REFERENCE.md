# WADI P3+P4 - Quick Reference Guide

## 🎨 P3: Premium Web3 Aesthetics

### Glassmorphism System
Use estas clases CSS en tus componentes:

```jsx
// Surface glass estándar
<div className="glass-surface">...</div>

// Surface glass más opaco
<div className="glass-surface-heavy">...</div>

// Border gradiente (experimental)
<div className="glass-border">...</div>
```

### WADI Orb Component
```jsx
import WadiOrb from "../components/WadiOrb";

// Small (44px) - Para headers
<WadiOrb size="small" showPulse={true} />

// Medium (64px) - Para hero cards
<WadiOrb size="medium" showPulse={true} />

// Large (80px) - Para splash screens
<WadiOrb size="large" showPulse={false} />
```

### CSS Tokens Nuevos
```css
/* Glassmorphism */
var(--glass-surface)        /* rgba(255,255,255,0.7) */
var(--glass-surface-heavy)  /* rgba(255,255,255,0.85) */
var(--glass-blur)           /* 12px */
var(--glass-blur-heavy)     /* 20px */

/* Gradientes */
var(--gradient-border)      /* Para bordes glassmorphic */
```

---

## 🚀 P4: New Features

### 1. Favoritos

#### Store
```jsx
import { useFavoritesStore } from "../store/favoritesStore";

const { 
  favorites,          // Array de favoritos
  loading,            // Estado de carga
  error,              // Mensaje de error
  loadFavorites,      // Cargar favoritos
  addFavorite,        // Agregar favorito
  removeFavorite,     // Eliminar favorito
  isFavorited,        // Verificar si está favorito
} = useFavoritesStore();
```

#### Uso básico
```jsx
// Cargar favoritos
useEffect(() => {
  loadFavorites();
}, []);

// Agregar favorito
await addFavorite(messageId, conversationId);

// Eliminar favorito
await removeFavorite(messageId);

// Verificar
const isFav = isFavorited(messageId);
```

#### API Endpoints
```
GET    /api/favorites              - Listar favoritos del usuario
POST   /api/favorites              - Agregar favorito
DELETE /api/favorites/:message_id  - Eliminar favorito
GET    /api/favorites/check/:id    - Verificar estado
```

### 2. Plantillas

#### Store
```jsx
import { useTemplatesStore, Template } from "../store/templatesStore";

const { 
  templates,          // Array de plantillas
  loading,            // Estado de carga
  error,              // Mensaje de error
  loadTemplates,      // Cargar plantillas
  getTemplateById,    // Obtener por ID
} = useTemplatesStore();
```

#### Template Interface
```typescript
interface Template {
  id: string;                                    // 'ideas-rapidas'
  name: string;                                  // 'Ideas rápidas'
  description: string;                           // 'Generá ideas...'
  prompt: string;                                // 'Necesito ideas...'
  icon: string;                                  // '💡'
  category: 'general' | 'social' | 'productivity';
}
```

#### Plantillas Disponibles
1. 💡 **Ideas rápidas** (general)
2. 📱 **Texto para Instagram** (social)
3. 📝 **Resumen** (productivity)
4. 📋 **Plan de proyecto** (productivity)
5. ✨ **Mejorar texto** (general)
6. ✅ **Checklist** (productivity)

#### Navegar con Template
```jsx
// Desde Templates page
navigate("/chat", { 
  state: { templatePrompt: template.prompt } 
});

// El Chat recibe el prompt y lo pone en el input
```

#### API Endpoints
```
GET /api/templates         - Listar todas
GET /api/templates?category=social  - Filtrar por categoría
GET /api/templates/:id     - Obtener específica
```

### 3. Modo Voz

#### En Chat Component
```jsx
const [isListening, setIsListening] = useState(false);
const [voiceSupported, setVoiceSupported] = useState(false);

// Detectar soporte
useEffect(() => {
  const SpeechRecognition = 
    window.SpeechRecognition || window.webkitSpeechRecognition;
  setVoiceSupported(!!SpeechRecognition);
}, []);

// Usar voz
const handleVoiceInput = () => {
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-AR';
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInputMessage(prev => prev + ' ' + transcript);
  };
  recognition.start();
};
```

#### UI
- 🎤 Botón micrófono cuando `voiceSupported === true`
- ⏸️ Icono cuando `isListening === true`
- Background rojo cuando escuchando

#### Soporte
- ✅ Chrome/Edge (Web Speech API)
- ✅ Android Chrome
- ❌ Firefox (no soportado)
- ❌ Safari (limitado)

---

## 🗂️ Nuevas Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/favorites` | `Favorites.tsx` | Lista de mensajes favoritos |
| `/templates` | `Templates.tsx` | Plantillas rápidas categorized |

### Acceso desde Home
```jsx
// Quick action chips
const quickActions = [
  { label: "Historial", path: "/projects" },
  { label: "Favoritos", path: "/favorites" },     // NUEVO
  { label: "Plantillas rápidas", path: "/templates" }, // NUEVO
];
```

---

## 🎯 Navigation Patterns

### Template → Chat
```jsx
// From Templates page
navigate("/chat", { 
  state: { templatePrompt: "Ayudame a..." } 
});

// Chat receives it
const { templatePrompt } = location.state;
useEffect(() => {
  if (templatePrompt) setInputMessage(templatePrompt);
}, [templatePrompt]);
```

### Favorite → Chat
```jsx
// From Favorites page
navigate("/chat", { 
  state: { conversationId: favorite.conversation_id } 
});

// Chat loads that conversation
const { conversationId } = location.state;
useEffect(() => {
  if (conversationId) loadConversation(conversationId);
}, [conversationId]);
```

---

## 🗄️ Database Schema

### Favorites Table
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  message_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  created_at TIMESTAMP,
  UNIQUE(user_id, message_id)
);
```

**Indices**:
- `idx_favorites_user_id`
- `idx_favorites_message_id`
- `idx_favorites_conversation_id`
- `idx_favorites_created_at`

**RLS Policies**: Enabled
- Users can view/create/delete own favorites only

---

## 📝 Empty States (Rioplatense)

### Favoritos
```
"Todavía no guardaste nada. Cuando algo te sirva, 
marcá ⭐ en el chat y lo vas a encontrar acá"
```

### Plantillas (si vacío)
```
"No hay plantillas disponibles en este momento"
```

### Notificaciones
```
"Pronto vas a ver tus recordatorios y alertas acá."
```

---

## 🎨 Design Tokens Quick Reference

### Colors
```css
--color-accent-primary: #255FF5   /* Blue */
--color-accent-secondary: #7B8CFF /* Blue-lilac */
--color-accent-y2k: #C5B3FF       /* Lilac */
```

### Gradients
```css
--gradient-primary: linear-gradient(135deg, #255FF5 0%, #7B8CFF 50%, #C5B3FF 100%);
--gradient-hero: linear-gradient(135deg, #255FF5 0%, #7B8CFF 100%);
--gradient-button: linear-gradient(135deg, #255FF5 0%, #4A7BF7 100%);
```

### Glow Effects
```css
.glow-primary   /* Blue glow */
.glow-secondary /* Blue-lilac glow */
.glow-y2k       /* Lilac glow */
.glow-orb       /* Orb multi-layer glow */
```

---

## 🔧 Development Tips

### Testing Favorites
```bash
# 1. Crear favorito desde Postman/curl
curl -X POST http://localhost:4000/api/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message_id":"MSG_ID","conversation_id":"CONV_ID"}'

# 2. Ver en UI
# Navegar a /favorites
```

### Testing Templates
```bash
# 1. Obtener templates
curl http://localhost:4000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Ver en UI
# Navegar a /templates y click en cualquier card
```

### Testing Voice
1. Abrir Chrome/Edge
2. Ir a `/chat`
3. Click botón 🎤
4. Permitir micrófono
5. Hablar en español
6. Ver transcript en input

---

## ✅ Pre-flight Checklist

Antes de deployar P3+P4:

- [ ] Database migration ejecutada (`004_favorites.sql`)
- [ ] ENV variables configuradas en Railway/Vercel
- [ ] Backend build sin errores (`pnpm --filter api build`)
- [ ] Frontend build sin errores (`pnpm --filter frontend build`)
- [ ] Testeado Favorites end-to-end
- [ ] Testeado Templates end-to-end
- [ ] Testeado Voice en Chrome
- [ ] Verificado glassmorphism en todas las pantallas
- [ ] PhoneShell responsive OK en mobile

---

**Documentación completa**: `P3_P4_IMPLEMENTATION_COMPLETE.md`
