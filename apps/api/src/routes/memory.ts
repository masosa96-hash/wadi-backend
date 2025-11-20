import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getUserMemory, saveMemory, deleteMemory } from "../controllers/memoryController";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserMemory);
router.post("/", saveMemory);
router.delete("/:memoryId", deleteMemory);

export default router;
