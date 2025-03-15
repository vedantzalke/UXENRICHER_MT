import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5009";

export const fetchPosts = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/posts`);
  return response.data;
};

export const fetchUserProfile = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
  return response.data;
};

export const createPostAPI = async (postData) => {
  const response = await axios.post(`${API_BASE_URL}/api/posts`, postData);
  return response.data;
};

export const votePostAPI = async (postId, voteType, userId) => {
  const response = await axios.patch(`${API_BASE_URL}/api/posts/${postId}/vote`, { voteType, userId });
  return response.data;
};