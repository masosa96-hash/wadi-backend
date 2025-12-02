# WADI - Quick Start Commands

## 🚀 Start Development Servers

### Open TWO Terminal Windows:

**Terminal 1 - Backend API:**

```powershell
cd E:\WADI
pnpm --filter api dev
```

Should show:

```
🚀 WADI API running on http://localhost:4000
📊 Health check: http://localhost:4000/health
🔌 WebSocket: ws://localhost:4000/ws
```

**Terminal 2 - Frontend:**

```powershell
cd E:\WADI
pnpm --filter frontend dev
```

Should show:

```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

## 🔗 Access Points

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health (should return `{"status":"ok","supabase":"connected"}`)

## ✅ First Time Setup Checklist

1. ✅ Run `pnpm install` in root directory
2. ✅ Create `.env` file in root (E:\WADI\.env)
3. ✅ Create `.env` file in apps/frontend (E:\WADI\apps\frontend\.env)
4. ✅ Set up Supabase database tables
5. ✅ Configure RLS policies in Supabase
6. ✅ Test health check endpoint
7. ✅ Start both servers
8. ✅ Test login/register

## 🛠 Troubleshooting Commands

```powershell
# Check if ports are in use
netstat -ano | findstr :4000
netstat -ano | findstr :5173

# Reinstall dependencies
cd E:\WADI
rm -r node_modules
rm pnpm-lock.yaml
pnpm install

# Check TypeScript errors
cd apps/api && npx tsc --noEmit
cd apps/frontend && npx tsc --noEmit
```

## 📋 Environment Variables Quick Reference

### Root .env (E:\WADI\.env)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend .env (E:\WADI\apps\frontend\.env)

```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 🎯 What You Should See

### ✅ Backend Logs (Terminal 1):

```
[Auth] Checking auth for: GET /api/projects
[Auth] Success: User authenticated: user-id-here
[getProjects] Request from user: user-id-here
[getProjects] Success: Found 2 projects
```

### ✅ Frontend (Browser):

- Modern dashboard with stats cards
- No errors in browser console
- Smooth animations
- Projects loading correctly

### ❌ If You See Errors:

**"Network error"** → Backend not running, check Terminal 1
**"401 Unauthorized"** → Need to login first
**"500 Internal Server Error"** → Check backend logs, verify database

## 🔑 Test Flow

1. **Register** new account at http://localhost:5173/register
2. **Login** at http://localhost:5173/login
3. **Create Project** from dashboard
4. **Open Project** to see runs/sessions
5. **Send Message** to AI
6. **Check** no console errors

---

**Need help?** Check `SETUP_INSTRUCTIONS.md` for detailed troubleshooting!
