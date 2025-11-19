import { Router } from "express";
import {
  getProjectMemory,
  generateProjectMemory,
  deleteProjectMemory,
} from "../controllers/memoryController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/projects/:id/memory", authMiddleware, getProjectMemory);
router.post("/projects/:id/memory/generate", authMiddleware, generateProjectMemory);
router.delete("/projects/:id/memory", authMiddleware, deleteProjectMemory);

export default router;
