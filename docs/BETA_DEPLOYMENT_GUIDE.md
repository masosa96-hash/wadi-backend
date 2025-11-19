# WADI Beta Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying WADI to production for beta testing. The deployment uses Docker containers orchestrated with Docker Compose.

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 22.04 LTS or similar Linux distribution
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk**: 20GB available space
- **CPU**: 2 cores (4 cores recommended)

### Required Software
- Docker Engine 20.10+ ([Installation Guide](https://docs.docker.com/engine/install/))
- Docker Compose 2.0+ (included with Docker Desktop)
- Git

### Required Accounts
- **Supabase Account**: For database and authentication
- **OpenAI Account**: For AI functionality
- **Domain Name**: For production deployment (optional for testing)
- **SSL Certificate**: Let's Encrypt recommended

---

## Part 1: Pre-Deployment Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Note down:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon (public) key
   - Service role (secret) key
3. Navigate to SQL Editor in Supabase dashboard

### Step 2: Setup Database Schema

Execute the following migration files in order in the Supabase SQL Editor:

1. **Initial Schema** (`docs/migrations/001_initial_schema.sql`):
   - Creates tables: `profiles`, `projects`, `sessions`, `runs`
   - Sets up RLS policies
   - Creates triggers

2. **Beta Invitations** (`docs/migrations/002_beta_invitations_and_roles.sql`):
   - Adds `role` column to profiles
   - Creates `beta_invitations` table
   - Adds invitation management functions

Copy and paste each file's contents into the SQL Editor and execute.

### Step 3: Obtain OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Save securely (it won't be shown again)
4. Add credits to your OpenAI account

### Step 4: Prepare Server

SSH into your server:

```bash
ssh user@your-server.com
```

Update system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

Install Docker (if not installed):

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and back in for group changes to take effect.

---

## Part 2: Application Deployment

### Step 1: Clone Repository

```bash
cd /opt
sudo git clone https://github.com/your-org/wadi.git
cd wadi
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
sudo nano .env
```

Add the following variables (replace with your actual values):

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo

# Application URLs (update for production)
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com

# Node Environment
NODE_ENV=production
PORT=4000
```

Save and exit (Ctrl+X, Y, Enter).

### Step 3: Build and Start Containers

Build the Docker images:

```bash
sudo docker-compose build
```

Start all services:

```bash
sudo docker-compose up -d
```

### Step 4: Verify Deployment

Check container status:

```bash
sudo docker-compose ps
```

All containers should show "Up" status.

Check health endpoint:

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "supabase": "connected",
  "timestamp": "...",
  "uptime": 123,
  "services": {...}
}
```

View logs:

```bash
# Backend logs
sudo docker-compose logs -f backend

# Frontend logs
sudo docker-compose logs -f frontend
```

---

## Part 3: SSL and Reverse Proxy Setup

### Option A: Nginx Reverse Proxy

Install Nginx:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create Nginx configuration (`/etc/nginx/sites-available/wadi`):

```nginx
# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/wadi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Obtain SSL certificates:

```bash
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

Follow the prompts. Certbot will automatically configure SSL.

---

## Part 4: Create Initial Admin User

### Method 1: Environment Variable (First Deployment Only)

Add to `.env`:

```env
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
INITIAL_ADMIN_PASSWORD=ChangeThisImmediately123!
```

Restart backend:

```bash
sudo docker-compose restart backend
```

**Important**: Remove these variables and change the password after first login.

### Method 2: Database Direct Insert

Connect to Supabase SQL Editor and run:

```sql
-- First, create the auth user manually through Supabase Auth UI
-- Then update the profile role:

UPDATE profiles
SET role = 'admin'
WHERE user_id = 'your-user-id-here';
```

---

## Part 5: Create Beta Invitations

### Using Database Functions

In Supabase SQL Editor:

```sql
-- Generate a single-use invitation
INSERT INTO beta_invitations (code, max_uses, expires_at)
VALUES (
  (SELECT generate_invitation_code()),
  1,
  NOW() + INTERVAL '7 days'
);

-- Generate a multi-use invitation (50 uses, 30 days)
INSERT INTO beta_invitations (code, max_uses, expires_at)
VALUES (
  (SELECT generate_invitation_code()),
  50,
  NOW() + INTERVAL '30 days'
);

-- View all invitations
SELECT code, max_uses, current_uses, expires_at, created_at
FROM beta_invitations
ORDER BY created_at DESC;
```

### Using API (requires admin authentication)

```bash
# Create invitation
curl -X POST https://api.your-domain.com/api/admin/invitations \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "maxUses": 50,
    "expiresInDays": 30,
    "metadata": {"source": "initial_beta"}
  }'

# List invitations
curl https://api.your-domain.com/api/admin/invitations \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Part 6: Testing and Validation

### Test Registration Flow

1. Get an invitation code from database or API
2. Navigate to `https://your-domain.com/register?invite=CODE-HERE`
3. Fill in registration form
4. Verify profile is created in Supabase
5. Verify invitation `current_uses` incremented

### Test Complete User Flow

1. **Registration**: Create account with invitation
2. **Login**: Sign in with credentials
3. **Project Creation**: Create a new project
4. **Session**: Auto-create session on first message
5. **AI Run**: Send message and receive AI response
6. **Token Refresh**: Leave session open for 1+ hour, verify no logout

### Security Validation

Run these checks:

```bash
# Test rate limiting (should get 429 after 100 requests)
for i in {1..101}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://api.your-domain.com/health
done

# Test security headers
curl -I https://your-domain.com

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Strict-Transport-Security: max-age=31536000
```

---

## Part 7: Monitoring and Maintenance

### View Logs

```bash
# Real-time logs
sudo docker-compose logs -f

# Specific service
sudo docker-compose logs -f backend

# Log files (inside container)
sudo docker exec wadi-backend cat /app/apps/api/logs/error.log
```

### Monitor Resource Usage

```bash
# Container stats
sudo docker stats

# Disk usage
sudo docker system df
```

### Database Backups

Configure automatic backups in Supabase:
1. Go to Project Settings → Database
2. Enable Point-in-Time Recovery (PITR)
3. Set backup retention period

### Application Updates

```bash
# Pull latest code
sudo git pull

# Rebuild and restart
sudo docker-compose down
sudo docker-compose build
sudo docker-compose up -d
```

---

## Troubleshooting

### Backend Won't Start

**Check environment variables:**
```bash
sudo docker-compose logs backend | grep "Environment Validation"
```

**Solution**: Fix any validation errors in `.env` file.

### Database Connection Fails

**Check Supabase URL and keys:**
```bash
curl https://your-project.supabase.co/rest/v1/
```

**Solution**: Verify keys haven't expired or been rotated.

### Frontend Shows Blank Page

**Check browser console for errors.**

**Common causes:**
- API URL misconfigured
- CORS settings incorrect
- Supabase URL mismatch

**Solution**: Update `.env` files and rebuild:
```bash
sudo docker-compose down
sudo docker-compose build frontend
sudo docker-compose up -d
```

### Rate Limiting Too Aggressive

**Adjust limits in code** (`apps/api/src/middleware/rateLimit.ts`):

```typescript
max: 100, // Increase if needed
```

Rebuild and restart backend.

---

## Security Checklist

Before going live:

- [ ] SSL certificates installed and auto-renewal configured
- [ ] Firewall configured (allow only 80, 443, 22)
- [ ] SSH key-only authentication enabled
- [ ] `.env` file permissions set to 600
- [ ] Database RLS policies tested
- [ ] Rate limiting active on all endpoints
- [ ] Error messages don't leak sensitive information
- [ ] Admin account password changed from initial
- [ ] Monitoring and alerting configured
- [ ] Backup and restore procedures tested

---

## Production Checklist

- [ ] Database migrations applied
- [ ] All environment variables configured
- [ ] SSL certificates valid
- [ ] Health check endpoint responding
- [ ] Admin user created
- [ ] Beta invitations generated
- [ ] Test user flow completed
- [ ] Rate limiting verified
- [ ] Logs accessible
- [ ] Backup configured
- [ ] Monitoring set up
- [ ] Documentation updated with actual URLs

---

## Support and Escalation

### Common Issues

1. **Token Refresh Fails**: Check SUPABASE_URL matches between frontend and backend
2. **AI Runs Fail**: Verify OpenAI API key has credits
3. **Invitation Invalid**: Check expiration date and use count in database

### Getting Help

- Check logs: `sudo docker-compose logs`
- Review Supabase logs in dashboard
- Verify OpenAI usage in platform dashboard

---

## Next Steps After Deployment

1. **Invite Beta Testers**: Share invitation links
2. **Monitor Usage**: Watch logs and Supabase dashboard
3. **Collect Feedback**: Set up feedback mechanism
4. **Iterate**: Apply fixes and improvements
5. **Plan Phase 2**: Based on beta learnings

---

**Deployment Date**: [Fill in]  
**Deployed By**: [Fill in]  
**Production URL**: [Fill in]  
**Admin Contact**: [Fill in]
