import "./config/env";
import { validateEnvironment } from "./config/env-validator";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import projectsRouter from "./routes/projects";
import runsRouter from "./routes/runs";
import sessionsRouter from "./routes/sessions";
import tagsRouter from "./routes/tags";
import sharesRouter from "./routes/shares";
import memoryRouter from "./routes/memory";
import tasksRouter from "./routes/tasks";
import invitationsRouter from "./routes/invitations";
import workspacesRouter from "./routes/workspaces";
import billingRouter from "./routes/billing";
import presetsRouter from "./routes/presets";
import filesRouter from "./routes/files";
import chatRouter from "./routes/chat";
import favoritesRouter from "./routes/favorites";
import templatesRouter from "./routes/templates";
import searchRouter from "./routes/search";
import { checkSupabaseConnection } from "./config/supabase";
import { checkOpenAIHealth } from "./services/openai";
import { setupWebSocketServer } from "./services/websocket";
import { generalApiLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";
// import "./services/ai-tools"; // Initialize AI tools - TEMPORARILY DISABLED (causes DOMMatrix error)

// Validate environment variables before starting
validateEnvironment();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 4000;

// CORS Configuration
app.use(cors({
  origin: (process.env.FRONTEND_URL || "http://localhost:5173").trim(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id'],
}));

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production"
    ? false // ❗ Necesario en Railway, Vercel, etc.
    : {
      directives: {
        defaultSrc: ["'self'"],
      },
    },
  hsts: process.env.NODE_ENV === "production"
    ? {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    }
    : false
}));

// General API rate limiting
app.use('/api', generalApiLimiter);

app.use(express.json());

// Health check endpoint
app.get(["/health", "/api/health"], async (req, res) => {
  const supabaseOk = await checkSupabaseConnection();
  const openaiOk = await checkOpenAIHealth();

  const allHealthy = supabaseOk && openaiOk;
  const status = allHealthy ? "ok" : "degraded";

  res.status(allHealthy ? 200 : 503).json({
    status,
    supabase: supabaseOk ? "connected" : "disconnected",
    openai: openaiOk ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/workspaces", workspacesRouter);
app.use("/api/billing", billingRouter);
app.use("/api/presets", presetsRouter);
app.use("/api/files", filesRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/projects", runsRouter);
app.use("/api/projects", tasksRouter);
app.use("/api", sessionsRouter);
app.use("/api", tagsRouter);
app.use("/api/shares", sharesRouter);
app.use("/api", memoryRouter);
app.use("/api", invitationsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/templates", templatesRouter);
app.use("/api/search", searchRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
const wss = setupWebSocketServer(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 WADI API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
});

// trigger rebuild 2025-11-23T22:37:55
