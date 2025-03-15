// src/components/AdminPostModal.jsx
import React from "react";
import PostCard from "./PostCard";
import { FaTrash, FaTimes, FaExclamationCircle } from "react-icons/fa";
import "../styles/AdminPostModal.css";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const AdminPostModal = ({ post, closeModal, onDeleteSuccess }) => {
  // Handler to delete a post
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`${API_BASE_URL}/posts/${post._id}`, { withCredentials: true });
        toast.success("Post deleted successfully.");
        onDeleteSuccess(post._id);
        closeModal();
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post.");
      }
    }
  };

  // Handler to remove the flag from a post
  const handleRemoveFlag = async () => {
    if (window.confirm("Remove flag from this post?")) {
      try {
        // Call the remove flag endpoint (assuming it's a GET request)
        const response = await axios.get(`${API_BASE_URL}/posts/remove-flag-post/${post._id}`, { withCredentials: true });
        toast.success("Flag removed successfully.");
        // Optionally, update the admin dashboard state if needed
        onDeleteSuccess(post._id); // You might update the flagged posts list
        closeModal();
      } catch (error) {
        console.error("Error removing flag:", error);
        toast.error("Failed to remove flag.");
      }
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="admin-close-btn" onClick={closeModal}>
          <FaTimes />
        </button>
        <div className="admin-modal-header">
          <h2>View Flagged Post</h2>
          <div className="admin-actions">
            <button className="admin-remove-btn" onClick={handleRemoveFlag}>
              <FaExclamationCircle /> Remove Flag
            </button>
            <button className="admin-delete-btn" onClick={handleDelete}>
              <FaTrash /> Delete
            </button>
          </div>
        </div>
        {/* Display the post details in read-only mode */}
        <PostCard post={post} />
      </div>
    </div>
  );
};

export default AdminPostModal;
