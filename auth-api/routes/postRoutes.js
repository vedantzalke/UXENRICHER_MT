const express = require('express');
const { getPosts, upvotePost, getPostsByTagAndDate, downvotePost,overallSentimentForAllCompanies, createPost, editPost, deletePost, getUserPosts, getLoggedInUserPosts, flagPostById, RemoveflagPostById, getFlaggedPosts, getSentimentByCategory, getSentimentTrends, getCompanyLeaderboard } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMedia } = require('../middleware/file-upload');

const router = express.Router();


// GET route for fetching posts
router.get('/allPosts', authMiddleware, getPosts); 

// POST route for creating a post (with file upload)
router.post('/createPost', authMiddleware, uploadMedia, createPost);

// export GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Admin\Documents\MT copy\MT copy\auth-api\uxenricher-ec88da3834b4.json"

// Routes for upvoting and downvoting a post
router.post('/upvote/:postId', authMiddleware, upvotePost);
router.post('/downvote/:postId', authMiddleware, downvotePost);

// PUT route for editing a post
router.put('/:postId', authMiddleware, editPost);

//GET OTHER USER POSTS
router.get('/userPosts/:userId', getUserPosts);

//GET MY OWN POSTS
router.get('/myPosts', authMiddleware, getLoggedInUserPosts);

// DELETE route for deleting a post
router.delete('/:postId', authMiddleware, deletePost);

//FLAG A POSTE
router.get('/flag-post/:postId', authMiddleware, flagPostById)

router.get('/remove-flag-post/:postId', authMiddleware, RemoveflagPostById)

router.get("/get-flagged-posts", authMiddleware, getFlaggedPosts)

router.get("/getSentimentByCategory", authMiddleware, getSentimentByCategory)

router.get("/overallSentimentForAllCompanies", authMiddleware, overallSentimentForAllCompanies)

router.get("/getSentimentTrends", authMiddleware, getSentimentTrends)

router.get("/getCompanyLeaderboard", authMiddleware, getCompanyLeaderboard)

router.get("/getPostsByTagAndDate", authMiddleware, getPostsByTagAndDate)

module.exports = router;
