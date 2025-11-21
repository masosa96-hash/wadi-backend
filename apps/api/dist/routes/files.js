"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const filesController_1 = require("../controllers/filesController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// File upload
router.post("/upload", filesController_1.uploadFile);
// Single file routes
router.get("/files/:fileId", filesController_1.getFile);
router.get("/files/:fileId/download", filesController_1.downloadFile);
router.delete("/files/:fileId", filesController_1.deleteFile);
// Conversation file routes
router.get("/conversation/:conversationId", filesController_1.getConversationFiles);
exports.default = router;
