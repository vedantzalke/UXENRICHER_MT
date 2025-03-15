const express = require('express');
const { flagPost, flagComment } = require('../controllers/moderationController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Flag post for moderation
router.post('/flagPost/:postId', authMiddleware, flagPost);

// Flag comment for moderation
router.post('/flagComment/:commentId', authMiddleware, flagComment);

module.exports = router;
