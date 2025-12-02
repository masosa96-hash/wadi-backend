# ⚡ Quick Deploy - WADI Platform

**Estimated Time:** 30-45 minutes | **Platforms:** Railway + Vercel

---

## 🚀 Three-Step Deployment

### STEP 1: Deploy Backend (Railway)

```powershell
# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set SUPABASE_URL="https://smkbiguvgiscojwxgbae.supabase.co"
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM"
railway variables set SUPABASE_SERVICE_KEY="[GET_FROM_SUPABASE_DASHBOARD]"
railway variables set OPENAI_API_KEY="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"
railway variables set OPENAI_DEFAULT_MODEL="gpt-3.5-turbo"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://placeholder.com"

# Deploy
railway up

# Get URL
railway status
```

**→ Copy the Railway URL (e.g., `https://wadi-api-production.railway.app`)**

---

### STEP 2: Deploy Frontend (Vercel)

```powershell
# Navigate to REPO ROOT (not apps/frontend)
cd E:\WADI

# Login
vercel login

# Set environment variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://smkbiguvgiscojwxgbae.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM

vercel env add VITE_API_URL production
# Paste: [RAILWAY_URL_FROM_STEP_1]

# Deploy from ROOT (Vercel Root Directory = apps/frontend)
vercel --prod
```

⚠️ **IMPORTANTE**: Con `Root Directory = apps/frontend` en Vercel, siempre deployá desde `E:\WADI`

**→ Copy the Vercel URL (e.g., `https://wadi.vercel.app`)**

---

### STEP 3: Update Backend CORS

```powershell
# Update FRONTEND_URL with actual Vercel URL
railway variables set FRONTEND_URL="[VERCEL_URL_FROM_STEP_2]"
```

**Railway will auto-redeploy** ✅

---

## ✅ Verify Deployment

```powershell
# Test backend
curl https://[RAILWAY_URL]/health

# Expected: {"status":"ok","supabase":"connected"}
```

**Open browser:** `https://[VERCEL_URL]`

- ✅ No console errors
- ✅ Login/register works
- ✅ Can create projects

---

## 🎯 Alternative: Dashboard Method

### Railway Dashboard

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables (Variables tab)
4. Deploy

### Vercel Dashboard

1. Go to https://vercel.com
2. Import Git Repository
3. Root Directory: `apps/frontend`
4. Add environment variables (Settings → Environment Variables)
5. Deploy

---

## ⚠️ Before You Start

**Required:**

- [ ] SUPABASE_SERVICE_KEY (from Supabase Dashboard)
- [ ] Railway account
- [ ] Vercel account
- [ ] GitHub repository connected

**Optional:**

- [ ] Railway CLI: `npm install -g @railway/cli`
- [ ] Vercel CLI: `npm install -g vercel`

---

## 🆘 Quick Fixes

**Build fails on Railway:**

```powershell
railway logs
# Check for missing env vars
```

**CORS errors:**

```powershell
# Verify FRONTEND_URL matches Vercel URL exactly
railway variables
```

**Frontend doesn't connect:**

- Check VITE_API_URL in Vercel dashboard
- Ensure Railway deployment is healthy

---

## 📚 Full Documentation

For detailed instructions, see:

- `DEPLOYMENT_COMMANDS.md` - Complete guide with both CLI and dashboard
- `PRE_DEPLOYMENT_CHECKLIST.md` - Full verification checklist
- `ENV_VERIFICATION_REPORT.md` - Environment variables details

---

**Time per step:**

- Step 1 (Railway): ~10 min
- Step 2 (Vercel): ~10 min
- Step 3 (Update): ~2 min
- Verification: ~5 min

**Total: ~30 minutes** ⚡
