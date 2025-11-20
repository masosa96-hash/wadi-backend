# 🔑 Cómo Obtener SUPABASE_SERVICE_KEY

## ⚠️ Acción Requerida

Tu configuración está casi completa. Solo falta un paso:

**Completar `SUPABASE_SERVICE_KEY` en `apps/api/.env`**

---

## 📋 Pasos para Obtener la Service Role Key

### 1. Ir a tu Proyecto de Supabase

Abrí: https://app.supabase.com/

### 2. Seleccionar tu Proyecto

Tu proyecto actual es:
- **URL**: `https://smkbiguvgiscojwxgbae.supabase.co`
- **Project**: `smkbiguvgiscojwxgbae`

### 3. Ir a Project Settings

1. Click en el ícono de **⚙️ Settings** en la barra lateral izquierda
2. Click en **API** en el menú de Settings

### 4. Copiar la Service Role Key

Vas a ver dos secciones:

#### Project API keys
```
┌─────────────────────────────────────────┐
│ anon public                              │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │  ← Ya la tenés
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ service_role secret                      │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │  ← Copiá esta
└─────────────────────────────────────────┘
```

**⚠️ IMPORTANTE**: La `service_role` key tiene privilegios de administrador. **NUNCA** la expongas en el frontend.

### 5. Reemplazar en apps/api/.env

Abrí el archivo: `apps/api/.env`

Buscá la línea:
```env
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Reemplazá con:
```env
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
```

### 6. Guardar y Reiniciar Backend

Si el backend está corriendo:
1. Detené el servidor (Ctrl+C)
2. Ejecutá de nuevo: `pnpm --filter api dev`

---

## ✅ Verificar que Funcionó

Ejecutá el script de verificación:
```powershell
.\test-chat-ready.ps1
```

Deberías ver:
```
✅ SUPABASE_SERVICE_KEY configurada
```

---

## 🤔 ¿Por Qué Necesito Esta Key?

La `service_role` key se usa en el **backend** para:

1. **Crear/actualizar conversaciones** sin restricciones RLS (Row Level Security)
2. **Guardar mensajes** en nombre de cualquier usuario autenticado
3. **Ejecutar operaciones administrativas** en la base de datos

**Frontend** usa solo la `anon` key (ya configurada) ✅

---

## 🔐 Seguridad

### ✅ Buenas Prácticas

- ✅ Service Role Key **solo en backend** (`apps/api/.env`)
- ✅ Anon Key en frontend (`apps/frontend/.env`)
- ✅ Nunca commitear `.env` a Git
- ✅ Archivo `.gitignore` ya ignora `.env`

### ❌ NO HACER

- ❌ NO expongas `service_role` key en el frontend
- ❌ NO la subas a GitHub/repositorios públicos
- ❌ NO la compartas en mensajes/screenshots

---

## 🎯 Resumen

```bash
# 1. Ir a Supabase Dashboard
https://app.supabase.com/project/smkbiguvgiscojwxgbae/settings/api

# 2. Copiar "service_role secret"

# 3. Pegar en apps/api/.env
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Reiniciar backend
Ctrl+C
pnpm --filter api dev

# 5. Verificar
.\test-chat-ready.ps1
```

---

## ✅ Siguiente Paso

Una vez completado esto, ejecutá:

```powershell
# Verificar que todo está OK
.\test-chat-ready.ps1

# Si todo está ✅, iniciar los servicios
pnpm --filter api dev      # Terminal 1
pnpm --filter frontend dev # Terminal 2
```

Luego seguí el **CHECKLIST_PRUEBA_CHAT.md** para probar el chat completo.

---

**¿Necesitás ayuda?** Reportá en qué paso te trabás.
