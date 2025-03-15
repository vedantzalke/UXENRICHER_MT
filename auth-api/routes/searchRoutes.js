const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

const router = express.Router();

// Full-text search for posts, comments, or users
router.get('/search', async (req, res) => {
  const { query, category, tag, sortBy, order } = req.query; // Query for keyword, category, and tag
  
  let searchResults = {
    posts: [],
    comments: [],
    users: [],
  };

  try {
    // Search posts
    searchResults.posts = await Post.find({
      $text: { $search: query },
      ...(category ? { category } : {}),
      ...(tag ? { tag1: tag } : {}),
    }).sort({ [sortBy || 'timestamp']: order || 'desc' });

    // Search comments (similarly)
    searchResults.comments = await Comment.find({
      text: { $regex: query, $options: 'i' },
    });

    // Search users (you can enhance this based on user data)
    searchResults.users = await User.find({
      email: { $regex: query, $options: 'i' },
    });

    res.status(200).json(searchResults);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

module.exports = router;
