// src/components/ProfileEditModal.jsx
import React from "react";
import "../styles/ProfileEditModal.css";

const ProfileEditModal = ({
  updatedUser,
  handleInputChange,
  handleProfilePictureUpload,
  handlePasswordChange,
  handleSave,
  setIsModalOpen,
  oldPassword,
  newPassword,
  setOldPassword,
  setNewPassword,
  passwordMessage,
}) => {
  return (
    <div className="modal">
      <div className="modal-content glass-bg">
        <h2>Edit Profile</h2>

        {/* Profile Picture Upload */}
        <div className="edit-row">
          <label>Photo:</label>
          <input id="profilePicture" type="file" onChange={handleProfilePictureUpload} />
        </div>

        {/* Form Fields */}
        <div className="edit-grid">
          <div className="left-section">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={updatedUser.firstName || ""}
              onChange={handleInputChange}
            />

            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={updatedUser.lastName || ""}
              onChange={handleInputChange}
            />

            <label>University:</label>
            <input
              type="text"
              name="university"
              value={updatedUser.university || ""}
              onChange={handleInputChange}
            />

            <label>Company:</label>
            <input
              type="text"
              name="company"
              value={updatedUser.company || ""}
              onChange={handleInputChange}
            />

            <label>Contact:</label>
            <input
              type="text"
              name="phone"
              value={updatedUser.phone || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="right-section">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={updatedUser.email || ""}
              onChange={handleInputChange}
            />

            <label>Address:</label>
            <input
              type="text"
              name="address"
              value={updatedUser.address || ""}
              onChange={handleInputChange}
            />

            <label>Bio:</label>
            <textarea
              name="bio"
              value={updatedUser.bio || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Optional Password Section 
        <div className="password-section">
          ...
        </div>
        */}

        {/* Actions */}
        <div className="profile-actions">
          <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
