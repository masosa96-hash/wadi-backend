# 🚀 DEPLOY NOW - Quick Reference

**Para deployar WADI a Vercel AHORA:**

---

## ⚡ Deploy en 2 Comandos

```powershell
cd E:\WADI
vercel --prod
```

**¡Eso es todo!**

---

## 🛡️ O usar el Script Seguro

```powershell
cd E:\WADI
.\deploy-vercel.ps1
```

El script te guía paso a paso.

---

## ⚠️ IMPORTANTE

**SIEMPRE deployá desde:** `E:\WADI` (raíz del repo)  
**NUNCA desde:** `E:\WADI\apps\frontend`

**¿Por qué?** Vercel ya tiene configurado `Root Directory = apps/frontend`, así que él solito va al directorio correcto.

---

## 🔍 Primera Vez Deploying?

1. **Login a Vercel:**
   ```powershell
   vercel login
   ```

2. **Configurar Variables de Entorno** (solo primera vez):
   - Ir a [Vercel Dashboard](https://vercel.com/dashboard)
   - Seleccionar tu proyecto
   - Settings → Environment Variables
   - Agregar:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_API_URL` (tu Railway URL)

3. **Deploy:**
   ```powershell
   cd E:\WADI
   vercel --prod
   ```

---

## ✅ Verificar Deployment

```powershell
# Ver deployments
vercel ls

# Info del deployment
vercel inspect

# Probar que funcione
curl -I https://[TU-URL]
```

---

## 🆘 Problemas?

- **Error de path:** Asegurate de estar en `E:\WADI`
- **No logueado:** `vercel login`
- **Build falla:** Ver `VERCEL_DEPLOYMENT_FIX.md`

---

## 📚 Más Info

- `VERCEL_DEPLOYMENT_FIXED.md` - Guía completa en español
- `DEPLOYMENT_GUIDE.md` - Documentación técnica
- `QUICK_DEPLOY.md` - Deploy paso a paso
- `deploy-vercel.ps1` - Script automatizado

---

**¡Deploy con confianza! 🎉**
