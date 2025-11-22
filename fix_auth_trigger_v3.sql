-- ============================================
-- WADI - Fix Auth Trigger (v3)
-- ============================================
-- Propósito: Crear automáticamente un perfil en 'profiles' 
-- cuando un usuario se registra en 'auth.users'
--
-- Problema: Los usuarios nuevos no tienen perfil y fallan al hacer login
-- Solución: Trigger que inserta en 'profiles' usando metadata de auth
-- ============================================

-- 1. Eliminar trigger y función anteriores (si existen)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Crear función que maneja la creación del perfil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name_value TEXT;
BEGIN
  -- Extraer display_name de los metadatos (si existe)
  display_name_value := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'displayName',
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1) -- Fallback: parte antes del @ en email
  );

  -- Insertar perfil en la tabla profiles
  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,                           -- ID del usuario de auth
    NEW.email,                        -- Email del usuario
    display_name_value,               -- Nombre a mostrar
    NEW.raw_user_meta_data->>'avatar_url', -- Avatar (opcional)
    NOW(),                            -- Timestamp de creación
    NOW()                             -- Timestamp de actualización
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 3. Crear trigger que ejecuta la función después de INSERT en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Verificar RLS policies para tabla profiles
-- Permitir que los usuarios vean y editen su propio perfil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Permitir INSERT desde el trigger (SECURITY DEFINER ya lo permite)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Comentarios para futuro
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates a profile entry when a new user signs up';

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS
  'Triggers profile creation for new auth users';

-- ============================================
-- INSTRUCCIONES DE USO
-- ============================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Verificar que las policies estén activas:
--    SELECT * FROM pg_policies WHERE tablename = 'profiles';
-- 3. Probar registro de nuevo usuario
-- 4. Verificar que aparezca en tabla profiles:
--    SELECT * FROM profiles WHERE email = 'test@example.com';
-- ============================================
