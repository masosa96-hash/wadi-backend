"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const runsController_1 = require("../controllers/runsController");
const streamController_1 = require("../controllers/streamController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
// All run routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/projects/:id/runs - List runs for a project
router.get("/:id/runs", runsController_1.getRuns);
// POST /api/projects/:id/runs - Create new run with AI
router.post("/:id/runs", rateLimit_1.runCreationLimiter, runsController_1.createRun);
// POST /api/projects/:id/runs/stream - Create new run with streaming AI
router.post("/:id/runs/stream", rateLimit_1.runCreationLimiter, streamController_1.streamRun);
// PATCH /api/runs/:id - Update run (rename, reassign session)
router.patch("/runs/:id", runsController_1.updateRun);
exports.default = router;
