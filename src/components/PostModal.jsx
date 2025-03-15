// src/components/PostModal.jsx
import React, { useState } from "react";
import axios from "axios";
import "../styles/PostModal.css";
import { FaImage, FaTimes, FaVideo, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

// List of category options
const categories = ["Issues", "Bothers", "Recommend", "Feedback", "Suggestion"];

const PostModal = ({ closeModal, setPosts = () => {} }) => {
  const [postContent, setPostContent] = useState({
    companyName: "",
    category: "",
    title: "",
    tags: "",
    content: "",
    imagePreview: null,
    videoPreview: null,
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

  // Handle form submission with FormData
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
    const formData = new FormData();
    formData.append("category", postContent.category.toLowerCase());
    formData.append("title", postContent.title);
    formData.append("description", postContent.content);
    formData.append("tag1", postContent.companyName); // Use company name as tag1
    formData.append("tag2", JSON.stringify(tagsArray)); // Pass tags as a JSON string

    // Append media files (all under "photos")
    if (postContent.imageFile || postContent.videoFile) {
      if (postContent.imageFile) {
        formData.append("photos", postContent.imageFile);
      }
      if (postContent.videoFile) {
        formData.append("photos", postContent.videoFile);
      }
    } else {
      // If no media provided, set photos to "null"
      formData.append("photos", "null");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/posts/createPost`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPosts((prev) => [response.data.post, ...prev]);
      toast.success("Post created successfully!");
      closeModal();
    } catch (error) {
      console.error("Error adding post:", error);
      toast.error("An error occurred while creating the post.");
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

        {/* POST button */}
        <div className="btn-section">
        <button className="clse-button" onClick={closeModal}>
          CANCEL
        </button>
        <button className="pst-btn" onClick={handleSubmit}>
          POST
        </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
