const express = require('express');
const { getDashboardData, advancedSearch } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Admin route to get dashboard data (including flagged posts/comments)
router.get('/dashboard', authMiddleware, getDashboardData);

// Admin route for advanced search (search posts, comments, or users)
router.get('/search', authMiddleware, advancedSearch);

module.exports = router;
