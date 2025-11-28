# How to Fix the JWT_SECRET Error on Railway

This guide explains how to resolve the JWT_SECRET error when deploying the WADI backend on Railway using Railpack.

## Understanding the Error

The error you're seeing:
```
ERROR: failed to build: failed to stat /tmp/railpack-build-3846039788/secrets/JWT_SECRET: stat /tmp/railpack-build-3846039788/secrets/JWT_SECRET: no such file or directory
```

This occurs because Railway's Railpack expects certain secrets to be mounted as files in the `/secrets` directory during the build process. The JWT_SECRET is one such secret that's required.

## Required Environment Variables for WADI Backend on Railway

Here are all the environment variables/secrets required for the WADI backend on Railway:

### Regular Environment Variables (set in Variables tab):
```
SUPABASE_URL=your-supabase-project-url.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
GROQ_API_KEY=your-groq-api-key
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
NODE_ENV=production
FRONTEND_URL=https://placeholder.vercel.app (update after Vercel deployment)
```

### Secrets (set in Variables/Secrets UI):
```
JWT_SECRET=your-supabase-jwt-secret
```

## How to Fix the JWT_SECRET Error

### Step 1: Get Your Supabase JWT Secret

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Find the "JWT Secret" section
4. Copy the JWT secret value (it's a long string that starts with `eyJhbGci...`)

### Step 2: Create the JWT_SECRET Secret in Railway

1. Go to your Railway project dashboard
2. Click on the "Variables" tab
3. Scroll down to the "Secrets" section
4. Click "New Variable"
5. Set:
   - **Name**: `JWT_SECRET`
   - **Value**: Paste your Supabase JWT secret
   - **Environment**: Production (or the environment you're deploying to)
6. Click "Add Variable"

### Step 3: Redeploy Your Application

1. After adding the JWT_SECRET secret, Railway should automatically start a new deployment
2. If it doesn't start automatically, you can trigger a redeploy by:
   - Pushing a new commit to your GitHub repository
   - Or clicking "Deploy" manually in the Railway dashboard

## How Railway Secrets Work

Railway's Railpack automatically mounts secrets as files in the `/secrets` directory during the build and runtime processes:

- When you create a secret named `JWT_SECRET` in Railway
- Railway automatically creates a file at `/secrets/JWT_SECRET`
- This file contains the value you set for the secret
- Your application can read this file to get the secret value

This is why the build process was failing - it was looking for `/secrets/JWT_SECRET` but the file didn't exist because the secret wasn't created.

## Verification Steps

After fixing the JWT_SECRET error and redeploying:

1. Check the deployment logs to ensure the build completes successfully
2. Verify your application is running by accessing the health endpoint:
   ```
   curl https://your-railway-app.railway.app/health
   ```
3. You should receive a response like:
   ```json
   {
     "status": "ok",
     "supabase": "connected",
     "openai": "connected",
     "timestamp": "2023-XX-XXTXX:XX:XX.XXXZ"
   }
   ```

## Troubleshooting

If you're still experiencing issues:

1. **Double-check the secret name**: It must be exactly `JWT_SECRET` (case-sensitive)
2. **Verify the secret value**: Ensure you copied the correct Supabase JWT secret
3. **Check environment**: Make sure the secret is set for the correct environment
4. **Review logs**: Check the build logs for any additional error messages
5. **Restart deployment**: Try triggering a new deployment after verifying the secret

## Security Notes

- The JWT_SECRET is properly handled as a secret in Railway
- It's mounted as a file rather than an environment variable for better security
- The file is only accessible to your application during build and runtime
- Never commit secrets to your version control system