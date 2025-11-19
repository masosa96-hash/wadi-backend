# Vercel Environment Variables Setup Guide

## Required Environment Variables

Configure these environment variables in Vercel dashboard (Production environment):

### 1. Supabase Configuration
```
VITE_SUPABASE_URL=https://smkbiguvgiscojwxgbae.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNta2JpZ3V2Z2lzY29qd3hnYmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTE4MjMsImV4cCI6MjA3ODk4NzgyM30.n0Axs-saQDaAhGJidiRkI_w9EEOJDavJnmPXZ0UUvyM
```

### 2. API Configuration
```
VITE_API_URL=[railway-api-url-from-step-1]
```

Example:
```
VITE_API_URL=https://wadi-api-production.railway.app
```

## Important Notes

1. All frontend environment variables MUST be prefixed with `VITE_`
2. Use the Railway API URL obtained from backend deployment
3. These variables are embedded at build time
4. Any changes require redeployment

## Vercel Project Configuration

- **Framework Preset**: Vite
- **Root Directory**: apps/frontend
- **Build Command**: pnpm build
- **Output Directory**: dist
- **Install Command**: pnpm install --frozen-lockfile
- **Node.js Version**: 20.x
