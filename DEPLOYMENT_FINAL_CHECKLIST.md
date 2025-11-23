# 🚀 WADI Final Deployment Checklist

**Status:** Code Ready ✅ | Deployment Pending ⏳  
**Commit:** aeba1d4c  
**Date:** 2025-11-23

---

## ✅ COMPLETED TASKS

- [x] Rate limit increased to 20/min with friendly Spanish errors
- [x] Friendly error messages for 429/503/500/offline scenarios
- [x] Enhanced /health endpoint with OpenAI validation
- [x] Guest mode disclaimer with localStorage warning
- [x] All builds verified and passing
- [x] Code committed to main branch
- [x] Code pushed to GitHub

---

## 🔄 DEPLOYMENT TASKS (Execute Manually)

### Step 1: Deploy Backend to Railway

**Repository:** `https://github.com/masosa96-hash/wadi-backend.git`  
**Branch:** `main`  
**Commit:** `aeba1d4c`

#### Railway Configuration:

**Root Directory:** `apps/api`

**Build Command:**
```bash
pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

**Environment Variables (REQUIRED):**
```bash
NODE_ENV=production
PORT=4000
OPENAI_API_KEY=sk-your-valid-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
FRONTEND_URL=https://your-vercel-url.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
GUEST_MODE=true
```

**⚠️ Critical Notes:**
- `OPENAI_API_KEY` must start with `sk-` and be valid
- `FRONTEND_URL` must match Vercel URL EXACTLY (no trailing slash)
- `SUPABASE_SERVICE_KEY` required for authenticated users

---

### Step 2: Verify Backend Health

**Command:**
```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "supabase": "connected",
  "openai": "connected",
  "timestamp": "2025-11-23T..."
}
```

**If status is "degraded":**
- Check Railway logs for errors
- Verify OpenAI API key is valid
- Verify Supabase credentials are correct

---

### Step 3: Deploy Frontend to Vercel

**Repository:** Same as backend  
**Branch:** `main`  
**Commit:** `aeba1d4c`

#### Vercel Configuration:

**Root Directory:** `apps/frontend`

**Framework Preset:** Vite

**Build Command:**
```bash
pnpm build
```

**Output Directory:** `dist`

**Environment Variables (REQUIRED):**
```bash
VITE_API_URL=https://YOUR-RAILWAY-URL.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GUEST_MODE=true
```

**⚠️ Critical Notes:**
- `VITE_API_URL` must point to Railway backend (no trailing slash)
- All `VITE_` variables are exposed to client (don't put secrets)
- After deployment, update Railway's `FRONTEND_URL` to match Vercel URL

---

### Step 4: Update CORS Configuration

**After Vercel deploys**, update Railway environment:

```bash
FRONTEND_URL=https://your-exact-vercel-url.vercel.app
```

Then restart Railway service for changes to take effect.

---

### Step 5: Production Smoke Test

#### ✓ Health Check
```bash
curl https://YOUR-RAILWAY-URL.railway.app/health
```
- [ ] Status: "ok"
- [ ] Supabase: "connected"
- [ ] OpenAI: "connected"

#### ✓ Guest Flow
1. [ ] Open frontend URL
2. [ ] Nickname modal appears with disclaimer
3. [ ] Enter nickname "Test User"
4. [ ] Send message: "Hola, esto es una prueba"
5. [ ] Receive AI response within 5 seconds
6. [ ] Refresh page - history persists
7. [ ] Send 21 messages rapidly
8. [ ] See rate limit error: "Estás enviando mensajes muy rápido..."

#### ✓ Auth Flow
1. [ ] Click "creá una cuenta" link from guest modal
2. [ ] Register with email/password
3. [ ] Verify email (check Supabase)
4. [ ] Login successfully
5. [ ] Send message as authenticated user
6. [ ] Message saved to database
7. [ ] Logout returns to guest mode

#### ✓ Error Handling
1. [ ] Disconnect internet
2. [ ] Try to send message
3. [ ] See: "Sin conexión a internet. Verificá tu red..."
4. [ ] Reconnect internet
5. [ ] Message sends successfully

#### ✓ UI/UX
1. [ ] Page loads in < 2 seconds
2. [ ] No console errors
3. [ ] Guest disclaimer visible and readable
4. [ ] Registration link works
5. [ ] Dark theme renders correctly
6. [ ] Mobile responsive (test on phone)

---

## 📊 DEPLOYMENT VERIFICATION

### Backend Metrics
- [ ] Health endpoint returns 200 OK
- [ ] Response time < 500ms
- [ ] Railway logs show no errors
- [ ] OpenAI connection successful
- [ ] Supabase connection successful

### Frontend Metrics
- [ ] Vercel build successful
- [ ] Bundle size ~195 KB gzipped
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3s
- [ ] No build warnings
- [ ] No runtime errors

### Security Checklist
- [ ] HTTPS enabled on both services
- [ ] CORS configured correctly
- [ ] Rate limiting active (20 req/min)
- [ ] API keys not exposed in frontend
- [ ] Supabase RLS policies active
- [ ] Environment variables set securely

---

## 🎯 POST-DEPLOYMENT

### Share These URLs:

**Backend (Railway):**
```
URL: https://_____.railway.app
Health: https://_____.railway.app/health
```

**Frontend (Vercel):**
```
URL: https://_____.vercel.app
```

### Share This Output:

```bash
# Run this command and paste output
curl https://YOUR-RAILWAY-URL.railway.app/health
```

### Smoke Test Results:

```
Guest Flow: ✅ / ❌
Auth Flow: ✅ / ❌
Error Handling: ✅ / ❌
Rate Limiting: ✅ / ❌
UI/UX: ✅ / ❌
```

---

## 🆘 TROUBLESHOOTING

### "degraded" health status
**Problem:** OpenAI or Supabase showing "disconnected"

**Solution:**
1. Check Railway logs for specific error
2. Verify API keys in Railway dashboard
3. Test API keys manually:
   ```bash
   # OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_OPENAI_KEY"
   
   # Supabase
   curl https://YOUR_PROJECT.supabase.co/rest/v1/ \
     -H "apikey: YOUR_ANON_KEY"
   ```
4. Update keys if invalid
5. Restart Railway service

---

### CORS errors in browser console
**Problem:** "Access-Control-Allow-Origin" errors

**Solution:**
1. Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
2. No trailing slash: ✅ `https://wadi.vercel.app` ❌ `https://wadi.vercel.app/`
3. Update Railway env var
4. Restart Railway service
5. Clear browser cache
6. Test in incognito mode

---

### Rate limit not working
**Problem:** Can send unlimited messages

**Solution:**
1. Check Railway logs for rate limiter initialization
2. Verify code deployed (commit aeba1d4c)
3. Test with `x-guest-id` header:
   ```bash
   for i in {1..25}; do
     curl -X POST https://YOUR-RAILWAY-URL/api/chat \
       -H "x-guest-id: test-user" \
       -H "Content-Type: application/json" \
       -d '{"message":"test"}';
   done
   ```
4. Should see 429 error after 20 requests

---

### Build failures
**Railway Build Error:**
- Check `package.json` has all dependencies
- Verify `pnpm-lock.yaml` is committed
- Check Railway build logs for specific error
- Try local build: `pnpm build`

**Vercel Build Error:**
- Check environment variables are set
- Verify `vite.config.ts` is correct
- Check Vercel build logs
- Try local build: `pnpm --filter frontend build`

---

## ✅ LAUNCH CRITERIA

**Ready to mark as LAUNCHED when:**

- [x] Code committed and pushed to GitHub
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] /health returns status: "ok"
- [ ] Guest flow works end-to-end
- [ ] Auth flow works end-to-end
- [ ] Rate limiting functional
- [ ] Error messages are friendly
- [ ] No critical bugs found
- [ ] URLs and health check output shared

---

**Last Updated:** 2025-11-23  
**Version:** 1.0.0  
**Status:** ⏳ AWAITING DEPLOYMENT
