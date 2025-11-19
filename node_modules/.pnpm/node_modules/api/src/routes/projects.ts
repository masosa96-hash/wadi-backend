import { Router } from "express";
import { getProjects, createProject } from "../controllers/projectsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All project routes require authentication
router.use(authMiddleware);

// GET /api/projects - List user's projects
router.get("/", getProjects);

// POST /api/projects - Create new project
router.post("/", createProject);

export default router;
