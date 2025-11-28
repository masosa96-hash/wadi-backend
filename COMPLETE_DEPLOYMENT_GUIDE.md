# Complete WADI Deployment Guide

This guide provides everything you need to deploy WADI to run 24/7 in the cloud with detailed, step-by-step instructions.

## Prerequisites

Before starting, you'll need to create accounts with the following services:

1. **GitHub** - For version control and connecting to deployment platforms
2. **Vercel** - For frontend deployment (free tier available)
3. **Render OR Railway** - For backend deployment (free tier available)
4. **Supabase** - For database and authentication (free tier available)
5. **Groq** - Primary AI provider (free tier with generous credits)
6. **Node.js** >= 20.19 (required for Vite)
7. **pnpm** >= 10.21.0

## Production Configuration Details

### Frontend (Vercel)

**Build Settings:**
- Build Command: `pnpm build`
- Output Directory: `dist`
- Install Command: `pnpm install`
- Framework: Vite

**Required Environment Variables:**
```
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=https://your-backend-url.[onrender.com OR railway.app]
VITE_GUEST_MODE=true
```

### Backend Options

You can deploy the backend to either Render or Railway:

#### Option A: Backend (Render)

**Service Configuration:**
- Service Type: Web Service
- Build Command: `cd apps/api && pnpm install --frozen-lockfile && pnpm build`
- Start Command: `cd apps/api && pnpm start`
- Region: Oregon (recommended)
- Plan: Free (or choose a paid plan for production)

**Required Environment Variables:**
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-url.vercel.app
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
GROQ_API_KEY=your-groq-api-key-here
JWT_SECRET=auto-generated-by-render
PNPM_VERSION=10.21.0
```

#### Option B: Backend (Railway)

**Service Configuration:**
- Service Type: Web Service
- Build Command: Uses `railway.json` configuration
- Start Command: Uses `railway.json` configuration
- Region: Automatically detected
- Plan: Free (or choose a paid plan for production)

**Required Environment Variables (set in Variables tab):**
```
SUPABASE_URL=your-project-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
GROQ_API_KEY=your-groq-api-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Required Secrets (set in Variables/Secrets UI):**
```
JWT_SECRET=your-supabase-jwt-secret
```

**Important Railway Note**: Railway's Railpack expects secrets to be mounted as files in the `/secrets` directory. You must create a secret named `JWT_SECRET` in the Railway "Variables/Secrets" UI with the correct value (the Supabase JWT secret from your Supabase project settings).

### Database (Supabase)

**Keys Distribution:**
- **Frontend (.env variables with VITE_ prefix):**
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

- **Backend (.env variables without VITE_ prefix):**
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`

### AI Providers

**Primary (Groq):**
- Variable: `GROQ_API_KEY`
- Location: Backend environment variables

**Fallback (OpenAI):**
- Variable: `OPENAI_API_KEY`
- Location: Backend environment variables (optional)

## Step-by-Step Deployment Guide

### Step 1: Create the Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project:
   - Choose a project name
   - Select a region closest to your users
   - Set a secure password
3. Wait for the project to be provisioned (may take a few minutes)
4. Once ready, go to Project Settings → API to get your keys:
   - **Project URL** - This is your `SUPABASE_URL`
   - **anon public** - This is your `SUPABASE_ANON_KEY`
   - **service_role_secret** - This is your `SUPABASE_SERVICE_KEY`
   - **JWT secret** - This is your `JWT_SECRET` (needed for Railway deployment)

### Step 2: Set up AI Provider (Groq)

1. Go to [console.groq.com](https://console.groq.com) and create an account
2. Create an API key:
   - Click "API Keys" in the left sidebar
   - Click "Create API Key"
   - Give it a name and click "Create"
   - Copy the key - this is your `GROQ_API_KEY`

### Step 3: Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and create an account
2. Click "Add New Project"
3. Import your GitHub repository:
   - Click "Continue with GitHub"
   - Authorize Vercel to access your repositories
   - Find and select your WADI repository
4. Configure project settings:
   - **Project Name**: Choose a name (e.g., "wadi-frontend")
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/frontend`
5. Skip environment variables for now (we'll add them after backend deployment)
6. Click "Deploy" and wait for the build to complete
7. Note the deployed URL (e.g., `https://your-project.vercel.app`)

### Step 4: Deploy the Backend (Choose Render OR Railway)

#### Option A: Deploy Backend on Render

1. Go to [render.com](https://render.com) and create an account
2. Click "New Web Service"
3. Connect your GitHub repository:
   - Click "Connect account" next to GitHub
   - Authorize Render to access your repositories
   - Find and select your WADI repository
4. Configure service settings:
   - **Name**: wadi-api (or any name you prefer)
   - **Region**: Oregon (default)
   - **Branch**: main
   - **Root Directory**: Leave empty (repository root)
   - **Environment**: Node
5. Build and Start commands (should auto-populate from render.yaml):
   - **Build Command**: `cd apps/api && pnpm install --frozen-lockfile && pnpm build`
   - **Start Command**: `cd apps/api && pnpm start`
6. Set environment variables:
   - Click "Advanced" to show environment variables
   - Add the following variables:
     ```
     NODE_ENV=production
     PORT=10000
     FRONTEND_URL= (leave empty for now, update after frontend deployment)
     SUPABASE_URL= (your Supabase project URL)
     SUPABASE_ANON_KEY= (your Supabase anon key)
     SUPABASE_SERVICE_KEY= (your Supabase service role key)
     GROQ_API_KEY= (your Groq API key)
     JWT_SECRET= (leave to be auto-generated by Render)
     PNPM_VERSION=10.21.0
     ```
7. Click "Create Web Service" and wait for deployment to complete
8. Note the deployed URL (e.g., `https://wadi-api.onrender.com`)

#### Option B: Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) and create an account
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub repository
5. Select the repository
6. Configure service settings:
   - **Service name**: wadi-api (or any name you prefer)
   - **Root directory**: Leave empty (monorepo detected automatically)
   - **Build command**: Uses `railway.json` configuration
   - **Start command**: Uses `railway.json` configuration
7. Set environment variables in the Variables tab:
   - Add the following variables:
     ```
     SUPABASE_URL= (your Supabase project URL)
     SUPABASE_ANON_KEY= (your Supabase anon key)
     SUPABASE_SERVICE_KEY= (your Supabase service role key)
     GROQ_API_KEY= (your Groq API key)
     OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
     NODE_ENV=production
     FRONTEND_URL= (leave empty for now, update after frontend deployment)
     ```
8. **IMPORTANT RAILWAY STEP**: Create a secret named `JWT_SECRET` in the Variables/Secrets UI:
   - Scroll down to the "Secrets" section in the Variables tab
   - Click "New Variable"
   - Set Name: `JWT_SECRET`
   - Set Value: Your Supabase JWT secret (found in Supabase project settings → API)
   - Click "Add Variable"
9. Railway will auto-deploy on push, or click "Deploy" manually
10. Note the deployment URL (e.g., `https://wadi-api-production.railway.app`)

### Step 5: Wire Everything Together

1. **Update Frontend Environment Variables in Vercel:**
   - Go to your Vercel project dashboard
   - Click "Settings" → "Environment Variables"
   - Add the following variables:
     ```
     VITE_SUPABASE_URL= (your Supabase project URL)
     VITE_SUPABASE_ANON_KEY= (your Supabase anon key)
     VITE_API_URL= (your backend URL, e.g., https://wadi-api.[onrender.com OR railway.app])
     VITE_GUEST_MODE=true
     ```
   - Click "Save"

2. **Update Backend Environment Variables:**
   
   **If using Render:**
   - Go to your Render service dashboard
   - Click "Environment" in the left sidebar
   - Edit the `FRONTEND_URL` variable
   - Set it to your Vercel frontend URL (e.g., `https://your-project.vercel.app`)
   - Click "Save Changes" to redeploy the backend
   
   **If using Railway:**
   - Go to your Railway project
   - Navigate to Variables tab
   - Update the `FRONTEND_URL` variable
   - Set it to your Vercel frontend URL (e.g., `https://your-project.vercel.app`)
   - Railway will auto-redeploy

3. **Redeploy Frontend:**
   - Go to your Vercel project dashboard
   - Click "Deployments" in the left sidebar
   - Click "Redeploy" next to the latest deployment
   - Or push a small change to your GitHub repository to trigger a new deployment

### Step 6: Configure Supabase Authentication

1. In your Supabase project dashboard:
   - Go to Authentication → Settings
   - In "Additional Redirect URLs", add your Vercel frontend URL
   - Enable email signups if needed

### Step 7: Run Database Migrations

1. In your Supabase project dashboard:
   - Go to SQL Editor
   - Run the SQL migration files from `apps/api/migrations/` in numerical order:
     - 001_workspace_enhancements.sql
     - 002_files_and_storage.sql
     - 003_user_memory.sql
     - 004_onboarding.sql
     - 005_monetization.sql
     - 006_global_search.sql

## Post-Deployment Checks

### Verify Frontend Loads Correctly

1. Visit your frontend URL (e.g., `https://your-project.vercel.app`)
2. Check that the homepage loads without errors
3. Look for any console errors in browser developer tools

### Verify API Endpoints Respond

1. Test the health endpoint:
   ```bash
   curl https://your-backend-url.[onrender.com OR railway.app]/health
   ```
2. You should receive a JSON response similar to:
   ```json
   {
     "status": "ok",
     "supabase": "connected",
     "openai": "connected",
     "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ"
   }
   ```

### Verify Chat/WebSocket Features Work

1. Try using the chat functionality in the frontend
2. Check browser developer tools for WebSocket connections
3. Look for any errors in the console

### Check Error Logs

1. **Vercel Logs:**
   - Go to your Vercel project dashboard
   - Click "Logs" in the left sidebar
   - Check for any errors during builds or runtime

2. **Backend Logs:**
   
   **If using Render:**
   - Go to your Render service dashboard
   - Click "Logs" in the left sidebar
   - Check for any errors during builds or runtime
   
   **If using Railway:**
   - Go to your Railway project dashboard
   - Click "Logs" in the left sidebar
   - Check for any errors during builds or runtime

## TL;DR Checklist

- [ ] Create Supabase project → Get URL, anon key, service key, JWT secret
- [ ] Create Groq account → Get API key
- [ ] Create Vercel project → Connect repo → Set env vars:
  - `VITE_SUPABASE_URL` = Supabase URL
  - `VITE_SUPABASE_ANON_KEY` = Supabase anon key
  - `VITE_API_URL` = Backend URL
  - `VITE_GUEST_MODE` = true
- [ ] Create backend service (Render OR Railway) → Connect repo → Set env vars:
  
  **If using Render:**
  - `NODE_ENV` = production
  - `PORT` = 10000
  - `FRONTEND_URL` = Vercel frontend URL
  - `SUPABASE_URL` = Supabase URL
  - `SUPABASE_ANON_KEY` = Supabase anon key
  - `SUPABASE_SERVICE_KEY` = Supabase service key
  - `GROQ_API_KEY` = Groq API key
  - `JWT_SECRET` = (auto-generated)
  - `PNPM_VERSION` = 10.21.0
  
  **If using Railway:**
  - Variables tab:
    - `SUPABASE_URL` = Supabase URL
    - `SUPABASE_ANON_KEY` = Supabase anon key
    - `SUPABASE_SERVICE_KEY` = Supabase service key
    - `GROQ_API_KEY` = Groq API key
    - `OPENAI_DEFAULT_MODEL` = gpt-3.5-turbo
    - `NODE_ENV` = production
    - `FRONTEND_URL` = Vercel frontend URL
  - Secrets UI:
    - `JWT_SECRET` = Supabase JWT secret
- [ ] Update frontend config with backend URL in Vercel
- [ ] Update backend config with frontend URL
- [ ] Redeploy both services
- [ ] Run Supabase database migrations
- [ ] Open URL, run smoke tests

## Troubleshooting Common Issues

### Build Failures

1. **Node.js Version Error:**
   - Ensure you're using Node.js >= 20.19
   - Check with `node --version`

2. **Dependency Issues:**
   - Ensure all dependencies are in package.json
   - Try clearing cache and reinstalling: `pnpm clean:install`

### CORS Errors

1. Ensure `FRONTEND_URL` in backend matches your Vercel deployment
2. Check that your Vercel domain is in the CORS allowlist in the backend code

### Environment Variables Not Loading

1. Verify all required variables are set in both platforms
2. Check for typos in variable names
3. Remember VITE_ prefix is required for frontend variables

### API Connection Issues

1. Confirm backend URL is correct in frontend config
2. Check that backend is running (health endpoint)
3. Verify Supabase configuration

### Railway-Specific Issues

1. **JWT_SECRET Error**
   - Ensure you've created a secret named `JWT_SECRET` in Railway Variables/Secrets UI
   - The value should be your Supabase JWT secret (found in Supabase project settings)
   - Railway mounts secrets as files in `/secrets/JWT_SECRET` during build

## Cost Considerations

1. **Vercel**: Free tier includes generous limits for most applications
2. **Render/Railway**: Free tier has limitations (sleeps after inactivity)
3. **Supabase**: Free tier includes 500MB database, 5GB bandwidth
4. **Groq**: Free tier includes generous API credits

For production use, consider upgrading to paid plans for better performance and reliability.