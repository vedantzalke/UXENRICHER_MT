// src/pages/Posts.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPosts, addPost } from "../store/postSlice";
import "../styles/Posts.css";
import PostModal from "../components/PostModal";
import PostCard from "../components/PostCard";
import { io } from "socket.io-client";
import { selectFilteredSortedPosts } from "../store/postSelectors";
import { FaUser } from "react-icons/fa"; // Import fallback icon

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Posts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Local state for filtering/sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Most Recent");
  const [visibleCount, setVisibleCount] = useState(5);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const { loading } = useSelector((state) => state.posts);

  // Use 'profilePicture' instead of 'avatar'
  const loggedInUser = useSelector((state) => state.user.user) || {
    id: "default",
    profilePicture: "",
  };

  const filteredSortedPosts = useSelector((state) =>
    selectFilteredSortedPosts(state, searchQuery, selectedCategory, sortOption)
  );

  useEffect(() => {
    // Initialize socket connection once when the component mounts
    socketRef.current = io(API_BASE_URL);

    // Dispatch initial posts fetch
    dispatch(getPosts());

    // Define the event handler as a named function
    const handleNewPost = (newPost) => {
      dispatch(addPost(newPost));
    };

    // Listen for newPost events from the server
    socketRef.current.on("newPost", handleNewPost);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off("newPost", handleNewPost);
        socketRef.current.disconnect();
      }
    };
  }, [dispatch]);

  return (
    <div className="posts-page">
      <div className="post-box glass-bg">
        {/* If loggedInUser.profilePicture is present, show image; otherwise show FaUser icon */}

        {loggedInUser.id.profilePicture ? (
          <img
            src={loggedInUser.id.profilePicture}
            alt="User Avatar"
            className="profile-img"
            onClick={() => navigate(`/me`)}
          />
        ) : (
          <FaUser
            className="profile-img icon"
            onClick={() => navigate(`/me`)}
          />
        )}
        <button className="post-button" onClick={() => setIsPostModalOpen(true)}>
          Share your UX experience...
        </button>
      </div>

      {isPostModalOpen && <PostModal closeModal={() => setIsPostModalOpen(false)} />}

      <div className="categories">
        {["All", "Issues", "Bothers", "Recommend", "Feedback", "Suggestion"].map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="filter">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <label>Sort By:</label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option>Most Recent</option>
          <option>Most Liked</option>
          <option>Most Commented</option>
        </select>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <>
          <div className="post-cards-container">
            {filteredSortedPosts.slice(0, visibleCount).map((post) => (
              <PostCard key={post.id || post._id} post={post} />
            ))}
            {filteredSortedPosts.length > visibleCount && (
              <button onClick={() => setVisibleCount(visibleCount + 5)}>Load More</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Posts;
