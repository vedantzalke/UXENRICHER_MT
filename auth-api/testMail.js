require("dotenv").config();
const axios = require("axios");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Connect to MongoDB
//mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define User schema and model
const userSchema2 = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Check if the model already exists before defining it
const User = mongoose.models.User || mongoose.model("User", userSchema2);

// Function to generate a random password
const generateRandomPassword = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Function to update password in MongoDB and send email
const updatePasswordAndSendEmail = async (recipientEmail) => {
  const randomPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(randomPassword, 10); // Hash the password

  try {
    // Update password in MongoDB
    await User.findOneAndUpdate(
      { email: recipientEmail },
      { password: hashedPassword }
    );

    // Send the email with the new password
    const response = await axios.post(
      "https://api.smtp2go.com/v3/email/send",
      {
        api_key: process.env.SMTP2GO_API_KEY,
        to: [recipientEmail],
        sender: "vedant.zalke@stud.hochschule-heidelberg.de", // Must be a verified sender in SMTP2GO
        subject: "Your New Password",
        text_body: `Your new password is: ${randomPassword}`,
        html_body: `<p>Your new password is: <strong>${randomPassword}</strong></p>`,
      }
    );

    console.log("Password updated and email sent successfully:", response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
};

// Export the function
module.exports = updatePasswordAndSendEmail;
