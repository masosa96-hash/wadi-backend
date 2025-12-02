# 🚀 WADI Production Deployment Guide

## ✅ Local Setup - COMPLETADO

- ✅ Backend running on port 4000
- ✅ Frontend running on port 5174
- ✅ Supabase connected
- ✅ OpenAI connected
- ✅ Health check: OK

---

## 📋 Step 1: Railway Backend Deployment

### 1.1 Configure Environment Variables in Railway

Ir a Railway Dashboard → Tu proyecto → Variables:

```bash
# Database & Auth
SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxMTgyMywiZXhwIjoyMDc4OTg3ODIzfQ.uDFNhOGqGb4kv3DWcVHdRoPjCSUhL_IJURaTRtqJZNE

# AI Service
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo

# Server Config
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.vercel.app

# Security
JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3
```

### 1.2 Deploy Backend to Railway

```bash
# Desde la raíz del proyecto
cd e:\WADI

# Option A: Push to Railway (si ya está conectado a Git)
git add .
git commit -m "chore: update OpenAI API key for production"
git push origin main
# Railway auto-deploys from main branch

# Option B: Manual deploy con Railway CLI
railway up
```

### 1.3 Obtener URL de Railway

Después del deploy, Railway te dará una URL tipo:

```
https://wadi-api-production.up.railway.app
```

**Guardá esta URL** para el siguiente paso.

---

## 📋 Step 2: Vercel Frontend Deployment

### 2.1 Actualizar Variables de Entorno en Vercel

Ir a Vercel Dashboard → Tu proyecto → Settings → Environment Variables:

```bash
# API Configuration
VITE_API_URL=https://tu-proyecto.up.railway.app

# Database & Auth (mismo que Railway)
VITE_SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM

# Features
VITE_GUEST_MODE=true
```

### 2.2 Deploy Frontend to Vercel

```bash
# Opción A: Desde Vercel Dashboard
# Click "Redeploy" en el último deployment

# Opción B: Desde CLI
cd e:\WADI
vercel --prod
```

### 2.3 Actualizar FRONTEND_URL en Railway

**IMPORTANTE**: Después de que Vercel te dé la URL final del frontend, volvé a Railway y actualizá:

```bash
FRONTEND_URL=https://tu-frontend.vercel.app
```

Y redeploy el backend en Railway para que tome el nuevo CORS.

---

## 🧪 Step 3: Verificación en Producción

### 3.1 Test Backend Health

```bash
# Reemplazá con tu URL real de Railway
curl https://tu-proyecto.up.railway.app/api/health
```

**Resultado esperado:**

```json
{
  "status": "ok",
  "supabase": "connected",
  "openai": "connected",
  "timestamp": "2025-11-24T..."
}
```

### 3.2 Test Frontend

1. Abrir en navegador: `https://tu-frontend.vercel.app`
2. Verificar DevTools → Console (no debe haber errores de conexión)
3. Verificar DevTools → Network → health request debe ser 200 OK

---

## 🔧 Troubleshooting

### Si Backend no conecta a OpenAI en producción:

```bash
# Verificar que la variable esté configurada en Railway
railway variables

# Ver logs en tiempo real
railway logs
```

### Si Frontend no conecta al Backend:

1. Verificar que `VITE_API_URL` esté correctamente configurada en Vercel
2. Verificar que `FRONTEND_URL` en Railway apunte al dominio de Vercel
3. Revisar CORS errors en browser console

### Si Supabase no conecta:

- Verificar que las URLs no tengan espacios al principio/final
- Confirmar que las keys sean las mismas en Railway y Vercel (frontend usa VITE\_ prefix)

---

## 📝 Quick Commands Reference

```bash
# Railway CLI
railway login
railway link
railway up
railway logs
railway variables

# Vercel CLI
vercel login
vercel --prod
vercel logs

# Test production health
curl https://YOUR-RAILWAY-URL/api/health
curl https://YOUR-RAILWAY-URL/health
```

---

## ✅ Final Checklist

- [ ] Backend deployed to Railway with all ENV vars
- [ ] Backend health check returns `"status": "ok"`
- [ ] Frontend deployed to Vercel with VITE_API_URL pointing to Railway
- [ ] Frontend can load without console errors
- [ ] Frontend can call backend API successfully
- [ ] CORS configured correctly (FRONTEND_URL in Railway matches Vercel URL)
- [ ] OpenAI connected in production
- [ ] Supabase connected in production

---

## 🎯 Next Steps After Deployment

1. Test user registration/login flow
2. Test chat functionality
3. Monitor Railway logs for errors
4. Set up custom domain (optional)
5. Configure production monitoring/alerts

---

**Local development is 100% working ✅**
**Ready for production deployment 🚀**
