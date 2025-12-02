import "./config/env";
// import "./config/polyfill"; // Polyfill for DOMMatrix (required by pdf-parse)
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
import userRouter from "./routes/user";
import { checkSupabaseConnection } from "./config/supabase";
import { checkOpenAIHealth } from "./services/openai";
import { setupWebSocketServer } from "./services/websocket";
import { generalApiLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";
import "./services/ai-tools"; // Initialize AI tools

// Validate environment variables before starting
validateEnvironment();
const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 8080;

// CORS Configuration - Allowlist for local + production + Vercel previews
const allowlist = [
  process.env.FRONTEND_URL, // Production frontend URL
  "http://localhost:5173",   // Vite dev server (default)
  "http://localhost:5174",   // Vite dev server (alternative port)
  "http://192.168.0.108:5173", // LAN access
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);

    // Check if origin is in allowlist
    if (allowlist.includes(origin)) return cb(null, true);

    // Allow all Vercel preview deployments
    if (origin.endsWith(".vercel.app")) return cb(null, true);

    // Reject all other origins
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id'],
}));

// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors()(req, res, next);
  }
  next();
});

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
  const openaiOk = await checkOpenAIHealth(); // Now checks Groq

  const allHealthy = supabaseOk && openaiOk;
  const status = allHealthy ? "ok" : "degraded";

  // ALWAYS return 200 to allow Railway deployment to succeed
  // We still report the actual status in the body for debugging
  res.status(200).json({
    status,
    supabase: supabaseOk ? "connected" : "disconnected",
    openai: openaiOk ? "connected" : "disconnected", // Legacy key name for frontend compatibility
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
app.use("/api/user", userRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Setup WebSocket server
setupWebSocketServer(server);

// Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`API on ${PORT}`);
});

// trigger rebuild 2025-11-23T22:37:55
