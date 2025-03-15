const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  university: { type: String },
  company: { type: String },
  position: { type: String },
  phone : {type: String},
  bio: {type: String},
  address: {type: String},
  firstName: { type: String, required: true },
  lastName: { type: String , required: true},
  profilePicture: { type:String },
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }], // Notifications for users
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Posts the user upvoted
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Posts the user downvoted
  activityScore: { type: Number, default: 0 }, // Engagement score to measure activity
  flaggedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  flaggedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

UserSchema.path('university').validate(function (value) {
  return this.university || this.company; // Either university or company should be provided
}, 'Either "university" or "company" must be provided.');

module.exports = mongoose.models.Users || mongoose.model("Users", UserSchema);
