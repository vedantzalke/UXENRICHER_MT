// Example of calculating most active user based on engagement (comments frequency and replies)
async function getMostActiveUser(postId) {
    const post = await Post.findById(postId).populate('comments');
    let maxActivity = 0;
    let mostActiveUser = null;
  
    post.comments.forEach(comment => {
      const activity = comment.repliesCount + comment.upvotes.length; // Example metric
      if (activity > maxActivity) {
        maxActivity = activity;
        mostActiveUser = comment.userId;
      }
    });
  
    return mostActiveUser;
  }
  