import { Router } from 'express';
import { deleteUserAccount } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes
router.delete('/delete-account', authMiddleware, deleteUserAccount);

export default router;
