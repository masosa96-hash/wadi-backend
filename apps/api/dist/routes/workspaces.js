"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workspacesController_1 = require("../controllers/workspacesController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All workspace routes require authentication
router.use(auth_1.authMiddleware);
// Workspace CRUD
router.get("/", workspacesController_1.getWorkspaces); // GET /api/workspaces - List user's workspaces
router.post("/", workspacesController_1.createWorkspace); // POST /api/workspaces - Create new workspace
router.get("/:id", workspacesController_1.getWorkspace); // GET /api/workspaces/:id - Get specific workspace
router.patch("/:id", workspacesController_1.updateWorkspace); // PATCH /api/workspaces/:id - Update workspace
router.delete("/:id", workspacesController_1.deleteWorkspace); // DELETE /api/workspaces/:id - Delete workspace
// Workspace Members Management
router.get("/:id/members", workspacesController_1.getWorkspaceMembers); // GET /api/workspaces/:id/members - List members
router.post("/:id/invite", workspacesController_1.inviteMember); // POST /api/workspaces/:id/invite - Invite member
router.patch("/:id/members/:memberId", workspacesController_1.updateMember); // PATCH /api/workspaces/:id/members/:memberId - Update member role
router.delete("/:id/members/:memberId", workspacesController_1.removeMember); // DELETE /api/workspaces/:id/members/:memberId - Remove member
exports.default = router;
