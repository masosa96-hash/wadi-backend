"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_1 = require("../controllers/searchController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All search routes require authentication
router.use(auth_1.authMiddleware);
// GET /api/search - Global search with filters
router.get("/", searchController_1.globalSearch);
// GET /api/search/suggestions - Get search suggestions
router.get("/suggestions", searchController_1.getSearchSuggestions);
// GET /api/search/context/:messageId - Get message context
router.get("/context/:messageId", searchController_1.getMessageContext);
// GET /api/search/recent - Get recent searches
router.get("/recent", searchController_1.getRecentSearches);
exports.default = router;
