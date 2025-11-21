"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const tasksController_1 = require("../controllers/tasksController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// Get all tasks for a project
router.get("/:projectId/tasks", tasksController_1.getProjectTasks);
// Create a new task
router.post("/:projectId/tasks", tasksController_1.createTask);
// Get a single task
router.get("/tasks/:taskId", tasksController_1.getTask);
// Update a task
router.patch("/tasks/:taskId", tasksController_1.updateTask);
// Delete a task
router.delete("/tasks/:taskId", tasksController_1.deleteTask);
exports.default = router;
