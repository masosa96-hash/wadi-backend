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
import { checkSupabaseConnection } from "./config/supabase";
import { setupWebSocketServer } from "./services/websocket";
import { generalApiLimiter } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";
import "./services/ai-tools"; // Initialize AI tools

// Validate environment variables before starting
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration
const corsOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
app.get("/health", async (req, res) => {
  const supabaseOk = await checkSupabaseConnection();
  res.json({
    status: "ok",
    supabase: supabaseOk ? "connected" : "disconnected",
  });
});

// API Routes
app.use("/api/projects", projectsRouter);
app.use("/api/projects", runsRouter);
app.use("/api/projects", tasksRouter);
app.use("/api", sessionsRouter);
app.use("/api", tagsRouter);
app.use("/api/shares", sharesRouter);
app.use("/api", memoryRouter);
app.use("/api", invitationsRouter);

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
