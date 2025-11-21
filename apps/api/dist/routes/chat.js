"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All chat routes require authentication
router.use(auth_1.authMiddleware);
// POST /api/chat - Send a message and get AI response
router.post("/", chatController_1.sendMessage);
// GET /api/chat - Get all conversations
router.get("/", chatController_1.getConversations);
// GET /api/chat/:conversationId - Get specific conversation with messages
router.get("/:conversationId", chatController_1.getConversation);
// DELETE /api/chat/:conversationId - Delete conversation
router.delete("/:conversationId", chatController_1.deleteConversation);
exports.default = router;
