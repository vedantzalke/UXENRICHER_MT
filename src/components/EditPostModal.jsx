// src/components/EditPostModal.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/EditPostModal.css";
import { FaImage, FaTimes, FaVideo, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const categories = ["Issues", "Bothers", "Recommend", "Feedback", "Suggestion"];

const EditPostModal = ({ post, closeModal, setPosts = () => {} }) => {
  // Initialize state with post values
  const [postContent, setPostContent] = useState({
    companyName: post.tag1 || "",
    category: post.category || "",
    title: post.title || "",
    tags: post.tag2 ? post.tag2.join(", ") : "",
    content: post.description || "",
    imagePreview: post.photos && post.photos.length > 0 ? post.photos[0] : null,
    videoPreview: post.videos && post.videos.length > 0 ? post.videos[0] : null,
    imageFile: null,
    videoFile: null,
  });

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPostContent((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPostContent((prev) => ({
        ...prev,
        videoFile: file,
        videoPreview: URL.createObjectURL(file),
      }));
    }
  };

  // Remove image preview
  const removeImage = () => {
    setPostContent((prev) => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));
  };

  // Remove video preview
  const removeVideo = () => {
    setPostContent((prev) => ({
      ...prev,
      videoFile: null,
      videoPreview: null,
    }));
  };

  // Handle form submission to update the post
  const handleSubmit = async () => {
    // Prepare tags array from comma-separated input
    const tagsArray = postContent.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    // Validate required fields
    if (!postContent.category) {
      toast.error("Please select a category.");
      return;
    }
    if (!postContent.companyName.trim()) {
      toast.error("Please provide a company/product name.");
      return;
    }
    if (!postContent.title.trim()) {
      toast.error("Please provide a title.");
      return;
    }

    // Create FormData object
    const postData = {
      category: postContent.category.toLowerCase(),
      title: postContent.title,
      description: postContent.content,
      tag1: postContent.companyName, // Use company name as tag1
      tag2: tagsArray, // Pass tags as an array (not a JSON string)
      photos: [], // Initialize an empty array to store media URLs
    };
    
    // If there's an image or video, add it as a URL (assuming you've uploaded it separately)
    if (postContent.imageFile || postContent.videoFile) {
      if (postContent.imageFile) {
        postData.photos.push(postContent.imageFile); // Modify as needed
      }
      if (postContent.videoFile) {
        postData.photos.push(postContent.videoFile); // Modify as needed
      }
    }
    
    try {
      console.log("Sending post data:", postData);
      
      // Send the PUT request with JSON data
      const response = await axios.put(`${API_BASE_URL}/posts/${post._id}`, postData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
    
      console.log("Response from edit post:", response);
    
      // Update the posts state (assumes response.data.post holds the updated post)
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === post._id ? response.data.post : p))
      );
    
      toast.success("Post updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post.");
    }

  };

  return (
    <div className="modal-overlay">
      <div className="post-modal">
        {/* Close button */}
        <button className="close-btn" onClick={closeModal}>
          <FaTimes />
        </button>

        {/* Category toggle buttons */}
        <div className="category-toggle">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`toggle-btn ${postContent.category === cat ? "active" : ""}`}
              onClick={() =>
                setPostContent((prev) => ({ ...prev, category: cat }))
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Company/Product name */}
        <input
          type="text"
          placeholder="Add product name, company name or service name."
          value={postContent.companyName}
          onChange={(e) => setPostContent((prev) => ({ ...prev, companyName: e.target.value }))}
          className="input-field"
        />

        {/* Post title */}
        <input
          type="text"
          placeholder="Your Post Title here..."
          value={postContent.title}
          onChange={(e) => setPostContent((prev) => ({ ...prev, title: e.target.value }))}
          className="input-field"
        />

        {/* Tags */}
        <input
          type="text"
          placeholder="Add up to four comma-separated tags per post..."
          value={postContent.tags}
          onChange={(e) => setPostContent((prev) => ({ ...prev, tags: e.target.value }))}
          className="input-field"
        />

        {/* Post description */}
        <textarea
          placeholder="Your post content here..."
          rows="4"
          value={postContent.content}
          onChange={(e) => setPostContent((prev) => ({ ...prev, content: e.target.value }))}
          className="textarea-field"
        ></textarea>

        {/* Media upload icons (image + video) */}
        <div className="media-icons">
          {/* Image */}
          <label htmlFor="image-upload" className="upload-label">
            <FaImage className="icon" />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />

          {/* Video */}
          <label htmlFor="video-upload" className="upload-label">
            <FaVideo className="icon" />
          </label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="file-input"
          />
        </div>

        {/* Media previews with remove option */}
        {postContent.imagePreview && (
          <div className="media-preview-container">
            <img src={postContent.imagePreview} alt="Preview" className="media-preview" />
            <button className="remove-btn" onClick={removeImage}>
              <FaTrash />
            </button>
          </div>
        )}
        {postContent.videoPreview && (
          <div className="media-preview-container">
            <video src={postContent.videoPreview} controls className="media-preview" />
            <button className="remove-btn" onClick={removeVideo}>
              <FaTrash />
            </button>
          </div>
        )}

        {/* Buttons */}
        <div className="btn-section">
          <button className="clse-button" onClick={closeModal}>
            CANCEL
          </button>
          <button className="pst-btn" onClick={handleSubmit}>
            UPDATE POST
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
