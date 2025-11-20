# 🚀 WADI Deployment Guide

## Quick Start
Este proyecto está **100% listo** para deployment automático en **Vercel** (frontend) y **Render** (backend).

---

## 📦 Estructura del Proyecto

```
WADI/
├── apps/
│   ├── frontend/          # React + Vite app
│   │   ├── dist/          # Build output
│   │   ├── vercel.json    # Vercel config
│   │   └── package.json
│   └── api/               # Express API
│       ├── dist/          # Build output
│       ├── src/
│       └── package.json
├── vercel.json            # Root Vercel config (monorepo)
├── render.yaml            # Render config
├── .nvmrc                 # Node version
└── package.json           # Root package.json
```

---

## 🎯 Frontend Deployment (Vercel)

### Configuración Automática

1. **Conectá tu repo a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Importá tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

2. **Variables de Entorno en Vercel:**
   ```
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
   VITE_API_URL=https://tu-backend.onrender.com
   ```

3. **Deploy:**
   - Vercel desplegará automáticamente en cada push a `main`
   - Build command: `cd apps/frontend && pnpm build`
   - Output directory: `apps/frontend/dist`
   - Install command: `pnpm install --frozen-lockfile`

### Deploy Manual (desde tu máquina)
```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Deploy
pnpm run deploy:frontend
```

### Configuración ya incluida:
- ✅ `vercel.json` en root (monorepo support)
- ✅ `vercel.json` en `apps/frontend`
- ✅ Build script configurado
- ✅ SPA routing configurado

---

## 🔧 Backend Deployment (Render)

### Configuración Automática

1. **Conectá tu repo a Render:**
   - Ve a [render.com](https://render.com)
   - Click en "New Web Service"
   - Conectá tu repositorio de GitHub
   - Render detectará automáticamente `render.yaml`

2. **Variables de Entorno en Render:**
   Las siguientes variables se configuran automáticamente o necesitan ser agregadas:
   
   **Auto-generadas:**
   - `NODE_ENV=production`
   - `PORT=10000`
   - `JWT_SECRET` (auto-generado)
   
   **Requeridas (configurar manualmente):**
   - `FRONTEND_URL=https://tu-app.vercel.app`
   - `SUPABASE_URL=tu_supabase_url`
   - `SUPABASE_ANON_KEY=tu_supabase_anon_key`
   - `SUPABASE_SERVICE_KEY=tu_supabase_service_key`
   - `OPENAI_API_KEY=tu_openai_key`

3. **Deploy:**
   - Render desplegará automáticamente en cada push a `main`
   - Build command: `cd apps/api && pnpm install --frozen-lockfile && pnpm build`
   - Start command: `cd apps/api && pnpm start`
   - Health check: `/health`

### Configuración ya incluida:
- ✅ `render.yaml` configurado
- ✅ Build y start scripts en `package.json`
- ✅ Health check endpoint
- ✅ Auto-rebuild on deploy

---

## 🛠️ Scripts Disponibles

### Development
```bash
# Full monorepo
pnpm dev

# Solo frontend
pnpm dev:front

# Solo backend
pnpm dev:api
```

### Build
```bash
# Build completo (frontend + backend)
pnpm build

# Solo frontend
pnpm build:frontend

# Solo backend
pnpm build:api
```

### Deploy
```bash
# Deploy frontend a Vercel (manual)
pnpm deploy:frontend

# Deploy backend a Render (manual)
pnpm deploy:api
```

---

## 🔐 Variables de Entorno

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://wadi-api.onrender.com
```

### Backend (.env)
```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://wadi.vercel.app

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-...

# JWT
JWT_SECRET=tu_secreto_seguro_aqui
```

---

## 📋 Checklist Pre-Deployment

### Vercel (Frontend)
- [ ] Repo conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Build exitoso localmente (`pnpm build:frontend`)
- [ ] URL del backend configurada en `VITE_API_URL`

### Render (Backend)
- [ ] Repo conectado a Render
- [ ] Variables de entorno configuradas
- [ ] Build exitoso localmente (`pnpm build:api`)
- [ ] Migraciones de Supabase ejecutadas
- [ ] OpenAI API key configurada

### General
- [ ] Node.js 20.18.1 configurado (`.nvmrc`)
- [ ] pnpm 10.21.0 especificado
- [ ] Supabase configurado
- [ ] CORS configurado correctamente

---

## 🧪 Testing Local

### Test Frontend Build
```bash
pnpm build:frontend
cd apps/frontend
pnpm preview
```

### Test Backend Build
```bash
pnpm build:api
cd apps/api
pnpm start
```

### Test Full Build
```bash
pnpm build
# Verificá que no haya errores de TypeScript
```

---

## 🚨 Troubleshooting

### Error: "Build failed on Vercel"
- Verificá que las variables de entorno estén configuradas
- Revisá los logs de build en Vercel dashboard
- Asegurate que `pnpm build:frontend` funcione localmente

### Error: "Backend health check failed"
- Verificá que Supabase esté accesible
- Revisá las variables de entorno en Render
- Verificá los logs en Render dashboard

### Error: "CORS error"
- Asegurate que `FRONTEND_URL` en el backend apunte a tu dominio de Vercel
- Verificá que `VITE_API_URL` en el frontend apunte a tu dominio de Render

---

## 📊 Monitoreo

### Vercel
- Dashboard: Accede a analytics y logs
- Deploy hooks: Configurá webhooks para notifications
- Preview deployments: Cada PR genera un preview

### Render
- Dashboard: Logs en tiempo real
- Metrics: CPU, Memory, Response time
- Health checks: Automático en `/health`

---

## 🔄 CI/CD Automático

### Push to Main
1. **GitHub** → detecta el push
2. **Vercel** → auto-deploy frontend
3. **Render** → auto-deploy backend
4. **Health checks** → verifican que todo esté OK

### Pull Requests
- Vercel genera preview deployments automáticamente
- Render no despliega PRs (solo main branch)

---

## 📝 Notas Importantes

1. **Monorepo Support**: Ambos servicios están configurados para funcionar con la estructura de monorepo
2. **Build Time**: 
   - Frontend: ~2 minutos
   - Backend: ~3 minutos
3. **Free Tier Limits**:
   - Vercel: 100GB bandwidth/month
   - Render: 750 horas/month (suficiente para 1 servicio 24/7)
4. **Custom Domains**: Ambos servicios permiten dominios custom

---

## 🎉 ¡Listo para Deploy!

El proyecto está completamente configurado. Solo necesitás:
1. Conectar los repos a Vercel y Render
2. Configurar las variables de entorno
3. Presionar "Deploy"

**¡Todo funcionará automáticamente!**
