const express = require('express');
const { registerUser, loginUser, userProfile, deleteUser, editUserProfile,viewOtherUserProfile } = require('../controllers/userController');
const { getAllNotifications } = require('../controllers/notificationController');

const authMiddleware = require('../middleware/authMiddleware');
const { uploadProfilePicture } = require('../middleware/file-upload');

const router = express.Router();

router.post('/signup', registerUser); // Register user
router.post('/login', loginUser); // Login user
router.get('/me', authMiddleware, userProfile); // Get user profile
router.put('/me', authMiddleware,uploadProfilePicture, editUserProfile); // Edit user profile
router.delete('/me', authMiddleware, deleteUser); // Delete user
router.get('/not', authMiddleware, getAllNotifications);//Notification Route
router.get('/:userId', authMiddleware, viewOtherUserProfile); // Get another user's profile


module.exports = router;
