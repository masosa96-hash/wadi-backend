"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const presetsController_1 = require("../controllers/presetsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All presets routes require authentication
router.use(auth_1.authMiddleware);
// Preset CRUD
router.get("/", presetsController_1.getPresets); // GET /api/presets - List user's presets
router.post("/", presetsController_1.createPreset); // POST /api/presets - Create new preset
router.get("/:id", presetsController_1.getPreset); // GET /api/presets/:id - Get specific preset
router.patch("/:id", presetsController_1.updatePreset); // PATCH /api/presets/:id - Update preset
router.delete("/:id", presetsController_1.deletePreset); // DELETE /api/presets/:id - Delete preset
// Preset Execution
router.post("/:id/execute", presetsController_1.executePreset); // POST /api/presets/:id/execute - Execute preset
exports.default = router;
