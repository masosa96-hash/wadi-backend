import { Router } from "express";
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  getSessionRuns,
} from "../controllers/sessionsController";
import { authMiddleware } from "../middleware/auth";
import { sessionCreationLimiter } from "../middleware/rateLimit";

const router = Router();

// All session routes require authentication
router.use(authMiddleware);

// GET /api/projects/:projectId/sessions - List sessions for a project
router.get("/projects/:projectId/sessions", getSessions);

// GET /api/sessions/:id - Get specific session
router.get("/sessions/:id", getSession);

// POST /api/projects/:projectId/sessions - Create new session
router.post("/projects/:projectId/sessions", sessionCreationLimiter, createSession);

// PATCH /api/sessions/:id - Update session
router.patch("/sessions/:id", updateSession);

// DELETE /api/sessions/:id - Delete session
router.delete("/sessions/:id", deleteSession);

// GET /api/sessions/:id/runs - Get runs for a session
router.get("/sessions/:id/runs", getSessionRuns);

export default router;
