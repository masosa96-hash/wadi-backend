# ✅ Deployment Checklist - WADI

Use this checklist before deploying to production.

## 📋 Pre-Deployment

### Environment Files
- [ ] `apps/api/.env` has all required variables
- [ ] `apps/frontend/.env` has all required variables
- [ ] No `.env` files are committed to git
- [ ] `.env.example` files are up to date

### Required Environment Variables

**Backend (Railway):**
- [ ] `OPENAI_API_KEY` (starts with `sk-`)
- [ ] `OPENAI_DEFAULT_MODEL` (e.g., `gpt-3.5-turbo`)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_KEY`
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` (your Vercel URL)
- [ ] `PORT=4000` (optional, Railway sets this)

**Frontend (Vercel):**
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_API_URL` (your Railway URL)
- [ ] `VITE_GUEST_MODE=true`

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No console errors in development mode
- [ ] Guest mode works locally
- [ ] Authenticated mode works locally (if enabled)

### Build Test
```powershell
# Test backend build
cd apps/api
pnpm build

# Test frontend build
cd ../frontend
pnpm build
```

- [ ] Backend builds successfully
- [ ] Frontend builds successfully
- [ ] No build warnings (critical ones)

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend (Railway)

**Option A: CLI**
```powershell
railway login
railway init
railway variables set OPENAI_API_KEY="sk-..."
railway variables set SUPABASE_URL="https://..."
railway variables set SUPABASE_ANON_KEY="eyJ..."
railway variables set SUPABASE_SERVICE_KEY="eyJ..."
railway variables set OPENAI_DEFAULT_MODEL="gpt-3.5-turbo"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://placeholder.com"
railway up
```

**Option B: Dashboard**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add all environment variables
5. Deploy

**Post-deployment:**
- [ ] Get Railway URL (e.g., `https://wadi-api-production.railway.app`)
- [ ] Test health endpoint: `curl https://[RAILWAY_URL]/health`
- [ ] Verify response: `{"status":"ok","supabase":"connected"}`

---

### Step 2: Deploy Frontend (Vercel)

**⚠️ IMPORTANT:** Always deploy from repo root when `Root Directory = apps/frontend`

**Option A: CLI (Recommended)**
```powershell
# Navigate to repo root
cd E:\WADI

# Login if needed
vercel login

# Set environment variables (first time only)
vercel env add VITE_SUPABASE_URL production
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste your anon key

vercel env add VITE_API_URL production
# Paste your Railway URL from Step 1

# Deploy
vercel --prod
```

**Option B: Using Script**
```powershell
cd E:\WADI
.\deploy-vercel.ps1
```

**Option C: Dashboard**
1. Go to https://vercel.com
2. Import Git Repository
3. Framework: Vite
4. Root Directory: `apps/frontend`
5. Build Command: `pnpm build`
6. Output Directory: `dist`
7. Add environment variables
8. Deploy

**Post-deployment:**
- [ ] Get Vercel URL (e.g., `https://wadi.vercel.app`)
- [ ] Test URL: `curl -I https://[VERCEL_URL]`
- [ ] Verify response: `200 OK`

---

### Step 3: Update Backend CORS

```powershell
# Update FRONTEND_URL with actual Vercel URL
railway variables set FRONTEND_URL="https://[VERCEL_URL]"

# Railway will auto-redeploy
```

- [ ] Wait for Railway redeploy (~1-2 min)
- [ ] Verify health endpoint still works

---

## 🧪 Post-Deployment Testing

### Smoke Tests

**Backend:**
```powershell
# Health check
curl https://[RAILWAY_URL]/health

# Expected: {"status":"ok","supabase":"connected"}
```
- [ ] Health endpoint returns OK
- [ ] Supabase connection is working

**Frontend:**
```powershell
# Basic check
curl -I https://[VERCEL_URL]

# Expected: 200 OK
```
- [ ] Site loads (200 OK)
- [ ] No 404 or 500 errors

### Full User Flow Test

**Open browser:** `https://[VERCEL_URL]`

**Guest Mode:**
- [ ] Nickname modal appears
- [ ] Can set nickname
- [ ] Can send message
- [ ] Chat responds (not error)
- [ ] Refresh page → history persists
- [ ] Can send another message

**Authenticated Mode (if enabled):**
- [ ] Can register new user
- [ ] Can login
- [ ] Can send message
- [ ] Chat responds
- [ ] Can create workspace
- [ ] Can switch workspaces

### Console Check
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] No API connection errors
- [ ] No Supabase errors (if using auth)

---

## 🔍 Verification Commands

```powershell
# Check Railway deployment
railway status
railway logs

# Check Vercel deployment
vercel ls
vercel inspect

# Test connectivity
curl https://[RAILWAY_URL]/health
curl -I https://[VERCEL_URL]
```

---

## ⚠️ Common Issues

### "Cannot connect to API"
**Fix:**
- Verify `VITE_API_URL` in Vercel
- Check `FRONTEND_URL` in Railway (CORS)
- Check Railway logs: `railway logs`

### "CORS error"
**Fix:**
- Verify `FRONTEND_URL` in Railway matches exact Vercel URL
- Include `https://` and no trailing slash
- Redeploy backend after updating

### "OpenAI API error"
**Fix:**
- Verify `OPENAI_API_KEY` in Railway
- Check key is valid on platform.openai.com
- Regenerate key if needed

### "Supabase connection failed"
**Fix:**
- Verify all Supabase variables
- Check `SUPABASE_SERVICE_KEY` is correct
- Test connection from Supabase dashboard

### Vercel deployment fails
**Fix:**
- Ensure deploying from `E:\WADI` (repo root)
- Check `Root Directory = apps/frontend` in Vercel settings
- See `VERCEL_DEPLOYMENT_FIX.md` for details

---

## 📊 Monitoring

### Immediate (First 24h)
- [ ] Check Railway logs for errors
- [ ] Monitor Vercel analytics
- [ ] Test site from different devices
- [ ] Monitor OpenAI usage/costs

### Ongoing
- [ ] Set up error monitoring (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up cost alerts (OpenAI, Railway, Vercel)
- [ ] Review logs weekly

---

## 🔒 Security Final Check

- [ ] All API keys in environment variables (not code)
- [ ] HTTPS enabled on both frontend and backend
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet headers active
- [ ] `.env` files in `.gitignore`
- [ ] No sensitive data in logs

---

## ✅ Deployment Complete

Once all checks pass:

- [ ] ✅ Backend deployed and healthy
- [ ] ✅ Frontend deployed and accessible
- [ ] ✅ CORS configured
- [ ] ✅ Guest mode works end-to-end
- [ ] ✅ Auth mode works (if enabled)
- [ ] ✅ No console errors
- [ ] ✅ Monitoring configured

**Your WADI is live!** 🎉

**URLs:**
- Frontend: `https://[YOUR-VERCEL-URL]`
- Backend: `https://[YOUR-RAILWAY-URL]`

---

## 📚 Related Documentation

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Full deployment guide
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - Fast 3-step deployment
- [VERCEL_DEPLOYMENT_FIX.md](VERCEL_DEPLOYMENT_FIX.md) - Vercel troubleshooting
- [VERCEL_DEPLOYMENT_SUMMARY.md](VERCEL_DEPLOYMENT_SUMMARY.md) - Vercel fix summary
- [README_GUEST_MODE.md](README_GUEST_MODE.md) - Guest mode guide

---

**Last Updated:** 2025-11-23
