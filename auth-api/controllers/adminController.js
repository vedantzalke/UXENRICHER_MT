const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');

// Advanced search functionality (for posts, users, and comments)
async function advancedSearch(req, res) {
  const { query, type, sortBy, order } = req.query; // Query, type (post/user/comment), and sorting options

  try {
    let results = [];

    // Search for posts
    if (type === 'post' || !type) {
      const posts = await Post.find({
        $text: { $search: query }
      }).sort({ [sortBy || 'timestamp']: order || 'desc' });

      results.push({ posts });
    }

    // Search for comments
    if (type === 'comment' || !type) {
      const comments = await Comment.find({
        text: { $regex: query, $options: 'i' }
      }).sort({ [sortBy || 'createdAt']: order || 'desc' });

      results.push({ comments });
    }

    // Search for users
    if (type === 'user' || !type) {
      const users = await User.find({
        email: { $regex: query, $options: 'i' }
      }).sort({ [sortBy || 'email']: order || 'asc' });

      results.push({ users });
    }

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
}

// Function to calculate Product Sentiment Score
async function calculateProductSentiment(tag) {
    const posts = await Post.find({ tag1: tag });
    let sentimentScore = 0;
    let totalPosts = posts.length;
  
    posts.forEach(post => {
      if (post.sentiment === 'positive') {
        sentimentScore += 1;
      } else if (post.sentiment === 'negative') {
        sentimentScore -= 1;
      }
    });
  
    const sentimentPercentage = (sentimentScore / totalPosts) * 100;
    return sentimentPercentage;  // Return the percentage of positive sentiment
  }
  
  // Function to get dashboard metrics
  async function getDashboardData(req, res) {
    try {
      // Get all posts and comments for review
      const flaggedPosts = await Post.find({ flagged: true });
      const flaggedComments = await Comment.find({ flagged: true });
  
      const totalPosts = await Post.countDocuments();
      const totalComments = await Comment.countDocuments();
      const totalUsers = await User.countDocuments();
  
      // Get product sentiment score for a specific product (tag)
      const sentimentScore = await calculateProductSentiment('ProductXYZ'); // Example for a product
  
      res.status(200).json({
        totalPosts,
        totalComments,
        totalUsers,
        sentimentScore,  // Sentiment score for the product
        flaggedPosts,    // Flagged posts for review
        flaggedComments, // Flagged comments for review
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
    }
  }

module.exports = { getDashboardData, advancedSearch };
