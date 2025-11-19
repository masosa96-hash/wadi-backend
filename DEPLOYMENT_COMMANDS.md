# WADI Platform Deployment Commands

## 🚀 Deployment Sequence

Deploy in this order to ensure proper configuration:
1. Backend (Railway)
2. Frontend (Vercel)
3. Update Backend CORS

---

## 📡 Backend Deployment (Railway)

### Option 1: Railway CLI

```powershell
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize/Link project
railway init
# OR link to existing project
railway link

# Set environment variables
railway variables set SUPABASE_URL="https://smkbiguvgiscojwxgbae.supabase.co"
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM"
railway variables set SUPABASE_SERVICE_KEY="[your-service-key]"
railway variables set OPENAI_API_KEY="[your-openai-key]"
railway variables set OPENAI_DEFAULT_MODEL="gpt-3.5-turbo"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://placeholder.vercel.app"

# Deploy
railway up

# Check deployment status
railway status

# View logs
railway logs
```

### Option 2: Railway Dashboard

1. **Create New Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub repository
   - Select the repository

2. **Configure Service**
   - Service name: `wadi-api`
   - Root directory: Leave empty (monorepo detected automatically)
   - Build command: Uses `railway.json` configuration
   - Start command: Uses `railway.json` configuration

3. **Set Environment Variables**
   Navigate to Variables tab and add:
   ```
   SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM
   SUPABASE_SERVICE_KEY=[your-service-key]
   OPENAI_API_KEY=[your-openai-key]
   OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
   NODE_ENV=production
   FRONTEND_URL=https://placeholder.vercel.app
   ```

4. **Deploy**
   - Railway will auto-deploy on push
   - Or click "Deploy" manually

5. **Get Deployment URL**
   - Go to Settings > Networking
   - Click "Generate Domain"
   - Note the URL (e.g., `https://wadi-api-production.railway.app`)

---

## 🌐 Frontend Deployment (Vercel)

### Option 1: Vercel CLI

```powershell
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd apps/frontend

# Set production environment variables
vercel env add VITE_SUPABASE_URL production
# Enter: https://smkbiguvgiscojwxgbae.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM

vercel env add VITE_API_URL production
# Enter: [Railway URL from previous step]

# Deploy to production
vercel --prod

# Get deployment URL from output
```

### Option 2: Vercel Dashboard

1. **Import Project**
   - Go to https://vercel.com
   - Click "Add New..." > "Project"
   - Import your Git repository

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Root Directory: `apps/frontend`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install --frozen-lockfile`

3. **Set Environment Variables**
   Navigate to Settings > Environment Variables and add:
   ```
   VITE_SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM
   VITE_API_URL=[Railway URL from backend deployment]
   ```
   
   **Important**: Select "Production" environment for each variable

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Note the deployment URL (e.g., `https://wadi.vercel.app`)

---

## 🔄 Update Backend CORS Configuration

After frontend deployment, update Railway to allow the actual Vercel URL:

### CLI Method
```powershell
railway variables set FRONTEND_URL="[actual-vercel-url]"
```

### Dashboard Method
1. Go to Railway project
2. Navigate to Variables tab
3. Update `FRONTEND_URL` to actual Vercel URL
4. Railway will auto-redeploy

---

## ✅ Verification Steps

### 1. Test Backend Health
```powershell
curl https://[railway-url]/health
```
Expected response:
```json
{
  "status": "ok",
  "supabase": "connected"
}
```

### 2. Test Frontend
1. Open `https://[vercel-url]` in browser
2. Check browser console for errors
3. Verify no CORS errors

### 3. Test Full Flow
1. Register a new user
2. Login
3. Create a project
4. Create a run
5. Verify data persists in Supabase

---

## 🔧 Troubleshooting

### Backend Issues

**Build Fails**
```powershell
# Check Railway logs
railway logs

# Common fixes:
# - Verify pnpm-workspace.yaml exists in root
# - Ensure tsconfig.json in apps/api is correct
# - Check environment variables are set
```

**Runtime Errors**
```powershell
# Check runtime logs
railway logs --tail

# Verify environment variables
railway variables
```

### Frontend Issues

**Build Fails**
```powershell
# Check Vercel logs in dashboard
# Common fixes:
# - Verify all VITE_ prefixed env vars are set
# - Ensure build command is correct
# - Check Node version (should be 20.x)
```

**CORS Errors**
- Verify FRONTEND_URL on Railway matches Vercel URL exactly
- Check browser console for the exact origin being blocked
- Ensure Railway service has redeployed after FRONTEND_URL update

### Environment Variable Issues

**Backend not connecting to Supabase**
- Verify SUPABASE_URL is correct
- Check SUPABASE_SERVICE_KEY is valid
- Test connection: `curl https://[railway-url]/health`

**Frontend can't reach backend**
- Verify VITE_API_URL points to Railway URL
- Check browser Network tab for failed requests
- Ensure Railway deployment is healthy

---

## 📊 Monitoring

### Railway Monitoring
- View metrics in Railway dashboard
- Set up deployment notifications
- Enable log streaming

### Vercel Monitoring
- Enable Vercel Analytics
- Monitor build times
- Track deployment status

### External Monitoring
Recommended: Set up external uptime monitoring
- [UptimeRobot](https://uptimerobot.com)
- [Better Uptime](https://betteruptime.com)
- Monitor both `/health` endpoints

---

## 🔄 Redeployment

### Backend Updates
```powershell
# CLI: Trigger redeploy
railway up

# Dashboard: Push to main branch (auto-deploys)
git push origin main
```

### Frontend Updates
```powershell
# CLI
cd apps/frontend
vercel --prod

# Dashboard: Push to main branch (auto-deploys)
git push origin main
```

---

## 🔙 Rollback Procedures

### Railway Rollback
```powershell
# CLI
railway rollback

# Dashboard:
# 1. Go to Deployments tab
# 2. Find previous stable deployment
# 3. Click "Redeploy"
```

### Vercel Rollback
```powershell
# CLI
vercel rollback [deployment-url]

# Dashboard:
# 1. Go to Deployments
# 2. Find previous stable deployment
# 3. Click three dots > "Promote to Production"
```

---

## 📋 Quick Reference

### Railway URLs
- Dashboard: https://railway.app
- Docs: https://docs.railway.app

### Vercel URLs
- Dashboard: https://vercel.com
- Docs: https://vercel.com/docs

### Project URLs (after deployment)
- Backend: `https://[your-project].railway.app`
- Frontend: `https://[your-project].vercel.app`
- Backend Health: `https://[your-project].railway.app/health`

---

## 🔐 Security Checklist

- [ ] All API keys stored as environment variables (not in code)
- [ ] SUPABASE_SERVICE_KEY only on backend
- [ ] FRONTEND_URL configured correctly on Railway
- [ ] HTTPS enforced on both platforms
- [ ] Row Level Security (RLS) enabled in Supabase
- [ ] Rate limiting configured on backend

---

## ✨ Success Criteria

Deployment is successful when:
- ✅ Backend health check returns `{"status":"ok","supabase":"connected"}`
- ✅ Frontend loads without console errors
- ✅ User can register and login
- ✅ No CORS errors in browser
- ✅ Data persists across sessions
- ✅ Both services respond within 500ms p95

---

**Ready to deploy!** Follow the steps above in order, and verify at each stage.
