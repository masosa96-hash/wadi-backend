# WADI - Plan de Correcciones Críticas

## 🔴 Tareas Críticas (Prioridad Alta)

### 1. Error de DB en login de usuario nuevo ✅ EN PROGRESO

**Problema**: Al registrarse, falta crear el perfil en la tabla `profiles`.

**Solución**:

- Recrear el trigger `handle_new_user` en Supabase
- Verificar RLS policies en tabla `profiles`
- Asegurar que `auth.users.raw_user_meta_data` contenga `display_name`

**Archivos**:

- `fix_auth_trigger_v3.sql` (nuevo)
- `apps/frontend/src/store/authStore.ts` (verificar metadata en signUp)

---

### 2. "Olvidaste tu contraseña" no muestra nada ✅ VERIFICADO

**Estado**: La página existe y funciona (`ForgotPassword.tsx`)

**Verificación necesaria**:

- ✅ Formulario presente
- ✅ Manejo de success/error
- ✅ Integración con Supabase `requestPasswordReset`
- ⚠️ Verificar que esté en las rutas (`router.tsx`)

---

### 3. Error final en build prod ✅ RESUELTO

**Estado**: `pnpm run build` pasa exitosamente

- Build genera `dist/` correctamente
- 0 errores en Vite

---

## 🟡 Tareas Importantes (UX/Diseño)

### 4. Botón "Iniciar sesión" en blanco ⏳ PENDIENTE

**Archivos a revisar**:

- `apps/frontend/src/pages/Login.tsx`
- `apps/frontend/src/components/Button.tsx`

**Acciones**:

- Verificar label visible
- Asegurar contraste
- Estados hover/disabled/loading

---

### 5. Cambiar slogan "Walking Disaster" → "Del caos al plan" ⏳ PENDIENTE

**Ocurrencias encontradas**:

- `apps/frontend/src/pages/Home.tsx` línea 123

**Buscar también en**:

- Onboarding
- Chat header
- Splash/loading
- Meta tags (SEO)
- i18n files (`locales/`)

---

### 6. Pantalla se aclara/brilla ⏳ PENDIENTE

**Investigar**:

- Cambios de tema global
- Overlays/modales con fondo claro
- Tokens de color inconsistentes

---

### 7. Agregar textura al fondo ⏳ PENDIENTE

**Implementación**:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise SVG */
  opacity: 0.03;
  pointer-events: none;
  z-index: -1;
}
```

---

## 🟢 Backlog (Futuras Features)

### Chat anónimo entre usuarios

- Sistema de alias/match
- Reportar/bloquear spam
- No exponer datos reales

### Sugerencias de chats por patrón (IA)

- Detectar emociones/temas recurrentes
- Match con perfiles compatibles
- Opt-in + filtros

### Equipo de automantenimiento

- Detectar errores frontend/backend
- Auto-retry, rollback, logging
- Aprendizaje de correcciones

---

## 📊 Estado General

| Tarea                  | Prioridad | Estado                      |
| ---------------------- | --------- | --------------------------- |
| Error DB usuario nuevo | 🔴 Alta   | ⏳ En progreso              |
| Forgot Password        | 🔴 Alta   | ✅ Funciona, verificar ruta |
| Build Vite             | 🔴 Alta   | ✅ Resuelto                 |
| Botón login blanco     | 🟡 Media  | ⏳ Pendiente                |
| Cambiar slogan         | 🟡 Media  | ⏳ Pendiente                |
| Pantalla brilla        | 🟡 Media  | ⏳ Pendiente                |
| Textura fondo          | 🟡 Media  | ⏳ Pendiente                |
| Features backlog       | 🟢 Baja   | 📝 Planeado                 |

---

## ✅ Próximos Pasos

1. Crear trigger SQL para auto-creación de profiles
2. Verificar botón de login
3. Reemplazar slogan en todos los archivos
4. Agregar textura CSS al fondo
5. Investigar tema inconsistente
