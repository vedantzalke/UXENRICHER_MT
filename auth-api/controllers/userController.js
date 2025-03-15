const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const jwt = require('jsonwebtoken');


async function registerUser(req, res) {
  const { email, password, firstName, lastName, university, company, position } = req.body;
  console.log("User",req.body);
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    university: university || null,
    company: company || null,
    position: position || null,
    profilePicture: "https://res.cloudinary.com/dsdaislk7/image/upload/v1740672580/mjtow9y7sj000opncfdg.jpg"
  });
  console.log("Saved User Object", newUser.toObject());

  try {
    await newUser.validate();
    await newUser.save();
    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Send the token in the response
    res.status(201).json({ 
        msg: 'User created successfully', 
        token: token,
        id: newUser._id,
        newUser
    });
  } catch (error) {
    res.status(502).json({ msg: 'Error creating user', error: error.message });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ msg: 'Invalid arguments!' });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'User does not exist' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.cookie('authToken', token, {
    domain: 'localhost',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Ensure secure is true in production
    maxAge: 3600000 // 1 hour
});
  res.status(200).json({ msg: 'Login successful', token, id: user });
}
// Function to get the loggedIn user's profile
async function userProfile(req, res) {
    try {
      const user = req.user; // Use the authenticated user's data
      const posts = await Post.find({ userId: user._id }); // Get posts associated with the user
    
      res.status(200).json({
        user,  // Return user details
        posts, // Return posts created by the user
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
    }
  }

  // Function to edit the user's profile
async function editUserProfile(req, res) {
    try {
      const { firstName, lastName, university, company, position, address, bio, phone } = req.body;

            // Update user profile information
            let updatedUser = await User.findByIdAndUpdate(
              req.user._id, 
              { firstName, lastName, university, company, position, address, bio, phone },
              { new: true }
            );

      if (req.file){
        const profilePicture = `https://res.cloudinary.com/dsdaislk7/image/upload/v1740670110/profilePictures/${req.user._id}/profile_${req.user._id}.png`
      // Update user profile information
       updatedUser = await User.findByIdAndUpdate(
        req.user._id, 
        { firstName, lastName, university, company, position, address, bio, phone, profilePicture },
        { new: true }
      );
      }



      const userDetails = await User.findById(req.user._id);
  
      res.status(200).json({ msg: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Failed to update profile', details: err });
    }
}

async function deleteUser(req, res) {
    const { userId } = req.params;
  
    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      // Delete user-related posts and comments
      await Post.deleteMany({ userId });
      await Comment.deleteMany({ userId });
  
      // Delete the user
      await User.findByIdAndDelete(userId);
  
      res.status(200).json({ msg: 'User and associated data deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user', details: err.message });
    }
  }
// Function to view another user's profile
async function viewOtherUserProfile(req, res) {
    const { userId } = req.params;
  
    try {
      const user = await User.findById(userId); // Fetch the user details
      const posts = await Post.find({ userId: userId }); // Get all posts by the other user
  
      res.status(200).json({
        user,
        posts,
        id: user._id
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
    }
  }





module.exports = { registerUser, loginUser, userProfile, editUserProfile, deleteUser, viewOtherUserProfile };
