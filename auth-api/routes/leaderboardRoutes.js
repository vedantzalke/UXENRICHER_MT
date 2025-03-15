const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const router = express.Router();

// Get leaderboard based on user activity
router.get('/leaderboard', async (req, res) => {
  try {
    // Get all users sorted by engagement score
    const users = await User.find().sort({ activityScore: -1 }).limit(10);
    res.status(200).json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ error: 'Leaderboard fetch failed', details: err.message });
  }
});

// Get engagement metrics for a product/company (tag1) with sentiment analysis
router.get('/productAnalysis/:tag', async (req, res) => {
  const { tag } = req.params;
  try {
    const posts = await Post.find({ tag1: tag });
    let upvotes = 0;
    let downvotes = 0;
    let commentsCount = 0;
    let positivePosts = 0;
    let negativePosts = 0;
    let neutralPosts = 0;

    // Aggregate engagement metrics and sentiment analysis
    posts.forEach((post) => {
      upvotes += post.upvotes;
      downvotes += post.downvotes;
      commentsCount += post.commentCount;

      // Count sentiment based on post sentiment field
      if (post.sentiment === 'positive') {
        positivePosts += 1;
      } else if (post.sentiment === 'negative') {
        negativePosts += 1;
      } else if (post.sentiment === 'neutral') {
        neutralPosts += 1;
      }
    });

    const totalPosts = posts.length;
    const sentimentAnalysis = {
      positive: (positivePosts / totalPosts) * 100, // Percentage of positive posts
      negative: (negativePosts / totalPosts) * 100, // Percentage of negative posts
      neutral: (neutralPosts / totalPosts) * 100, // Percentage of neutral posts
    };

    res.status(200).json({
      tag,
      upvotes,
      downvotes,
      commentsCount,
      totalPosts,
      sentimentAnalysis, // Sentiment breakdown
      analysis: `We are helping the product/company ${tag} by generating engagement through posts and comments.`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Product analysis failed', details: err.message });
  }
});

module.exports = router;
