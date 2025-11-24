# 🚀 DEPLOYMENT GUIDE - WADI

## 📋 Pre-requisitos

- Node.js 20+
- pnpm (o npm/yarn)
- Cuenta en Supabase
- API Key de OpenAI
- Servicio de hosting (Vercel, Netlify, Railway, etc.)

---

## 🎯 Deployment Rápido (Vercel + Railway)

### Backend (Railway)

1. **Crear cuenta en Railway**
   ```
   https://railway.app/
   ```

2. **Crear nuevo proyecto**
   - Click en "New Project"
   - Seleccionar "Deploy from GitHub repo"
   - Buscar tu repositorio

3. **Configurar variables de entorno**
   ```
   PORT=4000
   NODE_ENV=production
   
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_KEY=eyJ...
   
   OPENAI_API_KEY=sk-proj-...
   OPENAI_DEFAULT_MODEL=gpt-3.5-turbo
   
   FRONTEND_URL=https://tu-app.vercel.app
   
   GUEST_MODE=true
   ```

4. **Configurar build**
   - Root Directory: `apps/api`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start`

5. **Deploy**
   - Railway automáticamente detecta cambios
   - Obtendrás URL tipo: `https://wadi-api.up.railway.app`

---

### Frontend (Vercel)

1. **Crear cuenta en Vercel**
   ```
   https://vercel.com/
   ```

2. **Importar proyecto**
   - Click "Add New..." → "Project"
   - Import tu repositorio
   - Framework Preset: Vite
   - Root Directory: `apps/frontend`

3. **Configurar variables de entorno**
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   
   VITE_API_URL=https://wadi-api.up.railway.app
   
   VITE_GUEST_MODE=true
   ```

4. **Build Settings**
   - Build Command: `pnpm install && pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

5. **Deploy desde CLI (OPCIÓN 1 - Recomendada)**
   ```bash
   # Deployar desde la raíz del monorepo
   cd E:\WADI
   vercel --prod
   ```
   ⚠️ **IMPORTANTE**: Con Root Directory = `apps/frontend` en Vercel, siempre deployá desde `E:\WADI`, NO desde `E:\WADI\apps\frontend`

6. **Deploy desde Dashboard (OPCIÓN 2)**
   - Click "Deploy"
   - Obtendrás URL tipo: `https://wadi.vercel.app`

**Alternativa**: Si preferís deployar desde `apps/frontend`:
   - Ir a Vercel → Settings → General → Root Directory
   - Cambiar a `.` (vacío)
   - Redeploy el proyecto

---

## 🔧 Configuración Avanzada

### DNS Custom

**Vercel:**
```
1. Ir a Settings → Domains
2. Agregar tu dominio (ej: app.wadi.ai)
3. Configurar DNS según instrucciones
4. Esperar propagación (5-60 min)
```

**Railway:**
```
1. Ir a Settings → Domains
2. Agregar custom domain
3. Configurar CNAME en tu DNS
```

---

### Environment Variables por Entorno

**Development:**
```bash
# .env.development
VITE_API_URL=http://localhost:4000
VITE_GUEST_MODE=true
```

**Staging:**
```bash
# .env.staging
VITE_API_URL=https://wadi-api-staging.up.railway.app
VITE_GUEST_MODE=true
```

**Production:**
```bash
# .env.production
VITE_API_URL=https://api.wadi.ai
VITE_GUEST_MODE=false  # Solo usuarios autenticados
```

---

## 🐳 Docker Deployment

### Backend Dockerfile

```dockerfile
# apps/api/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código
COPY apps/api ./apps/api
COPY packages ./packages

# Build
WORKDIR /app/apps/api
RUN pnpm build

# Exponer puerto
EXPOSE 4000

# Start
CMD ["pnpm", "start"]
```

### Frontend Dockerfile

```dockerfile
# apps/frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend
COPY packages ./packages

WORKDIR /app/apps/frontend
RUN pnpm build

# Nginx stage
FROM nginx:alpine

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - FRONTEND_URL=http://localhost
      - GUEST_MODE=true
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: apps/frontend/Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api
    restart: unless-stopped
```

**Ejecutar:**
```bash
docker-compose up -d
```

---

## 🌐 Nginx Configuration

```nginx
# apps/frontend/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔒 Security Checklist

- [ ] HTTPS habilitado (SSL/TLS)
- [ ] API Keys en variables de entorno (no en código)
- [ ] CORS configurado correctamente
- [ ] Rate limiting habilitado
- [ ] Helmet headers activos
- [ ] Auth tokens encriptados
- [ ] .env.example creado (sin claves reales)
- [ ] .gitignore incluye .env
- [ ] Secrets rotados periódicamente

---

## 📊 Monitoring

### Sentry (Error Tracking)

```typescript
// Frontend
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});

// Backend
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Vercel Analytics

```typescript
// apps/frontend/src/main.tsx
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

---

## 🚦 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm --filter api build
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🧪 Pre-deployment Checklist

```bash
# 1. Tests
pnpm test

# 2. Lint
pnpm lint

# 3. Build local
pnpm build

# 4. Test build locally
pnpm --filter frontend preview

# 5. Check bundle size
pnpm --filter frontend run build --report

# 6. Environment variables
diff apps/api/.env.example apps/api/.env
diff apps/frontend/.env.example apps/frontend/.env

# 7. Database migrations (si aplica)
# pnpm run db:migrate

# 8. Smoke tests
curl https://api.wadi.ai/health
curl https://wadi.vercel.app
```

---

## 📈 Post-deployment

### 1. Verificar salud

```bash
# Backend
curl https://api.wadi.ai/health
# Debe retornar: {"status":"ok","supabase":"connected"}

# Frontend
curl https://wadi.vercel.app
# Debe retornar: 200 OK
```

### 2. Smoke tests

- [ ] Abrir app en navegador
- [ ] Verificar modal de nickname aparece
- [ ] Enviar mensaje de prueba
- [ ] Verificar respuesta de chat
- [ ] Recargar página
- [ ] Verificar historial persiste

### 3. Monitoring

- Configurar alertas en Railway/Vercel
- Revisar logs en primeras 24h
- Monitorear métricas de Sentry
- Verificar costos de OpenAI

---

## 🆘 Rollback

### Vercel:
```bash
# Ver deployments
vercel ls

# Rollback a anterior
vercel rollback [deployment-url]
```

### Railway:
```bash
# Desde dashboard:
# 1. Ir a Deployments
# 2. Click en deployment anterior
# 3. Click "Redeploy"
```

---

## 📞 Troubleshooting

### Error: "Cannot connect to API"

**Solución:**
1. Verificar `VITE_API_URL` en frontend
2. Verificar `FRONTEND_URL` en backend (CORS)
3. Check logs de Railway

### Error: "OpenAI API key invalid"

**Solución:**
1. Verificar `OPENAI_API_KEY` en Railway
2. Verificar key en platform.openai.com
3. Regenerar key si es necesario

### Error: 502 Bad Gateway

**Solución:**
1. Verificar backend está corriendo
2. Check logs en Railway
3. Verificar health endpoint

---

## 💰 Costos Estimados

```
Railway (Backend):
├─ Starter: $5/month
└─ Pro: $20/month (recomendado)

Vercel (Frontend):
├─ Hobby: Gratis
└─ Pro: $20/month (si necesitas más bandwidth)

Supabase:
├─ Free: $0/month (hasta 500MB DB)
└─ Pro: $25/month

OpenAI:
├─ Pay-as-you-go
├─ ~$0.0004 por mensaje (gpt-3.5-turbo)
└─ Estimado: $10-50/month (depende del uso)

TOTAL MÍNIMO: ~$5/month
TOTAL RECOMENDADO: ~$50-100/month
```

---

## ✅ Deployment Completo

Una vez completados todos los pasos:

1. ✅ Backend en Railway
2. ✅ Frontend en Vercel
3. ✅ DNS configurado (opcional)
4. ✅ HTTPS habilitado
5. ✅ Monitoring activo
6. ✅ Smoke tests pasados
7. ✅ Documentación actualizada

**¡Tu app WADI está en producción!** 🎉

URL de ejemplo:
- Frontend: `https://wadi.vercel.app`
- Backend: `https://wadi-api.up.railway.app`

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Docker Docs](https://docs.docker.com/)
- [Nginx Docs](https://nginx.org/en/docs/)
