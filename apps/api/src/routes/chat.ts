import { Router } from "express";
import {
  sendMessage,
  getConversation,
  getConversations,
  deleteConversation,
  getChatSummary,
} from "../controllers/chatController";
import { authMiddleware } from "../middleware/auth";
import { guestChatLimiter } from "../middleware/rateLimit";

const router = Router();

// All chat routes require authentication (or guest mode)
router.use(authMiddleware);

// POST /api/chat - Send a message and get AI response
// Apply rate limiting for guest users
router.post("/", guestChatLimiter, sendMessage);

// GET /api/chat - Get all conversations
router.get("/", getConversations);

// GET /api/chat/:conversationId - Get specific conversation with messages
router.get("/:conversationId", getConversation);

// DELETE /api/chat/:conversationId - Delete conversation
router.delete("/:conversationId", deleteConversation);

// GET /api/chat/summary - Get chat summary stats
router.get("/summary", getChatSummary);

export default router;
