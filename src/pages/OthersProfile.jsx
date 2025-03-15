// src/pages/OthersProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/OthersProfile.css";
import PostOverview from "../components/PostOverview";
import { FaUser } from "react-icons/fa";
import { useModal } from "../components/ModalContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const OthersProfile = () => {
  const { userId } = useParams();
  const [userActivities, setUserActivities] = useState({
    user: null,
    posts: []
  });
  const { openModal, closeModal, isModalOpen, selectedPost } = useModal();

  useEffect(() => {
    const fetchUserActivities = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`, { withCredentials: true });
        const data = response.data;
        // Only fetch user and posts
        setUserActivities({
          user: data.user,
          posts: data.posts || []
        });
      } catch (error) {
        console.error("Error fetching user activities:", error);
      }
    };

    fetchUserActivities();
  }, [userId]);

  // Map posts to ensure they include the user info.
  // If the post does not have a 'user' field, we attach the fetched profile user.
  const postsWithUser = userActivities.posts.map((post) => ({
    ...post,
    user: post.user || userActivities.user
  }));

  return (
    <div className="others-profile">
      <header className="profile-header">
        {userActivities.user ? (
          <>
            {userActivities.user.profilePicture ? (
              <img src={userActivities.user.profilePicture} alt="Profile" className="profile-picture" />
            ) : (
              <FaUser className="profile-icon" />
            )}
            <h2>
              {userActivities.user.firstName} {userActivities.user.lastName} posts
            </h2>
          </>
        ) : (
          <h2>Loading Profile...</h2>
        )}
      </header>

      {/* Since we don't need tabs for comments/upvotes/downvotes here, just render posts */}
      <div className="tab-content">
        <PostOverview
          posts={postsWithUser}
          openModal={openModal}
          truncateText={(text, max) => text}
        />
      </div>
    </div>
  );
};

export default OthersProfile;
