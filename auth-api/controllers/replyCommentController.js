const replyComment = require('../models/replyComment');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { newComment, commentUpvoted, commentDownvoted } = require('./notificationController');

const { checkExplicitContent } = require('../services/moderationService');
const { LanguageServiceClient } = require('@google-cloud/language');
const client = new LanguageServiceClient();

async function analyzeSentiment(text) {
    try {
        const document = { content: text, type: 'PLAIN_TEXT' };
        const [result] = await client.analyzeSentiment({ document });
        const sentiment = result.documentSentiment;
  
        if (!sentiment) throw new Error("Sentiment analysis failed.");
  
        return sentiment.score > 0.25 ? 'positive' 
             : sentiment.score < -0.25 ? 'negative' 
             : 'neutral';
    } catch (error) {
        console.error("Sentiment Analysis Error:", error.message);
        return 'neutral';
    }
}

async function createReplyComment(req, res) {
    const { commentId, text } = req.body;
    const userId = req.user._id.toString(); // The user who is adding the comment
    console.log("User ID",req.user._id.toString());

  
    try {
      const comment = await Comment.findById(commentId);
      const postId = comment?.postId; 
      const post = await Post.findById(postId);

  
      if (!postId) {
        return res.status(404).json({ msg: 'Post not found' });
      }

          if (checkExplicitContent(text)) {
            return res.status(506).json({ error: "Explicit content detected in description. Please modify and try again." });
        }
      
          // Perform sentiment analysis
          const sentiment = await analyzeSentiment(text);
          console.log("Post Sentiment:", sentiment);
  
      // Create the new comment
      const newCommentData = new replyComment({
        commentId,
        userId,
        text,
        sentiment
      });
  
      await newCommentData.save();

      // Populate user details
      const populatedComment = await newCommentData.populate("userId");
  
      // Trigger the notification for the post owner when a new comment is added
      await newComment(postId, userId.toString(), post.userId);
  
      res.status(201).json({ msg: 'Comment Reply created successfully', comment: populatedComment });
    } catch (err) {
      res.status(500).json({ msg: 'Failed to create comment reply', error: err.message });
    }
}

async function upvoteReplyComment(req, res) {
    const { replyCommentId } = req.params;
    const userId = req.user._id; // Using consistent user identification
  
    try {
      const comment = await replyComment.findById(replyCommentId);
      if (!comment) {
        return res.status(404).json({ error: "Replied Comment not found" });
      }
      const parentComment = await Comment.findById(comment.commentId);
      if (!parentComment) {
        return res.status(404).json({ error: "Parent Comment not found" });
      }
  
      // Look for an existing vote entry for this user
      const voteEntry = comment.votes.find(vote => vote.userId.toString() === userId.toString());
  
      if (voteEntry) {
        // If the user already has a nonzero upvote, they cannot upvote again
        if (voteEntry.upvote > 0) {
          return res.status(400).json({ error: "You have already upvoted this comment" });
        }
        // If the user had downvoted before, you can allow switching the vote:
        // For example, subtract the old downvote from totalDownvotes and set downvote to 0.
        if (voteEntry.downvote > 0) {
          comment.totalDownvotes -= voteEntry.downvote;
          voteEntry.downvote = 0;
        }
        // Now, add the upvote
        voteEntry.upvote = 1; // or any other number if you allow more than 1 vote per user
        comment.totalUpvotes += 1;
      } else {
        // No existing vote from this user: create a new vote entry
        comment.votes.push({ userId, upvote: 1, downvote: 0 });
        comment.totalUpvotes += 1;
      }
  
      await comment.save();
  
      // Optionally, trigger any notifications if needed:
      await commentUpvoted(replyCommentId, userId, comment.userId.toString(), parentComment.postId);
  
      res.status(200).json({ message: "Comment upvoted successfully", comment });
    } catch (error) {
      res.status(500).json({ error: "Failed to upvote the comment", details: error });
    }
}
  
async function downvoteReplyComment(req, res) {
    const { replyCommentId } = req.params;
    const userId = req.user._id;
  
    try {
      const comment = await replyComment.findById(replyCommentId);
      if (!comment) {
        return res.status(404).json({ error: "Reply Comment not found" });
      }
  
      const parentComment = await Comment.findById(comment.commentId);
      if (!parentComment) {
        return res.status(404).json({ error: "Parent Comment not found" });
      }

      // Look for an existing vote entry for this user
      const voteEntry = comment.votes.find(vote => vote.userId.toString() === userId.toString());
  
      if (voteEntry) {
        if (voteEntry.downvote > 0) {
          return res.status(400).json({ error: "You have already downvoted this comment" });
        }
        // If the user had upvoted before, remove that vote
        if (voteEntry.upvote > 0) {
          comment.totalUpvotes -= voteEntry.upvote;
          voteEntry.upvote = 0;
        }
        // Add the downvote
        voteEntry.downvote = 1; // adjust as needed
        comment.totalDownvotes += 1;
      } else {
        // Create a new vote entry for this user
        comment.votes.push({ userId, upvote: 0, downvote: 1 });
        comment.totalDownvotes += 1;
      }
  
      await comment.save();
  
      // Optionally, trigger any notifications if needed:
      await commentDownvoted(replyCommentId, userId, comment.userId.toString(), parentComment.postId);
  
      res.status(200).json({ message: "Comment downvoted successfully", comment });
    } catch (error) {
      res.status(500).json({ error: "Failed to downvote the comment", details: error.message });
    }
}

async function deleteReplyComment(req, res) {
    const { replyCommentId } = req.params;
  
    try {
      // Check if the comment exists
      const comment = await replyComment.findById(replyCommentId);
      if (!comment) {
        return res.status(404).json({ msg: 'Reply Comment not found' });
      }
  
      // Delete the comment
      await replyComment.findByIdAndDelete(replyCommentId);
  
      res.status(200).json({ msg: 'Comment deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete comment', details: err.message });
    }
}

async function getAllRepliedComments(req, res) {
    // Optionally filter by postId if provided in query parameters
    const { replyCommentId } = req.params;
    try {
      let comments = {};
      if (replyCommentId) {
        // Retrieve comments for the specified post
        console.log("ReplyCommentId", replyCommentId);
        comments = await replyComment.find({ commentId: replyCommentId }).populate("userId");;
      } 
      res.status(200).json({ comments });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve comments', details: err.message });
    }
}

async function flagRepliesById(req, res) {
  try {
    const { replyId } = req.params;

    if (!replyId) {
      return res.status(400).json({ error: 'This is an error!' });
    }

    // Find the post by id and update the flagged field to true
    const replyComment1 = await replyComment.findByIdAndUpdate(
      replyId,
      { flagged: true },
      { new: true } // Return the updated document
    );

    if (!replyComment1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    return res.status(200).json({ message: 'Comment flagged successfully', replyComment1 });
  } catch (error) {
    console.error('Error flagging replied comment:', error);
    return res.status(500).json({ error: 'An error occurred while flagging the post' });
  }
}

async function RemoveflagRepliesById(req, res) {
  try {
    const { replyId } = req.params;

    if (!replyId) {
      return res.status(400).json({ error: 'This is an error!' });
    }

    // Find the post by id and update the flagged field to true
    const replyComment1 = await replyComment.findByIdAndUpdate(
      replyId,
      { flagged: false },
      { new: true } // Return the updated document
    );

    if (!replyComment1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    return res.status(200).json({ message: 'Comment flagged successfully', replyComment1 });
  } catch (error) {
    console.error('Error flagging replied comment:', error);
    return res.status(500).json({ error: 'An error occurred while flagging the post' });
  }
}

async function getFlaggedRepliesComments(req, res) {
  try {
    const flaggedComments = await replyComment.find({ flagged: true });
    res.status(200).json(flaggedComments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching flagged posts", error });
  }
};

module.exports =  {createReplyComment, upvoteReplyComment, downvoteReplyComment, deleteReplyComment, getAllRepliedComments, flagRepliesById, RemoveflagRepliesById, getFlaggedRepliesComments} ;
