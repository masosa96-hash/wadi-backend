"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const favoritesController_1 = require("../controllers/favoritesController");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/favorites - Get all favorites
router.get('/', favoritesController_1.getFavorites);
// POST /api/favorites - Add a favorite
router.post('/', favoritesController_1.addFavorite);
// DELETE /api/favorites/:message_id - Remove a favorite
router.delete('/:message_id', favoritesController_1.removeFavorite);
// GET /api/favorites/check/:message_id - Check if favorited
router.get('/check/:message_id', favoritesController_1.checkFavorite);
exports.default = router;
