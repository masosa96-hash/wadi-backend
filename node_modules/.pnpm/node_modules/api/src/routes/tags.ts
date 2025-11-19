import { Router } from "express";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  addProjectTag,
  removeProjectTag,
  addRunTag,
  removeRunTag,
} from "../controllers/tagsController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All tag routes require authentication
router.use(authMiddleware);

// Tag CRUD
router.get("/tags", getTags);
router.post("/tags", createTag);
router.patch("/tags/:id", updateTag);
router.delete("/tags/:id", deleteTag);

// Project tags
router.post("/projects/:id/tags", addProjectTag);
router.delete("/projects/:id/tags/:tagId", removeProjectTag);

// Run tags
router.post("/runs/:id/tags", addRunTag);
router.delete("/runs/:id/tags/:tagId", removeRunTag);

export default router;
