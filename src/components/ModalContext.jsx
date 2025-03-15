// src/context/ModalContext.jsx
import React, { createContext, useState, useContext } from "react";
import PostCard from "../components/PostCard";
import "../styles/Modal.css"; // create this file with your modal styles

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  return (
    <ModalContext.Provider value={{ selectedPost, isModalOpen, openModal, closeModal }}>
      {children}
      {isModalOpen && selectedPost && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>
              &times;
            </button>
            <PostCard post={selectedPost} />
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
