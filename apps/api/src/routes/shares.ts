import { Router } from "express";
import {
  createShareLink,
  getUserShareLinks,
  getSharedContent,
  deleteShareLink,
} from "../controllers/shareLinksController";
import { authMiddleware } from "../middleware/auth";
import { shareLinkLimiter } from "../middleware/rateLimit";

const router = Router();

// Protected routes (require authentication)
router.post("/", authMiddleware, shareLinkLimiter, createShareLink);
router.get("/", authMiddleware, getUserShareLinks);
router.delete("/:id", authMiddleware, deleteShareLink);

// Public route (no authentication required)
router.post("/:token", getSharedContent); // POST to allow password in body

export default router;
