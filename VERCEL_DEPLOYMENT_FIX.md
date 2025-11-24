# 🚀 VERCEL DEPLOYMENT - QUICK FIX

## ❌ Problema

Cuando Vercel tiene configurado `Root Directory = apps/frontend` y corres `vercel --prod` desde `E:\WADI\apps\frontend`, intenta acceder a `apps/frontend/apps/frontend` y falla.

## ✅ Solución 1: Deploy desde la raíz (Recomendada)

```powershell
# Siempre deployar desde la raíz del monorepo
cd E:\WADI
vercel --prod
```

### O usando el script:
```powershell
cd E:\WADI
.\deploy-vercel.ps1
```

## ✅ Solución 2: Cambiar Root Directory en Vercel

Si preferís deployar desde `apps/frontend`:

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar tu proyecto WADI
3. Ir a **Settings** → **General**
4. Buscar **Root Directory**
5. Cambiar de `apps/frontend` a `.` (vacío o punto)
6. Click **Save**
7. Redeploy:
   ```powershell
   cd E:\WADI\apps\frontend
   vercel --prod
   ```

## 📋 Explicación

### Con Root Directory = `apps/frontend`:
- Vercel espera que corras el comando desde la **raíz del repositorio** (`E:\WADI`)
- Vercel automáticamente va a `apps/frontend` según la configuración
- ✅ Correcto: `cd E:\WADI && vercel --prod`
- ❌ Incorrecto: `cd E:\WADI\apps\frontend && vercel --prod`

### Con Root Directory = `.` (vacío):
- Deploy desde donde quieras
- ✅ Correcto: `cd E:\WADI\apps\frontend && vercel --prod`
- ⚠️ Nota: Puede requerir configuración adicional del monorepo

## 🎯 Recomendación

**Mantén `Root Directory = apps/frontend` en Vercel y siempre deployá desde `E:\WADI`**

Esto es consistente con la estructura del monorepo y funciona perfectamente con el script `deploy-vercel.ps1`.

## 🔍 Verificar configuración actual

```powershell
# Ver configuración del proyecto
vercel project ls

# Ver info del proyecto actual
vercel inspect
```

## 📚 Más Info

Ver `DEPLOYMENT_GUIDE.md` para el flujo completo de deployment.
