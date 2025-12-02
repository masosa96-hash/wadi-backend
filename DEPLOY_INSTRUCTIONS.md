# Instrucciones de Despliegue y Configuración Final

## 1. Configuración de Vercel (Panel de Control)

1.  **Authentication**:
    - Ve a **Settings** > **Deployment Protection**.
    - Desactiva **Vercel Authentication** (Password Protection).
    - Asegúrate de que el despliegue sea público.

2.  **Environment Variables**:
    - Ve a **Settings** > **Environment Variables**.
    - Agrega las siguientes variables (para Production y Preview):
      - `VITE_SUPABASE_URL`: Tu URL de Supabase.
      - `VITE_SUPABASE_ANON_KEY`: Tu clave anónima de Supabase.
      - `VITE_API_URL`: URL de tu backend (si aplica, o la misma URL del frontend si usas funciones serverless/proxy, pero por ahora apunta a tu API desplegada).

3.  **Redeploy**:
    - Ve a la pestaña **Deployments**.
    - Haz clic en el botón de tres puntos en el último commit y selecciona **Redeploy** (sin "Use existing build cache" si es posible, para asegurar que tome las nuevas variables y configs).

## 2. Base de Datos (Supabase)

1.  **Ejecutar Script SQL**:
    - Abre el **SQL Editor** en tu dashboard de Supabase.
    - Copia el contenido del archivo `fix_auth_trigger_v3.sql` (ubicado en la raíz del proyecto).
    - Ejecútalo para crear el trigger que genera perfiles automáticamente y configurar las políticas RLS.

## 3. Verificación

1.  **Login**:
    - Entra a `/login`.
    - Verifica que el botón "Iniciar sesión" sea visible y tenga buen contraste.
    - Prueba el enlace "¿Olvidaste tu contraseña?".

2.  **Registro**:
    - Registra un usuario nuevo.
    - Verifica en la tabla `profiles` de Supabase que se haya creado el registro correspondiente.

## Cambios Realizados en el Código

- **`apps/frontend/vercel.json`**: Configurado para SPA (rewrites a `/`).
- **`apps/frontend/package.json`**:
  - Agregado `"engines": { "node": ">=20" }`.
  - Agregado `"name": "frontend"`.
- **`apps/api/package.json`**:
  - Agregado `"engines": { "node": ">=20" }`.
- **`apps/frontend/src/store/authStore.ts`**: Verificado fallback manual para creación de perfiles.
- **`apps/frontend/src/pages/Login.tsx`**: Verificado contraste de botón.
- **`apps/frontend/src/pages/ForgotPassword.tsx`**: Verificado flujo y diseño.

## Estado del Build

El comando `pnpm build` se ejecutó exitosamente en el entorno local.
