# Guía de Despliegue Rápido (WADI)

## 1) Completar Railway (backend)

1. Abrí el archivo en tu repo: `apps/api/.env.railway.example`
2. Andá a **Railway** → servicio backend de WADI → pestaña **Variables**.
3. Creá cada variable con el mismo nombre y poné los valores reales:

### De Supabase → Settings → API:
- `SUPABASE_URL` = `https://smkbiguvgiscojwxgbae.supabase.co`
- `SUPABASE_ANON_KEY` = `<anon>`
- `SUPABASE_SERVICE_KEY` = `<service_role>`
- `JWT_SECRET` = `<JWT secret>` (Recordá: en Railway esto puede ir en Secrets si usás Railpack, o como variable normal si no)

### De Groq:
- `GROQ_API_KEY` = `<tu key>`

### Opcionales:
- `OPENAI_API_KEY` (si lo usás)

### Varios:
- `OPENAI_DEFAULT_MODEL` = `gpt-3.5-turbo`
- `GROQ_DEFAULT_MODEL` = `llama-3.1-8b-instant`
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `FRONTEND_URL` = `http://localhost:5173` (por ahora, después lo cambiamos a Vercel)
- `PNPM_VERSION` = `10.21.0`

4. Guardás todo y hacés **Deploy / Redeploy** en Railway.
5. Cuando termine, copiá la **URL pública del backend** (ej: `https://loquesea.up.railway.app`).

---

## 2) Completar Vercel (frontend)

1. Abrí el archivo: `apps/frontend/.env.vercel.example`
2. Andá a **Vercel** → tu proyecto frontend → Settings → **Environment Variables (Production)**.
3. Creá:

- `VITE_SUPABASE_URL` = `https://smkbiguvgiscojwxgbae.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `<anon>` (la misma que en Railway)
- `VITE_API_URL` = `<URL del backend de Railway>` (la que copiaste en el paso anterior)
- `VITE_GUEST_MODE` = `true`

4. Guardás y hacés **Deploy** en Vercel.
5. Copiás la **URL pública de Vercel** (ej: `https://wadi-frontend.vercel.app`).

---

## 3) Ajuste final y prueba

1. Volvé a **Railway** → **Variables**.
2. Cambiá `FRONTEND_URL` a la URL real de Vercel:
   - `FRONTEND_URL` = `https://wadi-frontend.vercel.app`
3. **Redeploy** backend.
4. Abrí en el navegador la URL de Vercel.
5. Probá entrar en **modo invitado**.
6. Mandá un mensaje en el chat.

> Si algo falla, revisá la consola del navegador (F12) o los logs de Railway/Vercel.
