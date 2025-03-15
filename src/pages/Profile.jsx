// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";
import { logoutUser, updateUser } from "../store/userSlice";
import {
  FaUniversity,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import ProfileEditModal from "../components/ProfileEditModal";
import PostOverview from "../components/PostOverview";
import EditPostModal from "../components/EditPostModal"; // Import your EditPostModal component
import { useModal } from "../components/ModalContext";
import Notifications from "../components/Notifications";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009/api";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);

  // State for profile data and activities
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for logged-in user's posts (from getLoggedInUserPosts)
  const [myPosts, setMyPosts] = useState([]);
  const { openModal } = useModal();
// Inside your Profile component, after myPosts and currentUser are defined:
const postsWithUser = myPosts.map(post => {
  // If userId is a string and equals the current user's _id, attach the currentUser details.
  if (typeof post.userId === 'string' && currentUser && post.userId === currentUser._id) {
    return { ...post, userId: currentUser };
  }
  return post;
});

  // States for profile editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // New state for editing posts
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  // New states for main tab navigation and activity sub‑tabs:
  const [activeMainTab, setActiveMainTab] = useState("info"); // "info" or "activity"
  const [activeActivityTab, setActiveActivityTab] = useState("posts"); // "posts", "comments", "upvotes", "downvotes", "notifications"

  // New state for notifications
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // Fetch the current user's profile (including basic user info) from /users/me
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, { withCredentials: true });
        setUserData(response.data);
        setUpdatedUser(response.data.user);
      } catch (err) {
        setError("User not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch logged-in user's posts from getLoggedInUserPosts endpoint
  useEffect(() => {
    if (activeActivityTab === "posts") {
      axios
        .get(`${API_BASE_URL}/posts/myPosts`, { withCredentials: true })
        .then((res) => setMyPosts(res.data))
        .catch((err) => console.error("Error fetching my posts:", err));
    }
  }, [activeActivityTab]);

  // Fetch notifications when the user switches to the "notifications" tab
  useEffect(() => {
    if (activeActivityTab === "notifications") {
      setLoadingNotifications(true);
      axios
        .get(`${API_BASE_URL}/users/not`, { withCredentials: true })
        .then((response) => {
          setNotifications(response.data);
        })
        .catch((error) => console.error("Error fetching notifications:", error))
        .finally(() => setLoadingNotifications(false));
    }
  }, [activeActivityTab]);

  // Update form fields on change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Upload profile picture
  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profilePicture", file);

      try {
        const response = await axios.put(`${API_BASE_URL}/users/me`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newProfilePicture = response.data.profilePicture;
        setUserData((prev) => ({
          ...prev,
          user: { ...prev.user, profilePicture: newProfilePicture },
        }));
      } catch (error) {
        console.error("Error uploading profile picture", error);
      }
    }
  };

  // Save updated profile changes
  const handleSave = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/me`, updatedUser, {
        withCredentials: true,
      });
      const updatedProfile = response.data.user;
      dispatch(updateUser(updatedProfile));
      setUserData({ 
        user: updatedProfile, 
        posts: userData.posts, 
        comments: userData.comments, 
        upvotes: userData.upvotes, 
        downvotes: userData.downvotes 
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // Change password
  const handlePasswordChange = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/me/password`,
        { oldPassword, newPassword },
        { withCredentials: true }
      );
      if (response.data.success) {
        setPasswordMessage("Password updated successfully.");
      } else {
        setPasswordMessage("Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordMessage("Error updating password.");
    }
  };

  // --- New Functions for Editing and Deleting Posts ---
  const handleEditPost = (post) => {
    // Open the EditPostModal overlay with the selected post
    setPostToEdit(post);
    setEditModalOpen(true);
  };

  const handleDeletePost = async (post) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(`${API_BASE_URL}/posts/${post._id}`, { withCredentials: true });
        // Remove deleted post from myPosts state
        setMyPosts((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post.");
      }
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="profile-container">
      {/* Main Tab Navigation */}
      <div className="profile-tabs">
        <button className={activeMainTab === "info" ? "active" : ""} onClick={() => setActiveMainTab("info")}>
          Profile Info
        </button>
        <button className={activeMainTab === "activity" ? "active" : ""} onClick={() => setActiveMainTab("activity")}>
          Activity
        </button>
      </div>

      {activeMainTab === "info" && (
        <div className="profile-card glass-bg">
          {userData?.user?.profilePicture ? (
            <img src={userData.user.profilePicture} alt="User Profile" className="profile-img" />
          ) : (
            <FaUser className="profile-img icon" />
          )}
          <h2>
            {userData?.user?.firstName} {userData?.user?.lastName}
            <span> 😊</span>
          </h2>
          <hr className="divider" />
          <div className="profile-info">
            <div className="info-column">
              <p>
                <FaUniversity className="icon" /> {userData?.user?.university}
              </p>
              <p>
                <FaEnvelope className="icon" /> {userData?.user?.email}
              </p>
              <p>
                <FaMapMarkerAlt className="icon" /> {userData?.user?.address}
              </p>
            </div>
            <div className="info-column">
              <p>
                <FaBriefcase className="icon" /> {userData?.user?.company}
              </p>
              <p>
                <FaPhone className="icon" /> {userData?.user?.phone}
              </p>
              <p>{userData?.user?.bio}</p>
            </div>
          </div>
          <div className="profile-actions">
            <button className="logout-btn" onClick={handleLogout}>
              LOG OUT
            </button>
            <button className="edit-btn" onClick={() => setIsModalOpen(true)}>
              EDIT
            </button>
          </div>
        </div>
      )}

      {activeMainTab === "activity" && (
        <div className="activity-section">
          {/* Activity Tabs */}
          <div className="activity-tabs">
            <button className={activeActivityTab === "posts" ? "active" : ""} onClick={() => setActiveActivityTab("posts")}>
              Posts
            </button>
            <button className={activeActivityTab === "notifications" ? "active" : ""} onClick={() => setActiveActivityTab("notifications")}>
              Notifications
            </button>
          </div>
          <div className="activity-content">
            {activeActivityTab === "posts" && (
              <>
                <h3>My Posts</h3>
                <PostOverview 
                  posts={postsWithUser} 
                  openModal={openModal}  // If you have a default modal, otherwise leave as empty
                  truncateText={(text, max) => text}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              </>
            )}
            {activeActivityTab === "notifications" && (
              <>
                {/* Render notifications as before */}
                <Notifications/>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile Editing Modal */}
      {isModalOpen && (
        <ProfileEditModal
          updatedUser={updatedUser}
          handleInputChange={handleInputChange}
          handleProfilePictureUpload={handleProfilePictureUpload}
          handlePasswordChange={handlePasswordChange}
          handleSave={handleSave}
          setIsModalOpen={setIsModalOpen}
          oldPassword={oldPassword}
          newPassword={newPassword}
          setOldPassword={setOldPassword}
          setNewPassword={setNewPassword}
          passwordMessage={passwordMessage}
        />
      )}

      {/* Edit Post Modal Overlay */}
      {editModalOpen && postToEdit && (
        <EditPostModal
          post={postToEdit}
          closeModal={() => {
            setEditModalOpen(false);
            setPostToEdit(null);
          }}
          setPosts={setMyPosts}
        />
      )}
    </div>
  );
};

export default Profile;
