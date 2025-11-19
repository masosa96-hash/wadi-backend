# WADI Deployment Guide

This guide covers deploying WADI using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Supabase account and project
- OpenAI API key

## Quick Start with Docker Compose

### 1. Environment Setup

Create a `.env` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
```

### 2. Database Setup

Execute the SQL schemas in your Supabase SQL Editor:

1. Main schema: `docs/database-schema.md`
2. Phase 1 additions: `docs/database-schema-phase1.sql`

This will create:
- `profiles`, `projects`, `runs`, `sessions` tables
- `memories` table (vector store)
- `tasks` table (project management)
- All necessary indexes and RLS policies

### 3. Build and Run

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **WebSocket**: ws://localhost:4000/ws
- **Health Check**: http://localhost:4000/health

## Service Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Nginx     │────▶ │  Backend    │────▶ │   Supabase   │
│ (Frontend)  │      │   (API)     │      │  (Database)  │
│   :3000     │      │   :4000     │      │              │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │    Redis    │
                     │  (Optional) │
                     │   :6379     │
                     └─────────────┘
```

## Individual Service Management

### Frontend Only

```bash
docker-compose up -d frontend
```

### Backend Only

```bash
docker-compose up -d backend
```

### Stop All Services

```bash
docker-compose down
```

### Remove Volumes (Clean Slate)

```bash
docker-compose down -v
```

## Production Deployment Checklist

### Security

- [ ] Use HTTPS with valid SSL certificates
- [ ] Change all default ports
- [ ] Set strong SECRET_KEY values
- [ ] Enable firewall rules
- [ ] Configure CORS properly
- [ ] Use environment-specific .env files
- [ ] Enable Supabase RLS policies

### Performance

- [ ] Enable Redis caching (already in docker-compose)
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable gzip compression (configured in Nginx)
- [ ] Configure rate limiting

### Monitoring

- [ ] Set up logging aggregation
- [ ] Configure health checks (already configured)
- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry recommended)
- [ ] Set up performance monitoring

### Backup

- [ ] Configure Supabase automated backups
- [ ] Set up volume backups for `api-temp`
- [ ] Configure Redis persistence (already enabled)
- [ ] Test restoration procedures

## Scaling Strategies

### Horizontal Scaling (Multiple Instances)

Update `docker-compose.yml`:

```yaml
backend:
  # ... existing config
  deploy:
    replicas: 3
    update_config:
      parallelism: 1
      delay: 10s
```

### Load Balancing

Add Nginx reverse proxy:

```nginx
upstream backend {
    server backend:4000;
    # Add more backend instances
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Environment Variables Reference

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbG...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-xxx` |
| `OPENAI_DEFAULT_MODEL` | Default AI model | `gpt-3.5-turbo` |
| `PORT` | API server port | `4000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Backend (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Missing environment variables
# 2. Supabase connection failure
# 3. Port already in use
```

### Frontend Can't Connect to API

```bash
# Check backend health
curl http://localhost:4000/health

# Check CORS settings
# Ensure FRONTEND_URL matches your deployment URL
```

### Database Connection Issues

```bash
# Verify Supabase credentials
# Check if RLS policies are enabled
# Ensure database tables exist
```

### WebSocket Connection Fails

```bash
# Test WebSocket
wscat -c ws://localhost:4000/ws

# Check if port 4000 is accessible
# Verify proxy configuration if using reverse proxy
```

## Advanced Configuration

### Custom Docker Build

Build with specific Node version:

```dockerfile
FROM node:20-alpine AS builder
# ... rest of Dockerfile
```

### Multi-Stage Build Optimization

Current Dockerfiles already use multi-stage builds to minimize image size:

- **Builder stage**: Installs all dependencies and builds
- **Production stage**: Only copies built artifacts and production dependencies

### Volume Mounts for Development

```yaml
backend:
  volumes:
    - ./apps/api/src:/app/apps/api/src
  command: pnpm dev
```

## Maintenance

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild images
docker-compose build

# Restart services
docker-compose up -d
```

### View Resource Usage

```bash
docker stats
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune
```

## Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure database schema is up to date
4. Review `PHASE_1_IMPLEMENTATION_STATUS.md`

---

**WADI Docker Deployment** - Optimized for production with security and performance in mind.
