const mongoose = require('mongoose');
const User = require('./User');
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who will receive the notification
  actionUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who performed the action
  type: { type: String, enum: ['postUpvoted', 'postDownvoted', 'commentUpvoted', 'commentDownvoted', 'newComment'], required: true },
  message: { type: String, required: true }, // Custom message describing the action
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }, // Post or comment associated with the notification
  timestamp: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
