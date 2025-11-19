# WADI Beta - Quick Setup Guide

**Time Required**: 30 minutes (assuming services ready)  
**Prerequisites**: Supabase project, OpenAI API key, Docker installed

---

## Step 1: Database Setup (5 min)

In Supabase SQL Editor, execute in order:

### Migration 1: Core Schema
```sql
-- Copy/paste contents of: docs/migrations/001_initial_schema.sql
```

### Migration 2: Beta Features
```sql
-- Copy/paste contents of: docs/migrations/002_beta_invitations_and_roles.sql
```

---

## Step 2: Environment Configuration (3 min)

Create `.env` file in project root:

```env
# Supabase (from your Supabase project settings)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_KEY=eyJhbG...

# OpenAI (from platform.openai.com)
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo

# URLs (adjust for production)
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:4000

# Environment
NODE_ENV=production
PORT=4000
```

---

## Step 3: Deploy with Docker (10 min)

```bash
# Build containers
docker-compose build

# Start all services
docker-compose up -d

# Verify all running
docker-compose ps
```

Expected output: All services "Up" status.

---

## Step 4: Verify Deployment (2 min)

```bash
# Test health endpoint
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","supabase":"connected",...}

# Check frontend
curl http://localhost:3000
# Should return HTML
```

---

## Step 5: Create Admin User (5 min)

### Method A: Register via UI + SQL
1. Open `http://localhost:3000/register`
2. Register with any email/password (will fail without invitation)
3. Create profile manually in Supabase Auth UI
4. In SQL Editor:
```sql
UPDATE profiles SET role = 'admin' 
WHERE user_id = 'your-user-id-from-auth';
```

### Method B: Environment Variable
Add to `.env`:
```env
INITIAL_ADMIN_EMAIL=admin@yourdomain.com
INITIAL_ADMIN_PASSWORD=ChangeMe123!
```

Restart backend:
```bash
docker-compose restart backend
```

**Important**: Remove these variables after first login!

---

## Step 6: Generate Beta Invitations (5 min)

In Supabase SQL Editor:

```sql
-- Generate 10 single-use invitations (7 days)
DO $$
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO beta_invitations (code, max_uses, expires_at)
    VALUES ((SELECT generate_invitation_code()), 1, NOW() + INTERVAL '7 days');
  END LOOP;
END $$;

-- Get invitation codes
SELECT code, max_uses, current_uses, expires_at, created_at
FROM beta_invitations
WHERE current_uses < COALESCE(max_uses, 999999)
AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY created_at DESC;
```

Copy codes for beta testers.

---

## Step 7: Test Complete Flow (10 min)

1. **Get Invitation Code** from SQL query above

2. **Register New User**:
   - Navigate to: `http://localhost:3000/register?invite=XXXX-XXXX-...`
   - Fill in email, password, display name
   - Submit (API endpoint: `/api/auth/register-with-invite`)

3. **Login**:
   - Use credentials from registration
   - Should redirect to `/projects`

4. **Create Project**:
   - Click "Create Project"
   - Enter name and description
   - Submit

5. **Send AI Message**:
   - Click project card
   - Type message in input field
   - Submit
   - Verify AI response appears

6. **Verify Token Refresh**:
   - Leave tab open for 1+ hour
   - Send another message
   - Should work without re-login

---

## Quick Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Invalid SUPABASE_URL → Check .env
# - Missing OPENAI_API_KEY → Add to .env
```

### Database Connection Failed
```bash
# Test Supabase URL
curl https://your-project.supabase.co/rest/v1/

# Verify keys in Supabase dashboard:
# Settings → API → Project API keys
```

### Registration Fails
```sql
-- Check invitation validity
SELECT * FROM beta_invitations WHERE code = 'YOUR-CODE';

-- Verify not expired, uses remaining
```

### Rate Limit Hit
```bash
# Edit apps/api/src/middleware/rateLimit.ts
# Increase 'max' values, rebuild:
docker-compose down
docker-compose build backend
docker-compose up -d
```

---

## Production Deployment

For production (not localhost):

1. **Get Domain**: Configure DNS records
2. **SSL Certificates**: Use Certbot/Let's Encrypt
3. **Update URLs** in `.env`:
```env
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
```
4. **Nginx Reverse Proxy**: See `docs/BETA_DEPLOYMENT_GUIDE.md` Section 3

---

## Monitoring

```bash
# Real-time logs
docker-compose logs -f backend

# Resource usage
docker stats

# Restart service
docker-compose restart backend

# Stop all
docker-compose down
```

---

## Quick Reference

| Component | Port | URL | Purpose |
|-----------|------|-----|---------|
| Frontend | 3000 | http://localhost:3000 | User interface |
| Backend | 4000 | http://localhost:4000 | API server |
| Health | 4000 | http://localhost:4000/health | Status check |
| Redis | 6379 | localhost:6379 | Caching (optional) |

---

## Need Help?

- **Full Guide**: `docs/BETA_DEPLOYMENT_GUIDE.md`
- **Feature Details**: `BETA_READINESS_SUMMARY.md`
- **Design Spec**: `.qoder/quests/feature-beta-preparation.md`

---

**Status**: Ready for beta deployment ✅  
**Estimated Setup Time**: 30 minutes  
**Difficulty**: Medium (requires Docker knowledge)
