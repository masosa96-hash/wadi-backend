"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectsController_1 = require("../controllers/projectsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All project routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/projects - List user's projects
router.get("/", projectsController_1.getProjects);
// POST /api/projects - Create new project
router.post("/", projectsController_1.createProject);
// GET /api/projects/:id - Get specific project
router.get("/:id", projectsController_1.getProject);
exports.default = router;
