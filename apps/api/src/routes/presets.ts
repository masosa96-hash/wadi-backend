import { Router } from "express";
import {
  getPresets,
  createPreset,
  getPreset,
  updatePreset,
  deletePreset,
  executePreset,
} from "../controllers/presetsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All presets routes require authentication
router.use(authMiddleware);

// Preset CRUD
router.get("/", getPresets); // GET /api/presets - List user's presets
router.post("/", createPreset); // POST /api/presets - Create new preset
router.get("/:id", getPreset); // GET /api/presets/:id - Get specific preset
router.patch("/:id", updatePreset); // PATCH /api/presets/:id - Update preset
router.delete("/:id", deletePreset); // DELETE /api/presets/:id - Delete preset

// Preset Execution
router.post("/:id/execute", executePreset); // POST /api/presets/:id/execute - Execute preset

export default router;
