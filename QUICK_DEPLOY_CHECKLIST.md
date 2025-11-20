# ✅ Quick Deploy Checklist

## Pre-requisitos
- [ ] Cuenta en [Vercel](https://vercel.com) (gratis)
- [ ] Cuenta en [Render](https://render.com) (gratis)
- [ ] Repositorio en GitHub con código de WADI
- [ ] Proyecto Supabase configurado
- [ ] API Key de OpenAI

---

## 🎯 Deploy en 5 Pasos

### 1️⃣ Preparar Supabase
- [ ] Obtener `SUPABASE_URL` desde Supabase Dashboard → Settings → API
- [ ] Obtener `SUPABASE_ANON_KEY` (public key)
- [ ] Obtener `SUPABASE_SERVICE_KEY` (secret key) ⚠️ Solo para backend
- [ ] Ejecutar migraciones en SQL Editor (carpeta `apps/api/migrations/`)

### 2️⃣ Deploy Backend (Render)
1. [ ] Ir a [render.com/dashboard](https://dashboard.render.com)
2. [ ] Click "New +" → "Web Service"
3. [ ] Conectar repositorio GitHub
4. [ ] Render detectará `render.yaml` automáticamente
5. [ ] Configurar Environment Variables:
   ```
   FRONTEND_URL = (dejar vacío por ahora, completar después)
   SUPABASE_URL = tu_supabase_url
   SUPABASE_ANON_KEY = tu_anon_key
   SUPABASE_SERVICE_KEY = tu_service_key
   OPENAI_API_KEY = sk-...
   ```
6. [ ] Click "Create Web Service"
7. [ ] Esperar ~3 minutos para el deploy
8. [ ] **Copiar la URL** (ej: `https://wadi-api.onrender.com`)
9. [ ] Verificar en: `https://tu-api.onrender.com/health`

### 3️⃣ Deploy Frontend (Vercel)
1. [ ] Ir a [vercel.com/dashboard](https://vercel.com/dashboard)
2. [ ] Click "Add New..." → "Project"
3. [ ] Importar repositorio GitHub
4. [ ] Vercel detectará automáticamente la configuración
5. [ ] Configurar Environment Variables:
   ```
   VITE_SUPABASE_URL = tu_supabase_url
   VITE_SUPABASE_ANON_KEY = tu_anon_key
   VITE_API_URL = https://wadi-api.onrender.com
   ```
6. [ ] Click "Deploy"
7. [ ] Esperar ~2 minutos para el deploy
8. [ ] **Copiar la URL** (ej: `https://wadi.vercel.app`)

### 4️⃣ Actualizar CORS en Backend
1. [ ] Volver a Render dashboard
2. [ ] Ir a tu servicio → Environment
3. [ ] Actualizar `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://wadi.vercel.app
   ```
4. [ ] Guardar cambios → Render hará redeploy automático

### 5️⃣ Verificación Final
- [ ] Frontend carga correctamente en tu URL de Vercel
- [ ] Login funciona
- [ ] Backend responde en `/health`
- [ ] CORS configurado (no hay errores en consola del navegador)
- [ ] Chat funciona correctamente

---

## 🔄 Auto-Deploy Configurado

Cada vez que hagas `git push` a la rama `main`:
- ✅ Vercel desplegará automáticamente el frontend
- ✅ Render desplegará automáticamente el backend

---

## 🚨 Solución de Problemas Comunes

### "Build failed" en Vercel
**Solución:** Revisá los logs en Vercel dashboard. Usualmente es por variables de entorno faltantes.

### "Service Unavailable" en Render
**Solución:** El deploy puede tardar 3-5 minutos. Esperá un poco y refrescá.

### CORS Error
**Solución:** Verificá que `FRONTEND_URL` en Render sea exactamente la URL de Vercel (sin `/` al final).

### "Database connection failed"
**Solución:** Verificá las credenciales de Supabase. Asegurate que las migraciones se ejecutaron.

---

## 📱 URLs Finales

Después de completar todos los pasos, tendrás:

- **Frontend:** `https://tu-app.vercel.app`
- **Backend:** `https://tu-api.onrender.com`
- **Health Check:** `https://tu-api.onrender.com/health`

---

## 💡 Próximos Pasos (Opcional)

- [ ] Configurar dominio custom en Vercel
- [ ] Configurar dominio custom en Render
- [ ] Agregar monitoring con Vercel Analytics
- [ ] Configurar alertas en Render
- [ ] Habilitar preview deployments para PRs

---

## 🎉 ¡Listo!

Tu app WADI está desplegada y lista para usar en producción.

**Tiempo total estimado:** 15-20 minutos
