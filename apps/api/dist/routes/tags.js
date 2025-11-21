"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tagsController_1 = require("../controllers/tagsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All tag routes require authentication
router.use(auth_1.authMiddleware);
// Tag CRUD
router.get("/tags", tagsController_1.getTags);
router.post("/tags", tagsController_1.createTag);
router.patch("/tags/:id", tagsController_1.updateTag);
router.delete("/tags/:id", tagsController_1.deleteTag);
// Project tags
router.post("/projects/:id/tags", tagsController_1.addProjectTag);
router.delete("/projects/:id/tags/:tagId", tagsController_1.removeProjectTag);
// Run tags
router.post("/runs/:id/tags", tagsController_1.addRunTag);
router.delete("/runs/:id/tags/:tagId", tagsController_1.removeRunTag);
exports.default = router;
