"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billingController_1 = require("../controllers/billingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All billing routes require authentication
router.use(auth_1.authMiddleware);
// Billing Info
router.get("/", billingController_1.getBillingInfo); // GET /api/billing - Get user billing info
router.get("/history", billingController_1.getCreditHistory); // GET /api/billing/history - Get credit usage history
// Credit Management
router.post("/use", billingController_1.useCredits); // POST /api/billing/use - Deduct credits
router.post("/purchase", billingController_1.purchaseCredits); // POST /api/billing/purchase - Add credits
// Plan Management
router.patch("/plan", billingController_1.updatePlan); // PATCH /api/billing/plan - Update subscription plan
exports.default = router;
