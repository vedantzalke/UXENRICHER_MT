// src/components/PostCard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaArrowUp,
  FaArrowDown,
  FaComment,
  FaImage,
  FaVideo,
  FaUser,
  FaEdit,
  FaTrash,
  FaRetweet,
  FaEllipsisH,
  FaTags,
} from "react-icons/fa";
import "../styles/PostCard.css";
import Comments from "./comments";
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { voteOnPost } from "../store/postSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user.user);
  const postId = post.id || post._id;
  const formattedDate = new Date(post.timestamp).toLocaleDateString();
  const tags = [post.tag1, ...(post.tag2 || [])];
  const dispatch = useDispatch();
  console.log("PostCard checking the post -------------",post)
  // Local state for user info
  const [fetchedUser, setFetchedUser] = useState(null);

  // Only fetch user info if post.user is not populated and post.userId is an object
  useEffect(() => {
    if (!post.user && post.userId && typeof post.userId === "object") {
      const fetchUserInfo = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/${post.userId?._id}`, { withCredentials: true });
          // Assume API returns { user: { ... } }
          setFetchedUser(response.data.user);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };
      fetchUserInfo();
    }
  }, [post.user, post.userId]);

  // Determine which user info to display:
  // 1. If post.user exists, use that.
  // 2. Else if fetchedUser is available, use that.
  // 3. Else fall back to loggedInUser.
  const displayUser = post.user || fetchedUser || (loggedInUser && loggedInUser.id ? loggedInUser.id : loggedInUser);;

  // New state for read more functionality
  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionLimit = 150; // characters

  // New state for image slider
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [modalMediaUrl, setModalMediaUrl] = useState("");
  const [modalMediaType, setModalMediaType] = useState("image");

  // Toggle comments display (not modified here)
  const [showComments, setShowComments] = useState(false);

  // Options dropdown state and ref (unchanged)
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = React.useRef(null);

  // Handler for dropdown toggling
  const handleEllipsisClick = () => {
    setShowOptions(!showOptions);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler for upvoting
  const theId= loggedInUser.id._id;
  const handleUpvote = async () => {
    if (!loggedInUser) return;
    try {
      await dispatch(
        voteOnPost({ postId, voteType: "upvote", userId: theId })
      ).unwrap();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "You have already upvoted this post";
      toast.error(message);
      console.log(error);
    }
  };

  // Handler for downvoting
  const handleDownvote = async () => {
    if (!loggedInUser) return;
    try {
      await dispatch(
        voteOnPost({ postId, voteType: "downvote", userId: theId })
      ).unwrap();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "You have already downvoted this post";
      toast.error(message);
    }
  };

  // Toggle comments display
  const handleComments = () => {
    setShowComments(!showComments);
  };

  const handleReportPost = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/posts/report/${postId}`,
        {},
        { withCredentials: true }
      );
      toast.success("This post has been reported. Necessary actions will be taken.");
      setShowOptions(false);
    } catch (error) {
      toast.error("Failed to report the post. Please try again.");
    }
  };

  // Handlers for image slider (for thumbnails)
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.photos.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.photos.length - 1 ? 0 : prev + 1
    );
  };

  // When modal is open, update the modalMediaUrl to reflect the current image
  useEffect(() => {
    if (showMediaModal && post.photos && post.photos.length > 0) {
      setModalMediaUrl(post.photos[currentImageIndex]);
    }
  }, [currentImageIndex, showMediaModal, post.photos]);

  // Handler for toggling full description
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Handler to open the media modal
  const openMediaModal = (mediaUrl, type = "image") => {
    setModalMediaUrl(mediaUrl);
    setModalMediaType(type);
    setShowMediaModal(true);
  };

  // Handler to close the media modal
  const closeMediaModal = () => {
    setShowMediaModal(false);
    setModalMediaUrl("");
  };
  return (
    <>
      <div className="post-card glass-bg">
        <div className="post-card-header">
          <div className="post-card-userinfo">
            {displayUser?.profilePicture ? (
              <img
                src={displayUser.profilePicture}
                alt="User Avatar"
                className="post-card-avatar"
                onClick={() => navigate(`/users/${displayUser._id}`)}
              />
            ) : (
              <FaUser
                className="post-card-avatar icon"
                onClick={() => navigate(`/users/${displayUser?._id}`)}
              />
            )}
            <div className="post-card-userinfo-detail">
              <strong className="post-card-username">
                {displayUser
                  ? `${displayUser.firstName} ${displayUser.lastName}`
                  : `User: ${post.userId}`}
              </strong>
              <p className="post-card-date">{formattedDate}</p>
            </div>
          </div>
          <div className="post-card-options-container" ref={optionsRef}>
            <FaEllipsisH className="post-card-options" onClick={handleEllipsisClick} />
            {showOptions && (
              <div className="options-dropdown">
                <button onClick={handleReportPost}>Report Post</button>
              </div>
            )}
          </div>
        </div>
        <hr className="post-divider" />
        <div className="post-header-info">
          <h3 className="post-card-category">{post.category}:</h3>
          <h2 className="post-card-title">{post.title}</h2>
        </div>
        <div className="post-card-tags-container">
          <FaTags />{" "}
          <div className="post-card-tags">
            {tags.map((tag, index) => (
              <span key={index} className={`tag ${index === 0 ? "first-tag" : ""}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="post-card-description">
          {showFullDescription || post.description.length <= descriptionLimit
            ? post.description
            : `${post.description.slice(0, descriptionLimit)}... `}
          {post.description.length > descriptionLimit && (
            <span className="read-more" onClick={toggleDescription}>
              {showFullDescription ? " Read less" : " Read more"}
            </span>
          )}
        </div>
        {post.photos && post.photos.length > 0 && (
          <div className="post-card-media" onClick={() => openMediaModal(post.photos[currentImageIndex], "image")}>
            {post.photos.length > 1 ? (
              <div className="image-slider">
                <button className="slider-btn prev-btn" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>
                  &lt;
                </button>
                <img
                  src={post.photos[currentImageIndex]}
                  alt="Post Media"
                  className="slider-image"
                />
                <button className="slider-btn next-btn" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>
                  &gt;
                </button>
              </div>
            ) : (
              <img src={post.photos[0]} alt="Post Media" />
            )}
          </div>
        )}
        <div className="post-engagement">
        
          <button className="upvote-btn" onClick={handleUpvote}>
            <FaArrowUp /> {post.totalUpvotes || 0}
          </button>
          <button className="downvote-btn" onClick={handleDownvote}>
            <FaArrowDown /> {post.totalDownvotes || 0}
          </button>
          <button className="comment-btn" onClick={handleComments}>
            <FaComment /> {post.commentCount }
          </button>
          <button
            className="share-btn"
            onClick={() => toast("ReShare functionality coming soon!")}
          >
            <FaRetweet /> Share
          </button>
        </div>
        {showComments && (
          <Comments postId={postId} token={localStorage.getItem("authToken")} />
        )}
      </div>

      {showMediaModal && (
        <div className="media-modal-overlay" onClick={closeMediaModal}>
          <div className="media-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-media-modal" onClick={closeMediaModal}>
              &times;
            </button>
            <button
              className="modal-prev-btn"
              onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
            >
              &lt;
            </button>
            <button
              className="modal-next-btn"
              onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
            >
              &gt;
            </button>
            {modalMediaType === "image" ? (
              <img src={modalMediaUrl} alt="Full View" className="full-media" />
            ) : (
              <video src={modalMediaUrl} controls className="full-media" />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
