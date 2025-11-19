import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
} from "../controllers/tasksController";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all tasks for a project
router.get("/:projectId/tasks", getProjectTasks);

// Create a new task
router.post("/:projectId/tasks", createTask);

// Get a single task
router.get("/tasks/:taskId", getTask);

// Update a task
router.patch("/tasks/:taskId", updateTask);

// Delete a task
router.delete("/tasks/:taskId", deleteTask);

export default router;
