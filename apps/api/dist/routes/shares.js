"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shareLinksController_1 = require("../controllers/shareLinksController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.post("/", auth_1.authMiddleware, rateLimit_1.shareLinkLimiter, shareLinksController_1.createShareLink);
router.get("/", auth_1.authMiddleware, shareLinksController_1.getUserShareLinks);
router.delete("/:id", auth_1.authMiddleware, shareLinksController_1.deleteShareLink);
// Public route (no authentication required)
router.post("/:token", shareLinksController_1.getSharedContent); // POST to allow password in body
exports.default = router;
