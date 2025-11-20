# WADI Beta - Quick Deployment Guide

## 🚀 Deploy in 30 Minutes

### Step 1: Database Migration (5 min)

Execute these SQL files in your Supabase SQL Editor in order:

```bash
1. docs/database/phase1-workspaces-schema.sql
2. docs/database/phase2-billing-schema.sql
3. docs/database/phase3-presets-schema.sql
4. docs/database/phase5-versioning-schema.sql
5. docs/database/phase6-files-schema.sql
6. docs/database/phase8-admin-schema.sql
```

### Step 2: Install Dependencies (2 min)

```bash
cd apps/api
pnpm install ws @types/ws

# Optional for file parsing:
# pnpm install formidable pdf-parse csv-parser
```

### Step 3: Register Routes (3 min)

Edit `apps/api/src/index.ts`:

```typescript
// Add imports
import presetsRouter from "./routes/presets";
import filesRouter from "./routes/files";
import { createWebSocketServer } from "./services/websocket";

// Add routes
app.use("/api/presets", presetsRouter);
app.use("/api", filesRouter);

// Enable WebSocket
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

createWebSocketServer(server);
```

### Step 4: Create Storage Bucket (1 min)

In Supabase Dashboard → Storage → Create new bucket:
- Name: `project-files`
- Public: No (private)

Or via SQL:
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false);
```

### Step 5: Environment Variables (2 min)

Verify `.env` has:
```env
# Required
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
OPENAI_API_KEY=your_openai_key

# Optional (for Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Step 6: Build & Start (5 min)

```bash
# Backend
cd apps/api
pnpm build
pnpm start

# Frontend
cd apps/frontend
pnpm build
pnpm preview
```

### Step 7: Test Critical Features (10 min)

1. **Auth**: Login/Register
2. **Workspace**: Create workspace, invite member
3. **Billing**: Check credits (should be 50 for free plan)
4. **Run**: Create GPT-3.5 run (costs 1 credit)
5. **WebSocket**: Verify streaming works
6. **Presets**: Create and execute a preset

---

## 📋 Post-Deployment Checklist

- [ ] Database schemas applied
- [ ] All dependencies installed
- [ ] Routes registered
- [ ] Storage bucket created
- [ ] WebSocket server running
- [ ] Environment variables set
- [ ] Auth working
- [ ] Billing tracking credits
- [ ] Real-time streaming working
- [ ] RLS policies active

---

## 🔧 Troubleshooting

### WebSocket not connecting
- Check server is using `http.createServer()` not just Express
- Verify WebSocket server is initialized after HTTP server
- Check browser console for connection errors

### Credits not deducting
- Verify billing_info table has row for user
- Check use_credits() function exists in database
- Verify trigger auto-creates billing_info for new users

### RLS blocking queries
- Check user is authenticated (JWT token valid)
- Verify workspace_members entries exist
- Use Supabase logs to see policy violations

---

## 📊 Monitoring

After deployment, monitor:

1. **WebSocket Connections**: Check for memory leaks
2. **Credit Usage**: Track consumption patterns
3. **API Errors**: Monitor Supabase logs
4. **OpenAI Costs**: Track API usage

---

## 🎯 What's Ready

### Immediately Available (Phases 1-4)
- Multi-tenant workspaces ✅
- Billing & credits ✅
- Prompt presets ✅
- Real-time streaming ✅

### Backend Ready, UI Needed (Phases 5-6)
- Project versioning (backend complete)
- File handling (backend complete)

### Documentation Ready (Phase 7)
- Electron app guide available

### Infrastructure Ready (Phase 8)
- Admin panel (database + functions ready)

---

## ⚡ Quick Start URLs

After deployment:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:4000
- **WebSocket**: ws://localhost:4000
- **Supabase Dashboard**: your_project.supabase.co

---

## 🎉 You're Live!

WADI Beta is now deployed with all core features operational.

**Support**: Check FINAL_COMPLETE_STATUS.md for detailed documentation.
