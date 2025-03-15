const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  upvote: { type: Number, default: 0 },
  downvote: { type: Number, default: 0 }
}, { _id: false });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Added to track post creator
  category: { 
    type: String, 
    enum: ["issues", "bothers", "recommend", "feedback", "suggestion"],
    required: true 
  },
  title: { type: String, index: 'text' },
  tag1: String,
  tag2: [String],
  description: { type: String, index: 'text' },
  photos: [String],
  timestamp: { type: Date, default: Date.now },
  // Instead of separate number fields for each vote, we store per-user votes
  votes: { type: [voteSchema], default: [] },
  // Optionally, store overall totals for easier lookup:
  totalUpvotes: { type: Number, default: 0 },
  totalDownvotes: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  engagementScore: { type: Number, default: 0 }, // Can be calculated based on comments and upvotes
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  flagged: { type: Boolean, default: false } // Flagging field for moderation
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
