import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  uploadFile,
  getFile,
  downloadFile,
  deleteFile,
  getConversationFiles,
} from "../controllers/filesController";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// File upload
router.post("/upload", uploadFile);

// Single file routes
router.get("/files/:fileId", getFile);
router.get("/files/:fileId/download", downloadFile);
router.delete("/files/:fileId", deleteFile);

// Conversation file routes
router.get("/conversation/:conversationId", getConversationFiles);

export default router;
