import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} from '../controllers/favoritesController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/favorites - Get all favorites
router.get('/', getFavorites);

// POST /api/favorites - Add a favorite
router.post('/', addFavorite);

// DELETE /api/favorites/:message_id - Remove a favorite
router.delete('/:message_id', removeFavorite);

// GET /api/favorites/check/:message_id - Check if favorited
router.get('/check/:message_id', checkFavorite);

export default router;
