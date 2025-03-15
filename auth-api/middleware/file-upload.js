require('dotenv').config();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define Cloudinary Storage for Profile Pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    try {
      if (!req.user || !req.user.id) {
        throw new Error('User ID is required to upload a profile picture');
      }
      const userId = req.user.id; // Get User ID from request

      return {
        folder: `profilePictures/${userId}`,
        public_id: `profile_${userId}`, // Ensures the same file is replaced each time
        allowed_formats: ['jpg', 'jpeg', 'png'],
        overwrite: true, // Forces replacement of old image
      };
    } catch (error) {
      console.error('Error configuring storage:', error);
      throw error;
    }
  },
});
// Middleware for uploading a single profile picture
const uploadProfilePicture = multer({
  storage: profileStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
}).single('profilePicture');
// Middleware for Media Uploads in Posts (Stored in Memory)
const memoryStorage = multer.memoryStorage();
const uploadMedia = multer({ storage: memoryStorage }).array('photos', 5);

module.exports = { uploadProfilePicture, uploadMedia };
