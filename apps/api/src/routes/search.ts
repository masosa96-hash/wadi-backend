import { Router } from "express";
import {
  globalSearch,
  getSearchSuggestions,
  getMessageContext,
  getRecentSearches,
} from "../controllers/searchController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All search routes require authentication
router.use(authMiddleware);

// GET /api/search - Global search with filters
router.get("/", globalSearch);

// GET /api/search/suggestions - Get search suggestions
router.get("/suggestions", getSearchSuggestions);

// GET /api/search/context/:messageId - Get message context
router.get("/context/:messageId", getMessageContext);

// GET /api/search/recent - Get recent searches
router.get("/recent", getRecentSearches);

export default router;
