"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invitationsController_1 = require("../controllers/invitationsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/invitations/validate/:code", invitationsController_1.validateInvitation);
router.post("/auth/register-with-invite", invitationsController_1.registerWithInvite);
// Admin routes (require authentication)
router.post("/admin/invitations", auth_1.authMiddleware, invitationsController_1.createInvitation);
router.get("/admin/invitations", auth_1.authMiddleware, invitationsController_1.listInvitations);
router.delete("/admin/invitations/:id", auth_1.authMiddleware, invitationsController_1.deleteInvitation);
exports.default = router;
