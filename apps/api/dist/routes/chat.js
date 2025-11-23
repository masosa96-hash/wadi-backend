"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
// All chat routes require authentication (or guest mode)
router.use(auth_1.authMiddleware);
// POST /api/chat - Send a message and get AI response
// Apply rate limiting for guest users
router.post("/", rateLimit_1.guestChatLimiter, chatController_1.sendMessage);
// GET /api/chat - Get all conversations
router.get("/", chatController_1.getConversations);
// GET /api/chat/:conversationId - Get specific conversation with messages
router.get("/:conversationId", chatController_1.getConversation);
// DELETE /api/chat/:conversationId - Delete conversation
router.delete("/:conversationId", chatController_1.deleteConversation);
// GET /api/chat/summary - Get chat summary stats
router.get("/summary", chatController_1.getChatSummary);
exports.default = router;
