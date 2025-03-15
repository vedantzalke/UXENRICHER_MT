// src/components/Comments.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaArrowUp,
  FaArrowDown,
  FaFlag,
  FaPlay,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import "../styles/Comments.css";
import { useSelector } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);
  const [replyVisibility, setReplyVisibility] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  // Keep track of flagged items so that a user can only flag once per item.
  const [flaggedItems, setFlaggedItems] = useState({});

const currentUser = useSelector((state) => state.user.user);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/comments/allComments?postId=${postId}`,
        { withCredentials: true }
      );
      setComments(res.data.comments);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to fetch comments");
    }
  };
  

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/comments/create`,
        { postId, text: newComment },
        { withCredentials: true }
      );
      toast.success("Comment added successfully");
      setNewComment("");
      fetchComments();
    } catch (error) {
      if (error.response?.status === 506) {
        toast.error("Abusive content detected");
      } else {
        console.error("Failed to create comment:", error);
        toast.error("Failed to create comment");
      }
    }
  };

  const handleUpvote = async (commentId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/comments/upvote/${commentId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Comment upvoted successfully");
      fetchComments();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "Failed to upvote comment";
      toast.error(message);
    }
  };

  const handleDownvote = async (commentId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/comments/downvote/${commentId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Comment downvoted successfully");
      fetchComments();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "Failed to downvote comment";
      toast.error(message);
    }
  };

  const handleFlagComment = async (commentId) => {
    // Prevent flagging if already flagged by the user
    if (flaggedItems[commentId]) return;

    try {
      await axios.post(
        `${API_BASE_URL}/comments/flag-comment/${commentId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Comment reported successfully");
      setFlaggedItems((prev) => ({ ...prev, [commentId]: true }));
    } catch (error) {
      if (error.response?.status === 506) {
        toast.error("Abusive content detected");
      } else {
        toast.error("Failed to report comment");
      }
    }
  };

  const handleCreateReply = async (commentId) => {
    const replyText = replyInputs[commentId];
    if (!replyText || !replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/comments/replyComment`,
        { commentId, text: replyText },
        { withCredentials: true }
      );
      toast.success("Reply added successfully");
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
      setReplyVisibility((prev) => ({ ...prev, [commentId]: false }));
      fetchComments();
    } catch (error) {
      if (error.response?.status === 506) {
        toast.error("Abusive content detected");
      } else {
        console.error("Failed to add reply:", error);
        toast.error("Failed to add reply");
      }
    }
  };

  const toggleReplySection = async (commentId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/comments/allReplyComments/${commentId}`,
        { withCredentials: true }
      );
      const fetchedReplies = res.data.comments;
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? { ...comment, replies: fetchedReplies }
            : comment
        )
      );
      setReplyVisibility((prev) => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    } catch (error) {
      console.error("Failed to fetch replies:", error);
      toast.error("Failed to fetch replies");
    }
  };

  // --- Reply-specific actions ---
  const handleUpvoteReply = async (replyId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/comments/replyUpvote/${replyId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Reply upvoted successfully");
      fetchComments();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "Failed to upvote reply";
      toast.error(message);
    }
  };

  const handleDownvoteReply = async (replyId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/comments/replyDownvote/${replyId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Reply downvoted successfully");
      fetchComments();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "Failed to downvote reply";
      toast.error(message);
    }
  };

  const handleFlagReply = async (replyId) => {
    if (flaggedItems[replyId]) return;
    try {
      await axios.get(
        `${API_BASE_URL}/comments/flag-reply/${replyId}`,
        { withCredentials: true }
      );
      toast.success("Reply reported successfully");
      setFlaggedItems((prev) => ({ ...prev, [replyId]: true }));
    } catch (error) {
      if (error.response?.status === 506) {
        toast.error("Abusive content detected");
      } else {
        toast.error("Failed to report reply");
      }
    }
  };

  // --- Delete functions ---
  const handleDeleteComment = async (commentId) => {
    // Only allow deletion if current user is the owner of the comment.
    const commentToDelete = comments.find((c) => c._id === commentId);
    if (!commentToDelete || !currentUser || commentToDelete.userId._id !== currentUser.id._id) {
      toast.error("You can only delete your own comments");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/comments/deleteComment/${commentId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Comment deleted successfully");
      fetchComments();
    } catch (error) {
      if (error.response?.status === 506) {
        toast.error("Abusive content detected");
      } else {
        toast.error("Failed to delete comment");
      }
    }
  };

  const handleDeleteReply = async (commentId, replyId, replyOwnerId) => {
    // Only allow deletion if current user is the owner of the reply.
    if (!currentUser || replyOwnerId !== currentUser._id) {
      toast.error("You can only delete your own replies");
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/comments/deleteReplyComment/${replyId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Reply deleted successfully");
      // Refresh replies for that comment
      toggleReplySection(commentId);
    } catch (error) {
      if (error.response?.status === 506) {
        toast.error("Abusive content detected");
      } else {
        toast.error("Failed to delete reply");
      }
    }
  };

  const visibleComments = comments.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="comments-container">
      {/* New Comment Section */}
      <div className="add-comment-section">
        <div className="add-comment-avatar-wrap">
          {console.log("Currentuser---", currentUser)}
          {currentUser && currentUser.id.profilePicture ? (
            <img
              src={currentUser.id.profilePicture}
              alt="User Avatar"
              className="add-comment-avatar"
              onClick={() => navigate(`/me`)}
            />
          ) : (
            <FaUser className="add-comment-avatar-icon" />
          )}
        </div>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="comment-input"
        />
        <button className="comment-send-btn" onClick={handleCreateComment}>
          <FaPlay />
        </button>
      </div>
      {/* Comments List */}
      {comments.slice(0, visibleCount).map((comment) => (
        
        <div className="comment-card" key={comment._id}>
          <div className="comment-header">
          {console.log("From comments-----",comment)}
            {comment.userId.profilePicture ? (
              <img
                src={comment.userId.profilePicture}
                alt="User Avatar"
                className="comment-avatar"
              />
            ) : (
              <FaUser className="comment-avatar-icon" />
            )}
            <div className="comment-userinfo">
              <strong>{comment.userId.firstName} {comment.userId.lastName}</strong>
              <p className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString() || "Unknown Date"}
              </p>
            </div>
            {currentUser && comment.userId._id === currentUser.id._id && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteComment(comment._id)}
                title="Delete Comment"
              >
                <FaTrash />
              </button>
            )}
          </div>

          <p className="comment-text">{comment.text}</p>
          <div className="comment-actions">
            <button onClick={() => handleUpvote(comment._id)}>
              <FaArrowUp /> {comment.totalUpvotes || 0}
            </button>
            <button onClick={() => handleDownvote(comment._id)}>
              <FaArrowDown /> {comment.totalDownvotes || 0}
            </button>
            <button
              onClick={() => handleFlagComment(comment._id)}
              disabled={flaggedItems[comment._id]}
            >
              <FaFlag /> Report
            </button>
            <button onClick={() => toggleReplySection(comment._id)}>
              Reply
            </button>
          </div>

          {/* Reply Section */}
          {replyVisibility[comment._id] && (
            <div className="reply-section">
              <div className="reply-input-section">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyInputs[comment._id] || ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                  className="reply-input"
                />
                <button
                  onClick={() => handleCreateReply(comment._id)}
                  className="reply-send-btn"
                >
                  <FaPlay />
                </button>
              </div>
              {comment.replies && comment.replies.length > 0 && (
                <div className="comment-replies">
                  {comment.replies.map((reply) => (
                    <div className="reply-card" key={reply._id}>
                      <div className="reply-header">
                        {reply.userId.profilePicture ? (
                          <img
                            src={reply.userId.profilePicture}
                            alt="User Avatar"
                            className="reply-avatar"
                          />
                        ) : (
                          <FaUser className="reply-avatar-icon" />
                        )}
                        <div className="reply-userinfo">
                          <strong>{reply.userId.firstName} {reply.userId.firstName}</strong>
                          <p className="reply-date">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {currentUser && reply.userId === currentUser._id && (
                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteReply(comment._id, reply._id, reply.userId)
                            }
                            title="Delete Reply"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <p className="reply-text">{reply.text}</p>
                      <div className="reply-actions">
                        <button onClick={() => handleUpvoteReply(reply._id)}>
                          <FaArrowUp /> {reply.totalUpvotes || 0}
                        </button>
                        <button onClick={() => handleDownvoteReply(reply._id)}>
                          <FaArrowDown /> {reply.totalDownvotes || 0}
                        </button>
                        <button
                          onClick={() => handleFlagReply(reply._id)}
                          disabled={flaggedItems[reply._id]}
                        >
                          <FaFlag /> Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {comments.length > visibleCount && (
        <button className="load-more-btn" onClick={handleLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default Comments;
