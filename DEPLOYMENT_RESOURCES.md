# WADI Deployment Resources

This document explains all the deployment resources that have been prepared to help you get WADI running 24/7 in the cloud.

## Deployment Guides

### 1. [COMPLETE_DEPLOYMENT_GUIDE.md](file:///E:/WADI/COMPLETE_DEPLOYMENT_GUIDE.md)

A comprehensive, step-by-step guide with all the exact configuration details you need for deployment:

- Exact build commands for frontend and backend
- Required environment variables with examples
- Detailed steps for each platform (Vercel, Render, Supabase, Groq)
- Post-deployment verification steps
- Troubleshooting tips

### 2. [CLOUD_DEPLOYMENT_GUIDE.md](file:///E:/WADI/CLOUD_DEPLOYMENT_GUIDE.md)

A supplementary guide with additional context and explanations.

### 3. [DEPLOYMENT_CHECKLIST.md](file:///E:/WADI/DEPLOYMENT_CHECKLIST.md)

A checklist format to ensure you don't miss any steps during deployment.

## Configuration Files

### Frontend Configuration

- [apps/frontend/vercel.json](file:///E:/WADI/apps/frontend/vercel.json) - Vercel deployment configuration
- [apps/frontend/.env.example](file:///E:/WADI/apps/frontend/.env.example) - Frontend environment variables template

### Backend Configuration

- [render.yaml](file:///E:/WADI/render.yaml) - Render deployment configuration
- [apps/api/.env.example](file:///E:/WADI/apps/api/.env.example) - Backend environment variables template

## Automation Scripts

### 1. [deploy-check.bat](file:///E:/WADI/deploy-check.bat)

A Windows batch file that verifies all required deployment files are present:

- Checks for [render.yaml](file:///E:/WADI/render.yaml)
- Checks for [apps/frontend/vercel.json](file:///E:/WADI/apps/frontend/vercel.json)
- Checks for environment variable templates
- Provides next steps guidance

To run: Double-click the file or execute `.\deploy-check.bat` from the command line in the WADI root directory.

## Deployment Architecture

The deployment architecture consists of four main components:

1. **Frontend** - Hosted on Vercel
   - React/Vite application
   - Static assets served via CDN
   - Environment variables prefixed with `VITE_`

2. **Backend** - Hosted on Render
   - Express.js API with WebSocket support
   - Environment variables without `VITE_` prefix
   - Health check endpoints

3. **Database** - Hosted on Supabase
   - PostgreSQL database
   - Authentication services
   - Real-time subscriptions

4. **AI Services** - Hosted on Groq (with OpenAI as fallback)
   - Primary AI provider for chat functionality
   - API key stored in backend environment variables

## Required Accounts

Before deployment, you'll need to create free accounts with:

1. **GitHub** - For version control and connecting to deployment platforms
2. **Vercel** - For frontend deployment
3. **Render** - For backend deployment
4. **Supabase** - For database and authentication
5. **Groq** - For AI services

## Deployment Steps Summary

1. Create accounts with all required services
2. Set up Supabase project and get API keys
3. Get Groq API key
4. Deploy frontend to Vercel
5. Deploy backend to Render
6. Configure environment variables in both platforms
7. Update cross-references between frontend and backend
8. Run database migrations
9. Verify deployment with health checks

## Post-Deployment Verification

After deployment, verify that:

1. Frontend loads correctly in a browser
2. Backend health endpoint responds (`/health`)
3. API endpoints are accessible
4. Chat/WebSocket functionality works
5. Authentication flows work correctly
6. Database connections are established
7. AI services are functioning

## Support

If you encounter any issues during deployment:

1. Check the troubleshooting section in [COMPLETE_DEPLOYMENT_GUIDE.md](file:///E:/WADI/COMPLETE_DEPLOYMENT_GUIDE.md)
2. Verify all environment variables are correctly set
3. Check build logs in Vercel and Render dashboards
4. Ensure database migrations have been run
5. Contact support for the respective platforms if needed
