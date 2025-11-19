# Railway Environment Variables Setup Guide

## Required Environment Variables

Configure these environment variables in Railway dashboard:

### 1. Supabase Configuration
```
SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM
SUPABASE_SERVICE_KEY=[your-service-role-key-from-supabase]
```

### 2. OpenAI Configuration
```
OPENAI_API_KEY=[your-openai-api-key]
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
```

### 3. Application Configuration
```
NODE_ENV=production
FRONTEND_URL=[will-be-updated-after-vercel-deployment]
```

## Deployment Steps

### Step 1: Initial Deployment
1. Set all variables except FRONTEND_URL
2. Use placeholder for FRONTEND_URL: `https://placeholder.com`
3. Deploy to Railway
4. Note the Railway URL (e.g., `https://wadi-api-production.railway.app`)

### Step 2: Update FRONTEND_URL
After Vercel deployment, update:
```
FRONTEND_URL=[actual-vercel-url]
```

Railway will automatically redeploy.
