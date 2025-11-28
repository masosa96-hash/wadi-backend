# WADI Cloud Deployment Guide

This guide will help you deploy the WADI application to run 24/7 in the cloud using Vercel for the frontend and either Render or Railway for the backend.

## Prerequisites

1. GitHub account
2. Vercel account
3. Render account OR Railway account
4. Supabase account
5. Groq API key (or OpenAI API key as fallback)
6. Node.js >= 20
7. pnpm >= 10.21.0

## Deployment Architecture

- **Frontend**: Deployed to Vercel (React/Vite application)
- **Backend**: Deployed to Render OR Railway (Express API with WebSocket support)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: Groq (primary) with OpenAI as fallback

## Step 1: Prepare Your Repository

1. Ensure your code is committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for cloud deployment"
   git push origin main
   ```

## Step 2: Deploy Backend (Choose Render OR Railway)

### Option A: Deploy Backend to Render

#### 2.1 Create Render Account
If you don't have one already, create an account at [render.com](https://render.com)

#### 2.2 Connect Repository to Render
1. Go to your Render Dashboard
2. Click "New Web Service"
3. Connect your GitHub repository
4. Select the branch you want to deploy (usually `main`)

#### 2.3 Configure Render Service
Render will automatically detect the configuration from `render.yaml`, but verify these settings:

- **Name**: wadi-api
- **Region**: Oregon (default)
- **Branch**: main
- **Root Directory**: (leave empty - repository root)
- **Environment**: Node
- **Build Command**: `cd apps/api && pnpm install --frozen-lockfile && pnpm build`
- **Start Command**: `cd apps/api && pnpm start`
- **Plan**: Free (or choose a paid plan for production)

#### 2.4 Set Environment Variables in Render
In your Render service settings, add these environment variables:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-url.vercel.app
SUPABASE_URL=your-supabase-project-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
GROQ_API_KEY=your-groq-api-key
JWT_SECRET=your-generated-jwt-secret
```

Notes:
- Get your Supabase keys from your Supabase project settings
- Get your Groq API key from [console.groq.com](https://console.groq.com)
- Render will auto-generate the JWT_SECRET value
- Update FRONTEND_URL after deploying your frontend

#### 2.5 Deploy Backend
Click "Create Web Service" to start the deployment. This will:
1. Clone your repository
2. Install dependencies
3. Build the TypeScript code
4. Start the server

Note the deployed URL (e.g., `https://wadi-api.onrender.com`) for use in frontend configuration.

### Option B: Deploy Backend to Railway (Railpack)

#### 2.1 Create Railway Account
If you don't have one already, create an account at [railway.app](https://railway.app)

#### 2.2 Connect Repository to Railway
1. Go to your Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub repository
5. Select the repository

#### 2.3 Configure Railway Service
Railway will automatically detect the configuration from `railway.json`, but verify these settings:

- **Service name**: wadi-api
- **Root directory**: Leave empty (monorepo detected automatically)
- **Build command**: Uses `railway.json` configuration
- **Start command**: Uses `railway.json` configuration

#### 2.4 Set Environment Variables in Railway
Navigate to Variables tab and add:

```
SUPABASE_URL=your-supabase-project-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
GROQ_API_KEY=your-groq-api-key
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
NODE_ENV=production
FRONTEND_URL=https://placeholder.vercel.app
```

**Important Railway Note**: Railway's Railpack expects secrets to be mounted as files in the `/secrets` directory. You must create a secret named `JWT_SECRET` in the Railway "Variables/Secrets" UI with the correct value (the Supabase JWT secret from your Supabase project settings).

#### 2.5 Deploy Backend
Railway will auto-deploy on push, or click "Deploy" manually.

Note the deployment URL (e.g., `https://wadi-api-production.railway.app`) for use in frontend configuration.

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
If you don't have one already, create an account at [vercel.com](https://vercel.com)

### 3.2 Connect Repository to Vercel
1. Go to your Vercel Dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Select the project

### 3.3 Configure Vercel Project
Vercel will automatically detect the configuration from `vercel.json` in the frontend directory. Configure these settings:

- **Project Name**: wadi-frontend (or any name you prefer)
- **Framework**: Vite
- **Root Directory**: `apps/frontend`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`

### 3.4 Set Environment Variables in Vercel
In your Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=your-supabase-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=https://your-backend-url.[onrender.com OR railway.app]
VITE_GUEST_MODE=true
```

Notes:
- Use the same Supabase keys as in the backend
- Use the backend URL from step 2.5 (either Render or Railway)
- VITE_ prefix is required for Vercel to expose variables to the frontend

### 3.5 Deploy Frontend
Click "Deploy" to start the deployment. This will:
1. Clone your repository
2. Install dependencies
3. Build the React application
4. Deploy to Vercel's CDN

## Step 4: Update Backend Configuration

After deploying the frontend, update the backend configuration:

### If using Render:
1. Go to your Render service settings
2. Update the `FRONTEND_URL` environment variable to your Vercel frontend URL
3. Click "Save Changes" to redeploy the backend with the new configuration

### If using Railway:
1. Go to your Railway project
2. Navigate to Variables tab
3. Update `FRONTEND_URL` to your Vercel frontend URL
4. Railway will auto-redeploy

## Step 5: Configure Supabase

### 5.1 Set Up Authentication
1. In your Supabase project, go to Authentication → Settings
2. Add your frontend URL to "Additional Redirect URLs"
3. Enable email signups if needed

### 5.2 Set Up Database
1. Run the SQL migrations in `apps/api/migrations/` in order
2. Ensure the database schema matches your application requirements

### 5.3 Configure Service Key
In your Supabase project settings:
1. Go to API → Service Role Key
2. Copy this key to your backend as `SUPABASE_SERVICE_KEY`

## Step 6: Test Your Deployment

1. Visit your frontend URL (e.g., `https://your-project.vercel.app`)
2. Test the application functionality
3. Check the health endpoint: `https://your-backend-url.[onrender.com OR railway.app]/health`
4. Monitor logs in both Vercel and your backend platform dashboards

## Step 7: Configure Custom Domains (Optional)

### 7.1 Frontend (Vercel)
1. In your Vercel project, go to Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

### 7.2 Backend (Render/Railway)
1. In your service, go to Settings → Custom Domains
2. Add your custom domain
3. Follow the platform's DNS configuration instructions

## Monitoring and Maintenance

### Automatic Deployments
Both Vercel and your backend platform will automatically redeploy when you push to your main branch.

### Environment Updates
To update environment variables:
- Vercel: Project Settings → Environment Variables
- Render: Service Settings → Environment
- Railway: Project Settings → Variables

### Scaling
- Vercel automatically scales your frontend
- Render/Railway free tier has limitations; consider upgrading for production use

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` in backend matches your Vercel deployment
   - Check that your Vercel domain is in the CORS allowlist

2. **Environment Variables Not Loading**
   - Verify all required variables are set
   - Check for typos in variable names
   - Remember VITE_ prefix for frontend variables

3. **Build Failures**
   - Check build logs in deployment dashboards
   - Ensure all dependencies are in package.json
   - Verify Node.js version requirements

4. **API Connection Issues**
   - Confirm backend URL is correct in frontend config
   - Check backend health endpoint
   - Verify Supabase configuration

### Railway-Specific Issues

1. **JWT_SECRET Error**
   - Ensure you've created a secret named `JWT_SECRET` in Railway Variables/Secrets UI
   - The value should be your Supabase JWT secret (found in Supabase project settings)
   - Railway mounts secrets as files in `/secrets/JWT_SECRET` during build

### Health Checks
Monitor these endpoints:
- Frontend: `https://your-frontend.vercel.app`
- Backend Health: `https://your-backend.[onrender.com OR railway.app]/health`
- Backend API: `https://your-backend.[onrender.com OR railway.app]/api/health`

## Cost Considerations

1. **Vercel**: Free tier includes generous limits for most applications
2. **Render/Railway**: Free tier has limitations (sleeps after inactivity)
3. **Supabase**: Free tier includes 500MB database, 5GB bandwidth
4. **Groq**: Free tier includes generous API credits

For production use, consider upgrading to paid plans for better performance and reliability.

## Next Steps

1. Set up monitoring and alerting
2. Configure backup strategies
3. Implement CI/CD pipelines
4. Set up analytics
5. Configure error tracking