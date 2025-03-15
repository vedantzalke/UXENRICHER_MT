import React, { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import { addPost, updatePost } from "../store/postSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";
console.log('API_BASE_URL:', API_BASE_URL);
const SocketListner = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const socket = io(API_BASE_URL);
    socket.on("connect", () => {
      console.log("Connected with id:", socket.id);
    });
    socket.on("connect_error", (error) => {
      console.error("Connection Error:", error);
    });
    socket.on("newPost", (newPost) => {
      dispatch(addPost(newPost));
    });
    socket.on("voteUpdate", (updatedPost) => {
      dispatch(updatePost(updatedPost));
    });
    // Cleanup on unmount
    return () => {
      socket.off("newPost");
      socket.off("voteUpdate");
      socket.disconnect();
    };
  }, [dispatch]);
  
  return null;
};

export default SocketListner;
