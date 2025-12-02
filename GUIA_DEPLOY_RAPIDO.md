# Guía de Despliegue Rápido (WADI)

## 1) Completar Railway (backend)

1. Abrí el archivo en tu repo: `apps/api/.env.railway.example`
2. Andá a **Railway** → servicio backend de WADI → pestaña **Variables**.
3. Creá cada variable con el mismo nombre y poné los valores reales:

### De Supabase → Settings → API

- `SUPABASE_URL` = `https://smkbiguvgiscojwxgbae.supabase.co`
- `SUPABASE_ANON_KEY` = `<anon>`
- `SUPABASE_SERVICE_KEY` = `<service_role>`
- `JWT_SECRET` = `<JWT secret>` (Recordá: en Railway esto puede ir en Secrets si usás Railpack, o como variable normal si no)

### De Groq

- `GROQ_API_KEY` = `<tu key>`

### Opcionales

- `OPENAI_API_KEY` (si lo usás)

### Varios

- `OPENAI_DEFAULT_MODEL` = `gpt-3.5-turbo`
- `GROQ_DEFAULT_MODEL` = `llama-3.1-8b-instant`
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `FRONTEND_URL` = `http://localhost:5173` (por ahora, después lo cambiamos a Vercel)
- `PNPM_VERSION` = `10.21.0`

1. Guardás todo y hacés **Deploy / Redeploy** en Railway.
2. Cuando termine, copiá la **URL pública del backend** (ej: `https://loquesea.up.railway.app`).

---

## 2) Completar Vercel (frontend)

1. Abrí el archivo: `apps/frontend/.env.vercel.example`
2. Andá a **Vercel** → tu proyecto frontend → Settings → **Environment Variables (Production)**.
3. Creá:

- `VITE_SUPABASE_URL` = `https://smkbiguvgiscojwxgbae.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `<anon>` (la misma que en Railway)
- `VITE_API_URL` = `<URL del backend de Railway>` (la que copiaste en el paso anterior)
- `VITE_GUEST_MODE` = `true`

1. Guardás y hacés **Deploy** en Vercel.
2. Copiás la **URL pública de Vercel** (ej: `https://wadi-frontend.vercel.app`).

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

---

## 4) Base de Datos (Importante)

Para que el chat funcione correctamente (especialmente el modo invitado), necesitás ejecutar estos scripts SQL en tu **Supabase Dashboard** → **SQL Editor**.

### A. Fix Missing Column (Si te da error de "column user_id does not exist")

```sql
-- Add user_id column to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
```

### B. Fix Missing RPC (Para el chat de invitados)

```sql
CREATE OR REPLACE FUNCTION get_or_create_default_conversation(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to get the most recent conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE user_id = p_user_id
  ORDER BY updated_at DESC
  LIMIT 1;

  -- If no conversation exists, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (user_id, title)
    VALUES (p_user_id, 'Conversa con WADI')
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Copiá y pegá cada bloque en el editor SQL de Supabase y dale a **Run**.
