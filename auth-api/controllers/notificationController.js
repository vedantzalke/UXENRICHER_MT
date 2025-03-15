const Notification = require('../models/Notification');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
// Helper function to create a notification
async function createNotification(userId, actionUserId, type, message, postId) {
    const notification = new Notification({
      userId,
      actionUserId,
      type,
      message,
      postId
    });
 
    await notification.save();
  }
 
  // Example function when a new comment is made on a post
  async function newComment(postId, actionUserId, postOwnerId) {
    const actionUser = await User.findById(actionUserId);
    const message = `${actionUser.get('firstName')} ${actionUser.get('lastName')} commented on your post.`;
   
    await createNotification(postOwnerId, actionUserId, 'newComment', message, postId);
  }
 
  async function commentUpvoted(commentId, userId, actionUserId, postId) {
    console.log("Action ID",actionUserId)
    const actionUser = await User.findById(userId);
    const message = `${actionUser.get('firstName')} ${actionUser.get('lastName')} upvoted your comment.`;
   
    await createNotification(userId, actionUserId, 'commentUpvoted', message, postId);
  }
 
  async function commentDownvoted(commentId, userId, actionUserId, postId) {
    const actionUser = await User.findById(userId);
    const message = `${actionUser.get('firstName')} ${actionUser.get('lastName')} downvoted your comment.`;
   
    await createNotification(userId, actionUserId, 'commentDownvoted', message, postId);
  }
 
 
// Example: Function to send notification when a post is upvoted
async function postUpvoted(postId, userId, actionUserId) {
  // const message = `Your post was upvoted!`;
  const actionUser = await User.findById(userId);
  const message = `${actionUser.get('firstName')} ${actionUser.get('lastName')} upvoted your post.`;
  await createNotification(userId, actionUserId, 'postUpvoted', message, postId);
}
 
// Example: Function to send notification when a post is downvoted
async function postDownvoted(postId, userId, actionUserId) {
  // const message = `Your post was downvoted!`;
  const actionUser = await User.findById(userId);
  const message = `${actionUser.get('firstName')} ${actionUser.get('lastName')} downvoted your post.`;
  await createNotification(userId, actionUserId, 'postDownvoted', message, postId);
}
 
async function getAllNotifications(req, res) {
  if(req.user){
    console.log("UserId", req.user._id)
    let notifications = await Notification.find({userId: req.user._id}).populate("userId");
    res.status(200).json({ notifications });
  }else{
      res.status(500).json("Invalid!");
  }
}
 
 
module.exports = { createNotification, postUpvoted, newComment,postDownvoted, commentUpvoted, commentDownvoted, getAllNotifications };