const express = require('express');
const updatePasswordAndSendEmail = require('../testMail'); // Import the function to send the new password
const User = require('../models/User');
const router = express.Router();

// Route to request a password reset (forgot password)
router.post('/resetPassword', async (req, res) => {
  const { email } = req.body;

  // Validate email format
  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User with this email does not exist' });
    }

    // Generate a new password and send it via email
    await updatePasswordAndSendEmail(email);

    res.status(200).json({ msg: 'A new password has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password', details: err.message });
  }
});

module.exports = router;
