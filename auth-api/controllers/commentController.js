const Comment = require('../models/Comment');
const Post = require('../models/Post'); // Added missing import
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

// Function to create a new comment on a post
async function createComment(req, res) {
    const { postId, text } = req.body;
    const userId = req.user._id.toString(); // The user who is adding the comment
    console.log("User ID",req.user._id.toString());

  
    try {
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }

      if (checkExplicitContent(text)) {
        return res.status(506).json({ error: "Explicit content detected in comment. Please modify and try again." });
    }
  
      // Perform sentiment analysis
      const sentiment = await analyzeSentiment(text);
      console.log("Post Sentiment:", sentiment);
  
      // Create the new comment
      const newCommentData = new Comment({
        postId,
        userId,
        text,
        sentiment
      });


  
      await newCommentData.save();

      // Populate user details
      const populatedComment = await newCommentData.populate("userId");
  
      // Trigger the notification for the post owner when a new comment is added
      await newComment(postId, userId.toString(), post.userId);
  
      res.status(201).json({ msg: 'Comment created successfully', comment: populatedComment });
    } catch (err) {
      res.status(500).json({ msg: 'Failed to create comment', error: err.message });
    }
}

// Function to upvote a comment
  // async function upvoteComment(req, res) {
  //   const { commentId } = req.params;
  //   const userId = req.user.id;
  
  //   try {
  //     const comment = await Comment.findById(commentId);
  //     if (comment.upvotes == 1) {
  //       return res.status(400).json({ error: "You already upvoted this comment" });
  //     }
  //     comment.upvotes = comment.upvotes + 1;

  //     comment.userId = userId;
  //     await comment.save();
  
  //     // Trigger notification for upvoting the comment
  //     await commentUpvoted(commentId, userId, comment.userId, comment.postId); // Notify comment author about the upvote
  
  //     res.status(200).json({ message: "Comment upvoted successfully", comment });
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to upvote the comment", details: error.message });
  //   }
  // }
  async function upvoteComment(req, res) {
    const { commentId } = req.params;
    const userId = req.user._id; // Using consistent user identification
  
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
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
      await commentUpvoted(commentId, userId, comment.userId.toString(), comment.postId);
  
      res.status(200).json({ message: "Comment upvoted successfully", comment });
    } catch (error) {
      res.status(500).json({ error: "Failed to upvote the comment", details: error.message });
    }
  }
  
  
// async function downvoteComment(req, res) {
//   const { commentId } = req.params;
//   const userId = req.user.id;

//   try {
//     const comment = await Comment.findById(commentId);
//     if (comment.downvotes == 1) {
//       return res.status(400).json({ error: "You already downvoted this comment" });
//     }

//     comment.downvotes = comment.downvotes + 1;
//     comment.upvotes = comment.upvotes - 1; // Decrease upvotes by 1
//     await comment.save();

//     // Trigger notification for downvoting the comment
//     await commentDownvoted(commentId, userId, comment.userId, comment.postId); // Notify comment author about the upvote

//     res.status(200).json({ message: "Comment downvoted successfully", comment });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to downvote the comment", details: error.message });
//   }
// }
async function downvoteComment(req, res) {
  const { commentId } = req.params;
  const userId = req.user._id;

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
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
    await commentDownvoted(commentId, userId, comment.userId.toString(), comment.postId);

    res.status(200).json({ message: "Comment downvoted successfully", comment });
  } catch (error) {
    res.status(500).json({ error: "Failed to downvote the comment", details: error.message });
  }
}


async function deleteComment(req, res) {
    const { commentId } = req.params;
  
    try {
      // Check if the comment exists
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }
  
      // Delete the comment
      await Comment.findByIdAndDelete(commentId);
  
      res.status(200).json({ msg: 'Comment deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete comment', details: err.message });
    }
  }


  async function getAllComments(req, res) {
    // Optionally filter by postId if provided in query parameters
    const { postId } = req.query;
    try {
      let comments;
      if (postId) {
        // Retrieve comments for the specified post
        comments = await Comment.find({ postId }).populate("userId");
      } else {
        // Retrieve all comments
        comments = await Comment.find().populate("userId");
      }
      res.status(200).json({ comments });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve comments', details: err.message });
    }
  }

// Function to flag a post by its postId 
async function flagCommentById(req, res) {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ error: 'Please provide a PostId' });
    }

    // Find the post by id and update the flagged field to true
    const post = await Comment.findByIdAndUpdate(
      commentId,
      { flagged: true },
      { new: true } // Return the updated document
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({ message: 'Post flagged successfully', post });
  } catch (error) {
    console.error('Error flagging post:', error);
    return res.status(500).json({ error: 'An error occurred while flagging the post' });
  }
}

async function RemoveflagCommentById(req, res) {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ error: 'Please provide a PostId' });
    }

    // Find the post by id and update the flagged field to true
    const post = await Comment.findByIdAndUpdate(
      commentId,
      { flagged: false },
      { new: true } // Return the updated document
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({ message: 'Post flagged successfully', post });
  } catch (error) {
    console.error('Error flagging post:', error);
    return res.status(500).json({ error: 'An error occurred while flagging the post' });
  }
}

async function getFlaggedComments(req, res) {
  try {
    const flaggedComments = await Comment.find({ flagged: true });
    res.status(200).json(flaggedComments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching flagged posts", error });
  }
};
  

module.exports = { createComment, upvoteComment, downvoteComment, deleteComment, getAllComments, flagCommentById, RemoveflagCommentById, getFlaggedComments };
