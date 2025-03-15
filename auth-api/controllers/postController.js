const Post = require('../models/Post');
const Comment = require('../models/Comment');
const cloudinary = require('cloudinary').v2;
const { checkExplicitContent } = require('../services/moderationService');
const { LanguageServiceClient } = require('@google-cloud/language');
const client = new LanguageServiceClient();
const { postUpvoted, postDownvoted } = require('./notificationController');

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

function validatePostData(data) {
    const { category, title, tag1, tag2, description } = data;
    if (!category || !title || !tag1 || !tag2 || !description) {
        return { valid: false, message: "All fields are required and must be correctly formatted." };
    }
    return { valid: true };
}

async function createPost(req, res) {
    const { category, title, tag1, tag2, description } = req.body;
    const userID = req.user._id;
    const files = Array.isArray(req.files) ? req.files : [];

    // Validate input data
    const validation = validatePostData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.message });
    }

    if (checkExplicitContent(description)) {
      return res.status(506).json({ error: "Explicit content detected in description. Please modify and try again." });
  }

    // Perform sentiment analysis
    const sentiment = await analyzeSentiment(description);
    console.log("Post Sentiment:", sentiment);

    const newPost = new Post({
        userId: userID,
        category: category.toLowerCase(),
        title,
        tag1,
        tag2: Array.isArray(tag2) ? tag2 : tag2.split(',').map(tag => tag.trim()),
        description,
        sentiment,
        photos: [],
        timestamp: new Date().toISOString().split('T')[0] + 'T00:00:00',
    });

    try {
        const savedPost = await newPost.save();
        const uploadedImageUrls = [];

        for (const file of files) {
            try {
                const uploadResult = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: `${userID}/Posts/${savedPost._id}`, resource_type: 'auto' },
                        (error, result) => (error ? reject(error) : resolve(result))
                    ).end(file.buffer);
                });

                // Explicit content check for uploaded images
                const isExplicit = await checkExplicitContent(uploadResult.secure_url);
                if (isExplicit) {
                    return res.status(506).json({ error: "Explicit content detected in uploaded media. Please remove and try again." });
                }

                uploadedImageUrls.push(uploadResult.secure_url);
            } catch (uploadError) {
                console.error("Image Upload Error:", uploadError.message);
            }
        }

        savedPost.photos = uploadedImageUrls;
        await savedPost.save();

        const populatedPost = await savedPost.populate("userId");
        res.status(201).json({ message: 'Post created successfully!', post: populatedPost });

    } catch (error) {
        console.error("Post Creation Error:", error.message);
        res.status(500).json({ error: 'Failed to create post', details: error.message });
    }
}

// Function to get all posts
async function getPosts(req, res) {
  try {
    const posts = await Post.find().populate("userId");
 
    // Add comment count for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ postId: post._id });
        return { ...post.toObject(), commentCount };
      })
    );
 
    res.status(200).json(postsWithComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Function to upvote a post
async function upvotePost(req, res) {
  const postId = req.params.postId;
  const userId = req.user.id;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found!' });
    }
    
      // Look for an existing vote entry for this user
      const voteEntry = post.votes.find(vote => vote.userId.toString() === userId.toString());
  
      if (voteEntry) {
        // If the user already has a nonzero upvote, they cannot upvote again
        if (voteEntry.upvote > 0) {
          return res.status(400).json({ error: "You have already upvoted this post" });
        }
        // If the user had downvoted before, you can allow switching the vote:
        // For example, subtract the old downvote from totalDownvotes and set downvote to 0.
        if (voteEntry.downvote > 0) {
          post.totalDownvotes -= voteEntry.downvote;
          voteEntry.downvote = 0;
        }
        // Now, add the upvote
        voteEntry.upvote = 1; // or any other number if you allow more than 1 vote per user
        post.totalUpvotes += 1;
      } else {
        // No existing vote from this user: create a new vote entry
        post.votes.push({ userId, upvote: 1, downvote: 0 });
        post.totalUpvotes += 1;
      }
      await post.save();
    // Trigger notification for upvoting the post
     await postUpvoted(postId, userId, post.userId.toString()); // Notify post author about the upvote
    res.status(200).json({ message: 'Post upvoted successfully', post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upvote the post', details: err.message });
  }
}
  
// Function to downvote a post
async function downvotePost(req, res) {
  const postId = req.params.postId;
  const userId = req.user.id;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post Not Found!' });
    }
    
    const voteEntry = post.votes.find(vote => vote.userId.toString() === userId.toString());

    if (voteEntry) {
      if (voteEntry.downvote > 0) {
        return res.status(400).json({ error: "You have already downvoted this post" });
      }
      // If the user had upvoted before, remove that vote
      if (voteEntry.upvote > 0) {
        post.totalUpvotes -= voteEntry.upvote;
        voteEntry.upvote = 0;
      }
      // Add the downvote
      voteEntry.downvote = 1; // adjust as needed
      post.totalDownvotes += 1;
    } else {
      // Create a new vote entry for this user
      post.votes.push({ userId, upvote: 0, downvote: 1 });
      post.totalDownvotes += 1;
    }

    await post.save();
    // Trigger notification for downvoting the post
    await postDownvoted(postId, userId, post.userId.toString()); // Notify post author about the downvote

    res.status(200).json({ message: 'Post downvoted successfully', post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to downvote the post', details: err.message });
  }
}

// Function to get all posts created by the other users
async function getUserPosts(req, res) {
  try {
    const posts = await Post.find({ userId: req.params.userId }).populate("userId");
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
}
// Function to get all posts created by the logged-in user
async function getLoggedInUserPosts(req, res) {
  try {
    const posts = await Post.find({ userId: req.user._id });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
}
// Function to edit a post
async function editPost(req, res) {
  const { title, description, category, tag1, tag2 } = req.body;
  
  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.postId, userId: req.user._id },
      { title, description, category, tag1, tag2 },
      { new: true }
    );
    
    if (!updatedPost) {
      return res.status(404).json({ msg: 'Post not found or user not authorized' });
    }
    
    res.status(200).json({ msg: 'Post updated successfully', post: updatedPost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post', details: err.message });
  }
}

// Function to delete a post
async function deletePost(req, res) {
  const { postId } = req.params;
  
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Delete associated comments using postId instead of issueId
    await Comment.deleteMany({ postId: postId });
    
    // Delete the post
    await Post.findByIdAndDelete(postId);
    
    res.status(200).json({ msg: 'Post and associated comments deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post', details: err.message });
  }
}

// Function to flag a post by its postId 
async function flagPostById(req, res) {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Please provide a PostId' });
    }

    // Find the post by id and update the flagged field to true
    const post = await Post.findByIdAndUpdate(
      postId,
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

async function RemoveflagPostById(req, res) {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Please provide a PostId' });
    }

    // Find the post by id and update the flagged field to true
    const post = await Post.findByIdAndUpdate(
      postId,
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

// Get all flagged posts
async function getFlaggedPosts(req, res) {
  try {
    const flaggedPosts = await Post.find({ flagged: true });
    res.status(200).json(flaggedPosts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching flagged posts", error });
  }
};

async function getSentimentByCategory(req, res) {
  try {
    const result = await Post.aggregate([
      // First, group by company and category to count sentiments.
      {
        $group: {
          _id: { company: "$tag1", category: "$category" },
          positive: { $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] } },
        }
      },
      // Then, group by company to push category sentiment data into an array.
      {
        $group: {
          _id: "$_id.company",
          categories: {
            $push: {
              category: "$_id.category",
              positive: "$positive",
              negative: "$negative",
              neutral: "$neutral"
            }
          }
        }
      },
      // Sort by company name (_id).
      { $sort: { _id: 1 } }
    ]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function overallSentimentForAllCompanies(req, res) {
  try {
    const result = await Post.aggregate([
      {
        $group: {
          _id: "$tag1", // Group by company (the first tag)
          positive: { $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] } },
          neutral: { $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSentimentTrends(req, res) {
  try {
    const { company, startDate, endDate } = req.query;
    const pipeline = [];

    // Filter by company if provided and not "All"
    if (company && company !== "All") {
      pipeline.push({ $match: { tag1: company } });
    }

    // Filter by date range if both startDate and endDate are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Include the full day for endDate
      end.setHours(23, 59, 59, 999);
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $gte: [ { $toDate: "$timestamp" }, start ] },
              { $lte: [ { $toDate: "$timestamp" }, end ] }
            ]
          }
        }
      });
    }

    // Group posts by date (formatted as YYYY-MM-DD) and sum up sentiment counts
    pipeline.push(
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $toDate: "$timestamp" }
            }
          },
          positive: {
            $sum: { $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0] }
          },
          negative: {
            $sum: { $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0] }
          },
          neutral: {
            $sum: { $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    );

    const trends = await Post.aggregate(pipeline);
    res.status(200).json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



// async function getCompanyLeaderboard(req, res) {
//   try {
//     const leaderboard = await Post.aggregate([
//       // Group by tag1 (company) and category
//       {
//         $group: {
//           _id: { tag1: "$tag1", category: "$category" }, // Group by company name (tag1) and category
//           totalPosts: { $sum: 1 }, // Count total posts in this group
//           totalUpvotes: { $sum: "$totalUpvotes" }, // Sum upvotes in this group
//           totalComments: { $sum: "$commentCount" } // Sum total comments in this group
//         }
//       },
//       // Group by tag1 (company) to gather all category-level data
//       {
//         $group: {
//           _id: "$_id.tag1", // Group by company name (tag1)
//           totalPostsAllCategories: { $sum: "$totalPosts" }, // Sum posts across all categories
//           totalUpvotesAllCategories: { $sum: "$totalUpvotes" }, // Sum upvotes across all categories
//           totalCommentsAllCategories: { $sum: "$totalComments" }, // Sum comments across all categories
//           categories: {
//             $push: {
//               category: "$_id.category", // Category name
//               analytics: {
//                 totalPosts: "$totalPosts", 
//                 totalUpvotes: "$totalUpvotes", 
//                 totalComments: "$totalComments"
//               }
//             }
//           }
//         }
//       },
//       // Format the output to match the desired structure
//       {
//         $project: {
//           _id: 1, // Retain company name (tag1)
//           totalPostsAllCategories: 1,
//           totalUpvotesAllCategories: 1,
//           totalCommentsAllCategories: 1,
//           categories: { 
//             $arrayToObject: {
//               $map: {
//                 input: "$categories",
//                 as: "category",
//                 in: [
//                   "$$category.category", // Category as the key
//                   "$$category.analytics" // Category analytics as the value
//                 ]
//               }
//             }
//           }
//         }
//       }
//     ]);

//     res.status(200).json(leaderboard);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }
async function getCompanyLeaderboard(req, res) {
  try {
    const { startDate, endDate } = req.query;

    // Convert startDate and endDate to actual Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the full day of endDate

    // Validate if the parsed dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    // Aggregation pipeline
    const leaderboard = await Post.aggregate([
      // Step 1: Convert `timestamp` string to Date object and filter by date range
      {
        $addFields: {
          timestampAsDate: { $toDate: "$timestamp" } // Convert string to Date
        }
      },
      {
        $match: {
          timestampAsDate: { $gte: start, $lte: end } // Filter by actual Date
        }
      },
      // Step 2: Group by tag1 and category
      {
        $group: {
          _id: { tag1: "$tag1", category: "$category" },
          totalPosts: { $sum: 1 },
          totalUpvotes: { $sum: "$totalUpvotes" },
          totalComments: { $sum: "$commentCount" }
        }
      },
      // Step 3: Reformat the result structure
      {
        $group: {
          _id: "$_id.tag1",
          totalPostsAllCategories: { $sum: "$totalPosts" },
          totalUpvotesAllCategories: { $sum: "$totalUpvotes" },
          totalCommentsAllCategories: { $sum: "$totalComments" },
          categories: {
            $push: {
              category: "$_id.category",
              analytics: {
                totalPosts: "$totalPosts",
                totalUpvotes: "$totalUpvotes",
                totalComments: "$totalComments"
              }
            }
          }
        }
      }
    ]);

    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}




async function getPostsByTagAndDate(req, res) {
  try {
    const { tag1, startDate, endDate } = req.query;

    if (!tag1 || !startDate || !endDate) {
      return res.status(400).json({ error: "Please provide tag1, startDate, and endDate" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Ensure full end date coverage

    const posts = await Post.aggregate([
      {
        $match: {
          tag1: tag1
        }
      },
      {
        $addFields: {
          parsedTimestamp: { $dateFromString: { dateString: "$timestamp" } }
        }
      },
      {
        $match: {
          parsedTimestamp: { $gte: start, $lte: end }
        }
      }
    ]);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}





module.exports = { getPosts,overallSentimentForAllCompanies, getCompanyLeaderboard, getPostsByTagAndDate, createPost, upvotePost, downvotePost, editPost, deletePost, getUserPosts, getLoggedInUserPosts, flagPostById, RemoveflagPostById, getFlaggedPosts, getSentimentByCategory, getSentimentTrends };
