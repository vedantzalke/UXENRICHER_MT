const Post = require('../models/Post');
const Comment = require('../models/Comment');

// Function to flag a post for moderation
async function flagPost(req, res) {
  try {
    const post = await Post.findById(req.params.postId);
    post.flagged = true;
    await post.save();
    res.status(200).json({ message: 'Post flagged successfully for moderation' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag post', details: err.message });
  }
}

// Function to flag a comment for moderation
async function flagComment(req, res) {
  try {
    const comment = await Comment.findById(req.params.commentId);
    comment.flagged = true;
    await comment.save();
    res.status(200).json({ message: 'Comment flagged successfully for moderation' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to flag comment', details: err.message });
  }
}

module.exports = { flagPost, flagComment };
