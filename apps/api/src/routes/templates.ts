import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getTemplates, getTemplateById } from '../controllers/templatesController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/templates - Get all templates (optionally filter by category)
router.get('/', getTemplates);

// GET /api/templates/:id - Get a single template
router.get('/:id', getTemplateById);

export default router;
