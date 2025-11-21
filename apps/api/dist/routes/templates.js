"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const templatesController_1 = require("../controllers/templatesController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/templates - Get all templates (optionally filter by category)
router.get('/', templatesController_1.getTemplates);
// GET /api/templates/:id - Get a single template
router.get('/:id', templatesController_1.getTemplateById);
exports.default = router;
