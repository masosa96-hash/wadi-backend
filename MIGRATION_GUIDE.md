# Guía de Migraciones de Base de Datos - WADI P5-P9

## 📋 Resumen

Este documento explica cómo ejecutar las migraciones de base de datos necesarias para los proyectos P5, P6, P8 y P9.

## 🗂️ Migraciones Disponibles

### 001_workspace_enhancements.sql (P5)
**Descripción**: Workspaces dinámicos con creación automática y organización de conversaciones

**Cambios**:
- ✅ Añade campos a `workspaces`: `is_auto_created`, `detected_topic`, `message_count`, `last_message_at`
- ✅ Crea tabla `workspace_conversations` (unión workspace-conversación)
- ✅ Añade `workspace_id` a `conversations`
- ✅ Funciones: `update_workspace_stats()`, `move_conversation_to_workspace()`
- ✅ Trigger automático para actualizar stats al crear mensajes
- ✅ Migra conversaciones existentes al workspace default del usuario

**Impacto**: Bajo riesgo, backwards compatible

---

### 002_files_and_storage.sql (P6)
**Descripción**: Sistema completo de subida, almacenamiento y procesamiento de archivos

**Cambios**:
- ✅ Crea tabla `files` (metadata de archivos)
- ✅ Crea tabla `file_processing_queue` (cola de procesamiento)
- ✅ Añade campos a `messages`: `has_attachments`, `attachment_count`
- ✅ Función `get_conversation_file_context()` para obtener contexto de archivos
- ✅ Trigger automático para actualizar contadores de archivos en mensajes
- ⚠️ **NOTA**: Requiere crear bucket de Supabase Storage manualmente (ver paso adicional)

**Impacto**: Bajo riesgo, solo añade tablas nuevas

**Pasos adicionales**:
```sql
-- Ejecutar en Supabase SQL Editor (con autenticación)
INSERT INTO storage.buckets (id, name, public) VALUES ('user-files', 'user-files', false);

-- Policies de storage
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

### 003_user_memory.sql (P6)
**Descripción**: Sistema de memoria de usuario para personalización

**Cambios**:
- ✅ Crea tabla `user_memory` (preferencias y contexto del usuario)
- ✅ Crea tabla `memory_templates` (plantillas de memoria default)
- ✅ Función `get_user_memory_for_chat()` para obtener memoria activa
- ✅ Función `upsert_user_memory()` para guardar/actualizar memoria
- ✅ Función `initialize_user_memory()` que asigna defaults a nuevo usuario
- ✅ Trigger automático en creación de usuario
- ✅ Inicializa memoria para usuarios existentes

**Impacto**: Bajo riesgo, solo añade sistema de memoria

---

### 004_onboarding.sql (P8)
**Descripción**: Sistema de onboarding y experiencia de primer uso

**Cambios**:
- ✅ Añade campos a `profiles`: `onboarding_completed`, `onboarding_step`, `first_login_at`, etc.
- ✅ Crea tabla `onboarding_events` (analytics de onboarding)
- ✅ Crea tabla `user_permissions` (permisos de voz, archivos, etc.)
- ✅ Crea tabla `first_time_tips` (tips para nuevos usuarios)
- ✅ Crea tabla `user_tips_seen` (tracking de tips vistos)
- ✅ Funciones: `complete_user_onboarding()`, `record_user_login()`
- ✅ Inserta tips default en español

**Impacto**: Bajo riesgo, solo añade tracking de onboarding

---

### 005_monetization.sql (P9)
**Descripción**: Sistema de planes, límites y medición de uso

**Cambios**:
- ✅ Crea tabla `subscription_plans` (Free, Pro, Business)
- ✅ Crea tabla `user_subscriptions` (suscripciones activas)
- ✅ Crea tabla `usage_metrics` (uso agregado por mes)
- ✅ Crea tabla `usage_events` (log detallado de uso)
- ✅ Funciones: `get_or_create_current_usage()`, `get_user_active_subscription()`, `check_usage_limit()`, `track_usage_event()`
- ✅ Inserta planes default (Free, Pro, Business)
- ✅ Asigna plan Free a usuarios existentes
- ✅ Trigger automático para asignar plan a nuevos usuarios

**Impacto**: Medio - añade límites y medición

**Planes creados**:
| Plan | Mensajes/mes | Archivos/mes | Tamaño archivo | Workspaces | Precio |
|------|-------------|--------------|----------------|------------|--------|
| Free | 50 | 5 | 5 MB | 3 | $0 |
| Pro | 500 | 50 | 25 MB | 20 | $9.99 |
| Business | ∞ | ∞ | 100 MB | ∞ | $29.99 |

---

## 🚀 Cómo Ejecutar las Migraciones

### Opción 1: Supabase Dashboard (Recomendado)

1. **Ir a Supabase Dashboard**
   - Abrí tu proyecto en https://app.supabase.com
   - Andá a **SQL Editor** en el menú lateral

2. **Ejecutar migraciones en orden**
   - Crear una nueva query para cada migración
   - Copiar el contenido de cada archivo `.sql`
   - Ejecutar en orden:
     1. `001_workspace_enhancements.sql`
     2. `002_files_and_storage.sql` + pasos adicionales de storage
     3. `003_user_memory.sql`
     4. `004_onboarding.sql`
     5. `005_monetization.sql`

3. **Verificar**
   - Revisar que no haya errores en la consola
   - Verificar que las tablas se crearon correctamente

### Opción 2: CLI de Supabase (Avanzado)

```bash
# 1. Instalar Supabase CLI si no lo tenés
npm install -g supabase

# 2. Inicializar proyecto (si aún no está)
supabase init

# 3. Linkar a tu proyecto
supabase link --project-ref TU_PROJECT_REF

# 4. Crear migraciones
# Los archivos ya están en apps/api/migrations/

# 5. Aplicar migraciones
supabase db push

# 6. Verificar estado
supabase db status
```

### Opción 3: Script SQL directo (PostgreSQL)

```bash
# Conectar a tu base de datos de Supabase
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Ejecutar migraciones en orden
\i apps/api/migrations/001_workspace_enhancements.sql
\i apps/api/migrations/002_files_and_storage.sql
\i apps/api/migrations/003_user_memory.sql
\i apps/api/migrations/004_onboarding.sql
\i apps/api/migrations/005_monetization.sql
```

---

## ✅ Verificación Post-Migración

### Verificar Tablas Creadas

```sql
-- Ver todas las tablas nuevas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'workspace_conversations',
    'files',
    'file_processing_queue',
    'user_memory',
    'memory_templates',
    'onboarding_events',
    'user_permissions',
    'first_time_tips',
    'user_tips_seen',
    'subscription_plans',
    'user_subscriptions',
    'usage_metrics',
    'usage_events'
  );
```

### Verificar Funciones Creadas

```sql
-- Ver funciones nuevas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%workspace%'
     OR routine_name LIKE '%memory%'
     OR routine_name LIKE '%usage%'
     OR routine_name LIKE '%onboarding%';
```

### Verificar Datos Default

```sql
-- Verificar planes creados
SELECT plan_key, display_name, max_messages_per_month, price_monthly 
FROM subscription_plans 
ORDER BY display_order;

-- Verificar templates de memoria
SELECT key, default_value, memory_type 
FROM memory_templates 
WHERE is_active = true;

-- Verificar tips de onboarding
SELECT tip_key, title 
FROM first_time_tips 
WHERE is_active = true 
ORDER BY display_order;
```

### Verificar Migración de Datos Existentes

```sql
-- Verificar que usuarios existentes tengan suscripción
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT us.user_id) as users_with_subscription
FROM profiles p
LEFT JOIN user_subscriptions us ON us.user_id = p.user_id;

-- Verificar que conversaciones estén asignadas a workspaces
SELECT 
  COUNT(*) as total_conversations,
  COUNT(workspace_id) as conversations_with_workspace
FROM conversations;

-- Verificar memoria inicializada
SELECT 
  COUNT(DISTINCT user_id) as users_with_memory
FROM user_memory;
```

---

## 🔧 Troubleshooting

### Error: "relation already exists"
**Solución**: La tabla ya fue creada previamente. Podés ignorar o usar `IF NOT EXISTS` (ya incluido en migraciones).

### Error: "permission denied for table storage.objects"
**Solución**: Las policies de storage deben ejecutarse con autenticación en Supabase Dashboard, no por CLI.

### Error: "function does not exist"
**Solución**: Asegurate de ejecutar las migraciones en orden. Algunas funciones dependen de tablas creadas en migraciones anteriores.

### Rollback de migración
Si necesitás revertir:

```sql
-- Ejemplo: Eliminar todo lo de P9
DROP TABLE IF EXISTS usage_events CASCADE;
DROP TABLE IF EXISTS usage_metrics CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP FUNCTION IF EXISTS track_usage_event CASCADE;
-- etc...
```

---

## 📊 Impacto en Performance

- **Índices agregados**: ~15 nuevos índices
- **Triggers**: 5 triggers nuevos (ligeros, solo actualizan contadores)
- **Funciones**: 15+ funciones PostgreSQL (ejecutan on-demand)
- **Impacto estimado**: < 1% overhead en queries existentes
- **Espacio en disco**: ~10-50 MB adicionales (dependiendo de uso)

---

## 🔐 Seguridad

Todas las migraciones incluyen:
- ✅ Foreign keys con `ON DELETE CASCADE` apropiados
- ✅ Constraints de validación en campos enum
- ✅ Índices para prevenir scans completos de tabla
- ✅ Políticas RLS preparadas para Supabase
- ✅ Separación de datos por usuario (`user_id`)

---

## 📝 Próximos Pasos

Después de ejecutar las migraciones:

1. ✅ **Actualizar variables de entorno** (si es necesario)
2. ✅ **Implementar controllers del backend** (filesController, memoryController, etc.)
3. ✅ **Actualizar stores del frontend** (filesStore, billingStore, etc.)
4. ✅ **Probar localmente** con datos de prueba
5. ✅ **Deploy a producción** siguiendo `DEPLOYMENT_GUIDE.md`

---

## 📞 Soporte

Si tenés problemas ejecutando las migraciones:
1. Verificá los logs de Supabase Dashboard
2. Revisá que tu plan de Supabase tenga espacio suficiente
3. Consultá la documentación de Supabase sobre migraciones
4. Ejecutá las queries de verificación de arriba

---

**Última actualización**: 20 de Noviembre, 2025
