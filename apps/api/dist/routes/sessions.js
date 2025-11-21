"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionsController_1 = require("../controllers/sessionsController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
// All session routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/projects/:projectId/sessions - List sessions for a project
router.get("/projects/:projectId/sessions", sessionsController_1.getSessions);
// GET /api/sessions/:id - Get specific session
router.get("/sessions/:id", sessionsController_1.getSession);
// POST /api/projects/:projectId/sessions - Create new session
router.post("/projects/:projectId/sessions", rateLimit_1.sessionCreationLimiter, sessionsController_1.createSession);
// PATCH /api/sessions/:id - Update session
router.patch("/sessions/:id", sessionsController_1.updateSession);
// DELETE /api/sessions/:id - Delete session
router.delete("/sessions/:id", sessionsController_1.deleteSession);
// GET /api/sessions/:id/runs - Get runs for a session
router.get("/sessions/:id/runs", sessionsController_1.getSessionRuns);
exports.default = router;
