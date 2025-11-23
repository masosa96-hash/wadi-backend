"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env");
const env_validator_1 = require("./config/env-validator");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const projects_1 = __importDefault(require("./routes/projects"));
const runs_1 = __importDefault(require("./routes/runs"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const tags_1 = __importDefault(require("./routes/tags"));
const shares_1 = __importDefault(require("./routes/shares"));
const memory_1 = __importDefault(require("./routes/memory"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const invitations_1 = __importDefault(require("./routes/invitations"));
const workspaces_1 = __importDefault(require("./routes/workspaces"));
const billing_1 = __importDefault(require("./routes/billing"));
const presets_1 = __importDefault(require("./routes/presets"));
const files_1 = __importDefault(require("./routes/files"));
const chat_1 = __importDefault(require("./routes/chat"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const templates_1 = __importDefault(require("./routes/templates"));
const search_1 = __importDefault(require("./routes/search"));
const supabase_1 = require("./config/supabase");
const openai_1 = require("./services/openai");
const websocket_1 = require("./services/websocket");
const rateLimit_1 = require("./middleware/rateLimit");
const errorHandler_1 = require("./middleware/errorHandler");
// import "./services/ai-tools"; // Initialize AI tools - TEMPORARILY DISABLED (causes DOMMatrix error)
// Validate environment variables before starting
(0, env_validator_1.validateEnvironment)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// CORS Configuration
app.use((0, cors_1.default)({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173").trim(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id'],
}));
app.use((0, helmet_1.default)({
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
app.use('/api', rateLimit_1.generalApiLimiter);
app.use(express_1.default.json());
// Health check endpoint
app.get(["/health", "/api/health"], async (req, res) => {
    const supabaseOk = await (0, supabase_1.checkSupabaseConnection)();
    const openaiOk = await (0, openai_1.checkOpenAIHealth)();
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
app.use("/api/workspaces", workspaces_1.default);
app.use("/api/billing", billing_1.default);
app.use("/api/presets", presets_1.default);
app.use("/api/files", files_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/projects", runs_1.default);
app.use("/api/projects", tasks_1.default);
app.use("/api", sessions_1.default);
app.use("/api", tags_1.default);
app.use("/api/shares", shares_1.default);
app.use("/api", memory_1.default);
app.use("/api", invitations_1.default);
app.use("/api/chat", chat_1.default);
app.use("/api/favorites", favorites_1.default);
app.use("/api/templates", templates_1.default);
app.use("/api/search", search_1.default);
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Create HTTP server
const server = (0, http_1.createServer)(app);
// Setup WebSocket server
const wss = (0, websocket_1.setupWebSocketServer)(server);
// Start server
server.listen(PORT, () => {
    console.log(`🚀 WADI API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
});
