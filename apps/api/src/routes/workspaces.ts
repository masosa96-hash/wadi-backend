import { Router } from "express";
import {
  getWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  inviteMember,
  updateMember,
  removeMember
} from "../controllers/workspacesController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All workspace routes require authentication
router.use(authMiddleware);

// Workspace CRUD
router.get("/", getWorkspaces); // GET /api/workspaces - List user's workspaces
router.post("/", createWorkspace); // POST /api/workspaces - Create new workspace
router.get("/:id", getWorkspace); // GET /api/workspaces/:id - Get specific workspace
router.patch("/:id", updateWorkspace); // PATCH /api/workspaces/:id - Update workspace
router.delete("/:id", deleteWorkspace); // DELETE /api/workspaces/:id - Delete workspace

// Workspace Members Management
router.get("/:id/members", getWorkspaceMembers); // GET /api/workspaces/:id/members - List members
router.post("/:id/invite", inviteMember); // POST /api/workspaces/:id/invite - Invite member
router.patch("/:id/members/:memberId", updateMember); // PATCH /api/workspaces/:id/members/:memberId - Update member role
router.delete("/:id/members/:memberId", removeMember); // DELETE /api/workspaces/:id/members/:memberId - Remove member

export default router;
