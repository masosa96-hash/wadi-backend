import { Router } from "express";
import {
  getBillingInfo,
  getCreditHistory,
  useCredits,
  purchaseCredits,
  updatePlan,
} from "../controllers/billingController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All billing routes require authentication
router.use(authMiddleware);

// Billing Info
router.get("/", getBillingInfo); // GET /api/billing - Get user billing info
router.get("/history", getCreditHistory); // GET /api/billing/history - Get credit usage history

// Credit Management
router.post("/use", useCredits); // POST /api/billing/use - Deduct credits
router.post("/purchase", purchaseCredits); // POST /api/billing/purchase - Add credits

// Plan Management
router.patch("/plan", updatePlan); // PATCH /api/billing/plan - Update subscription plan

export default router;
