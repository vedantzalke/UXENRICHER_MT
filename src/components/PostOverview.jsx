// src/components/PostOverview.jsx
import React from "react";
import { 
  FaArrowUp, FaArrowDown, FaComment, FaImage, FaVideo, FaUser, FaEdit, FaTrash 
} from "react-icons/fa";
import "../styles/PostOverview.css";
import { useNavigate } from "react-router-dom";

const PostOverview = ({ posts, openModal, onEdit, onDelete }) => {
  const navigate = useNavigate();

  // Function to always truncate the description at 150 characters
  const truncateDescription = (text, limit = 150) => {
    if (!text) return "";
    return text.length > limit ? text.slice(0, limit) + "..." : text;
  };

  return (
    <div className="issues-table">
      <h2>Total Entries: {posts.length}</h2>
      {posts.map((post) => {
        const postId = post.id || post._id;
        // Use either post.user or post.userId as the display user
        const displayUser = post.user || post.userId;
        const postDate = new Date(post.timestamp);
        const timeString = postDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const dateString = postDate.toLocaleDateString();
        const tags = [post.tag1, ...(Array.isArray(post.tag2) ? post.tag2 : [])];

        return (
          <div
            className="issue-row glass-bg"
            key={postId}
            onClick={() => openModal(post)}
          >
            {/* Engagement Metrics */}
            <div className="issue-engagement">
              <div className="engagement-row">
                <div className="engagement-item">
                  <span className="upvote-count">{post.totalUpvotes || 0}</span>
                  <FaArrowUp />
                </div>
                <div className="engagement-item">
                  <span className="downvote-count">{post.totalDownvotes || 0}</span>
                  <FaArrowDown />
                </div>
                <div className="engagement-item">
                  <span className="comment-count">{post.commentCount || 0}</span>
                  <FaComment />
                </div>
                <div className="engagement-item">
                  <span className="photos-count">{post.photos ? post.photos.length : 0}</span>
                  <FaImage />
                </div>
                <div className="engagement-item">
                  <span className="videos-count">{post.videos ? post.videos.length : 0}</span>
                  <FaVideo />
                </div>
              </div>
            </div>
            {/* Post Info */}
            <div className="issue-info">
              <div className="issue-category">
                <p>{post.category}</p>
              </div>
              <h3>{post.title}</h3>
              <div className="post-card-tags">
                {tags.map((tag, index) => (
                  <span key={index} className={index === 0 ? "tag first-tag" : "tag"}>
                    {tag}
                  </span>
                ))}
              </div>
              <p>{truncateDescription(post.description)}</p>
            </div>
            {/* User Info */}
            <div className="issue-user">
              <div
                className="user-info"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/users/${displayUser?._id}`);
                }}
                style={{ cursor: "pointer" }}
              >
                {displayUser && displayUser.profilePicture ? (
                  <img src={displayUser.profilePicture} alt="User Avatar" />
                ) : (
                  <FaUser className="profile-img icon" />
                )}
              </div>
              <h3 className="userName">
                {displayUser && displayUser.firstName
                  ? `${displayUser.firstName} ${displayUser.lastName}`
                  : "Unknown User"}
              </h3>
              <div className="issue-date">
                <p>{dateString}</p>
                <p>{timeString}</p>
              </div>
            </div>
            {/* Edit/Delete Buttons */}
            {(onEdit || onDelete) && (
              <div className="post-actions">
                {onEdit && (
                  <button
                    className="edit-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(post);
                    }}
                  >
                    <FaEdit />
                  </button>
                )}
                {onDelete && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(post);
                    }}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PostOverview;
