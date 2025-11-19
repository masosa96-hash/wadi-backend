import { Router } from "express";
import { getRuns, createRun, updateRun } from "../controllers/runsController";
import { streamRun } from "../controllers/streamController";
import { authMiddleware } from "../middleware/auth";
import { runCreationLimiter } from "../middleware/rateLimit";

const router = Router();

// All run routes require authentication
router.use(authMiddleware);

// GET /api/projects/:id/runs - List runs for a project
router.get("/:id/runs", getRuns);

// POST /api/projects/:id/runs - Create new run with AI
router.post("/:id/runs", runCreationLimiter, createRun);

// POST /api/projects/:id/runs/stream - Create new run with streaming AI
router.post("/:id/runs/stream", runCreationLimiter, streamRun);

// PATCH /api/runs/:id - Update run (rename, reassign session)
router.patch("/runs/:id", updateRun);

export default router;
