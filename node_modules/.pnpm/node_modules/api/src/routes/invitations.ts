import { Router } from "express";
import {
  validateInvitation,
  createInvitation,
  listInvitations,
  deleteInvitation,
  registerWithInvite,
} from "../controllers/invitationsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/invitations/validate/:code", validateInvitation);
router.post("/auth/register-with-invite", registerWithInvite);

// Admin routes (require authentication)
router.post("/admin/invitations", authMiddleware, createInvitation);
router.get("/admin/invitations", authMiddleware, listInvitations);
router.delete("/admin/invitations/:id", authMiddleware, deleteInvitation);

export default router;
