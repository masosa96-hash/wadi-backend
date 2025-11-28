# WADI Deployment Scripts

This directory contains scripts to help you deploy the WADI application to the cloud.

## Files

1. **[CLOUD_DEPLOYMENT_GUIDE.md](file:///E:/WADI/CLOUD_DEPLOYMENT_GUIDE.md)** - Complete guide for deploying to Vercel and Render
2. **[DEPLOYMENT_CHECKLIST.md](file:///E:/WADI/DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist for deployment
3. **[deploy-cloud.ps1](file:///E:/WADI/deploy-cloud.ps1)** - PowerShell script to prepare for deployment
4. **[deploy-vercel.ps1](file:///E:/WADI/deploy-vercel.ps1)** - PowerShell script for Vercel deployment (frontend only)

## Using the Deployment Preparation Script

The [deploy-cloud.ps1](file:///E:/WADI/deploy-cloud.ps1) script helps you prepare your local repository for cloud deployment by:

1. Verifying all required deployment files exist
2. Checking for uncommitted changes
3. Building both frontend and backend applications

### Prerequisites

- Windows PowerShell or PowerShell 7+
- pnpm installed
- Git installed

### Running the Script

1. Open PowerShell
2. Navigate to the WADI root directory (`E:\WADI`)
3. Run the script:
   ```powershell
   .\deploy-cloud.ps1
   ```

The script will:
- Check that all required deployment files exist
- Prompt you to commit any uncommitted changes
- Build both the frontend and backend applications
- Provide next steps for cloud deployment

## Using the Vercel Deployment Script

The [deploy-vercel.ps1](file:///E:/WADI/deploy-vercel.ps1) script is specifically for deploying the frontend to Vercel.

### Prerequisites

- Vercel CLI installed (`npm install -g vercel`)
- Logged into Vercel CLI (`vercel login`)

### Running the Script

1. Open PowerShell
2. Navigate to the WADI root directory (`E:\WADI`)
3. Run the script:
   ```powershell
   .\deploy-vercel.ps1
   ```

## Next Steps

After running the preparation script:

1. Push your code to GitHub
2. Deploy backend to Render using the configuration in [render.yaml](file:///E:/WADI/render.yaml)
3. Deploy frontend to Vercel using the configuration in [apps/frontend/vercel.json](file:///E:/WADI/apps/frontend/vercel.json)
4. Configure environment variables in both platforms
5. Update the backend's `FRONTEND_URL` environment variable with your Vercel deployment URL

Refer to [CLOUD_DEPLOYMENT_GUIDE.md](file:///E:/WADI/CLOUD_DEPLOYMENT_GUIDE.md) for detailed instructions on each step.