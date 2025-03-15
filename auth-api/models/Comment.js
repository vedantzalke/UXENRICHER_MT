const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  // Instead of separate number fields for each vote, we store per-user votes
  votes: { type: [voteSchema], default: [] },
  // Optionally, store overall totals for easier lookup:
  totalUpvotes: { type: Number, default: 0 },
  totalDownvotes: { type: Number, default: 0 },
  repliesCount: { type: Number, default: 0 },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  flagged: { type: Boolean, default: false }
}, { timestamps: true });

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
