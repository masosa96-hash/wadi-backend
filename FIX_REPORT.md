# Reporte de Correcciones y Pasos Finales

## 1. Supabase: Error 422 en Signup

Este error suele ocurrir cuando el cliente no envía un token de Captcha pero Supabase lo espera, o si el registro está desactivado.

**Acción Manual Requerida (en Supabase Dashboard):**

1.  Ve a **Authentication** > **Settings** (o **Providers** > **Email**).
2.  **Desactiva** "Enable Captcha protection" (Turnstile / hCaptcha).
3.  Asegúrate de que **Enable Signups** esté **ON**.
4.  Verifica que la longitud mínima de contraseña coincida con tu validación frontend (ej. 6 caracteres).

## 2. Railway: Backend no responde (o responde HTML)

El problema principal es que el Frontend está intentando contactar al Backend, pero la URL configurada (`VITE_API_URL`) probablemente apunta al mismo Frontend o a una URL incorrecta, causando que recibas HTML (la página 404/index del frontend) o errores 405.

**He actualizado `railway.json` en el repositorio** para asegurar que el monorepo se construya correctamente:
*   **Build Command**: `pnpm install && pnpm --filter @wadi/chat-core build && pnpm --filter api build` (Asegura que las dependencias internas se compilen).
*   **Start Command**: `node apps/api/dist/index.js`.

**Acción Manual Requerida (en Railway):**

1.  Ve a tu proyecto en Railway.
2.  Asegúrate de que el servicio esté conectado a este repositorio.
3.  Ve a **Settings** > **Build & Deploy**.
4.  Verifica que el **Root Directory** sea `/` (la raíz del repo), NO `apps/api`.
5.  Dispara un **Redeploy**.
6.  Una vez desplegado, copia la **Public Networking URL** (ej. `https://api-production.up.railway.app`).

**Acción Manual Requerida (en Vercel):**

1.  Ve a **Settings** > **Environment Variables**.
2.  Actualiza `VITE_API_URL` con la URL que copiaste de Railway (ej. `https://api-production.up.railway.app`). **¡No uses localhost ni la URL de Vercel!**
3.  **Redeploy** en Vercel.

## Resumen de Archivos Modificados

*   **`railway.json`**: Configuración corregida para construir `chat-core` y `api` en orden.
*   **`apps/api/package.json`**: (Previamente) Se aseguró `engines: node >= 20`.
