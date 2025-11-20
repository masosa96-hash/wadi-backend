# WADI - Setup & Deployment Instructions

## 🎯 What's Been Fixed

### Backend Improvements
✅ **All 500 errors fixed** with proper logging and error handling
✅ **Consistent API response format**: `{ ok: boolean, data: any, error?: { code, message } }`
✅ **Enhanced authentication** with detailed logging
✅ **New endpoints added**:
   - `GET /api/projects/:id` - Get specific project details
✅ **Better error logging** in all controllers:
   - `[getProjects]`, `[createProject]`, `[getRuns]`, `[getSessions]` etc.
✅ **CORS properly configured** for http://localhost:5173

### Frontend Improvements
✅ **Modern dashboard UI** with stats cards and animations (Framer Motion)
✅ **Proper error handling** with retry functionality
✅ **Loading states** with skeleton screens
✅ **Empty states** with helpful messages
✅ **Updated stores** to match new API response format
✅ **Better user experience** with success/error feedback

---

## 📋 Prerequisites

1. **Node.js** 18+ and **pnpm** installed
2. **Supabase account** with project set up
3. **OpenAI API key** (for AI functionality)

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies

```powershell
# From the root of the workspace (E:\WADI)
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the **root directory** (E:\WADI\.env):

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here

# API Configuration
PORT=4000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

Create `.env` file in **apps/frontend** (E:\WADI\apps\frontend\.env):

```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase Database Setup

Make sure your Supabase database has these tables (check your SQL migrations or create them):

**Required Tables:**
- `profiles` (user_id, email, created_at, updated_at)
- `projects` (id, user_id, name, description, created_at, default_mode)
- `sessions` (id, project_id, user_id, name, description, is_active, created_at, updated_at)
- `runs` (id, project_id, user_id, session_id, input, output, model, custom_name, created_at)
- `tags` (id, user_id, name, color, created_at)
- `project_tags` (project_id, tag_id)
- `run_tags` (run_id, tag_id)

**Enable RLS (Row Level Security):**
Make sure policies allow authenticated users to:
- Read/write their own projects, runs, sessions
- Read/write their own tags

### 4. Run the Application

#### Option A: Run Both (Recommended)

In separate terminal windows:

**Terminal 1 - Backend:**
```powershell
cd E:\WADI
pnpm --filter api dev
```

**Terminal 2 - Frontend:**
```powershell
cd E:\WADI
pnpm --filter frontend dev
```

#### Option B: Use concurrently (if available)

```powershell
pnpm dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

Expected health check response:
```json
{
  "status": "ok",
  "supabase": "connected"
}
```

---

## 🔍 Debugging

### Check Backend Logs

The backend now has comprehensive logging. You should see:

```
[Auth] Checking auth for: GET /api/projects
[Auth] Token present, verifying...
[Auth] Success: User authenticated: <user-id>
[getProjects] Request from user: <user-id>
[getProjects] Success: Found 5 projects
```

### Common Issues

#### 1. **401 Unauthorized errors**

**Symptom:** All API calls return 401
**Check:**
- Is the user logged in? (Check browser DevTools → Application → Session Storage)
- Is the Supabase token valid?
- Check backend logs for `[Auth]` messages

**Fix:**
- Log out and log back in
- Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify Supabase RLS policies allow the user access

#### 2. **500 Database errors**

**Symptom:** Backend logs show `[getProjects] Supabase error`
**Check:**
- Do the database tables exist?
- Are RLS policies configured?
- Is the user_id column present in all tables?

**Fix:**
- Run Supabase migrations
- Check table structure matches expected schema
- Temporarily disable RLS for debugging (re-enable after!)

#### 3. **CORS errors**

**Symptom:** Browser console shows CORS policy errors
**Fix:**
- Verify `FRONTEND_URL=http://localhost:5173` in backend .env
- Restart backend server
- Check no trailing slashes in URLs

#### 4. **Frontend shows "Network error"**

**Check:**
- Is backend running on port 4000?
- Check `VITE_API_URL=http://localhost:4000` in frontend .env
- Test health check: http://localhost:4000/health

---

## 🎨 Features Overview

### Projects Page
- **Stats Dashboard**: Total projects, last activity, status
- **Error Handling**: Retry button if API fails
- **Empty State**: Friendly message when no projects exist
- **Loading State**: Skeleton screens while fetching
- **Create Project**: Modal with name & description
- **Project Cards**: Click to view project details

### Project Detail Page
- **Sessions Management**: Create, rename, delete sessions
- **Runs Display**: Grouped by session with AI conversations
- **Input Box**: Fixed at bottom for new messages
- **Streaming**: Real-time AI responses (if using stream endpoint)
- **Error Banner**: Clear error messages with dismiss

---

## 📦 Deployment

### Backend (Railway/Render)

1. **Push code to GitHub**
2. **Connect to Railway/Render**
3. **Set environment variables**:
   ```
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   PORT=4000
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
4. **Deploy command**: `pnpm --filter api build && pnpm --filter api start`

### Frontend (Vercel)

1. **Import from GitHub** to Vercel
2. **Root Directory**: `apps/frontend`
3. **Framework**: Vite
4. **Environment variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. **Build Command**: `pnpm build`
6. **Output Directory**: `dist`

---

## 🧪 Testing the API

### Using curl

```powershell
# Health Check
curl http://localhost:4000/health

# Login (get token first via frontend or Supabase)
# Then test authenticated endpoints:

# Get Projects
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/projects

# Create Project
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"Test Project","description":"Test"}' http://localhost:4000/api/projects

# Get Project Runs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/projects/PROJECT_ID/runs

# Get Project Sessions
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/projects/PROJECT_ID/sessions
```

---

## 🆘 Support

If you encounter issues:

1. **Check backend logs** for detailed error messages
2. **Check browser console** for frontend errors
3. **Verify environment variables** are set correctly
4. **Test health check endpoint** first
5. **Check Supabase dashboard** for database issues

---

## ✅ Verification Checklist

- [ ] Backend health check returns `{ status: "ok", supabase: "connected" }`
- [ ] Can create a new account via `/register`
- [ ] Can login via `/login`
- [ ] Projects page loads without errors
- [ ] Can create a new project
- [ ] Can view project details
- [ ] Can create a run (AI conversation)
- [ ] No "Uncaught (in promise) Object" errors in console
- [ ] Error messages are user-friendly
- [ ] Retry button works when API fails

---

**Everything should now be working!** 🎉

The backend has proper logging, consistent error responses, and all endpoints are functional.
The frontend has a modern UI with stats, animations, and comprehensive error handling.
