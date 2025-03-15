import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";
const socket = io(API_BASE_URL);


// Create an entity adapter for posts
const postsAdapter = createEntityAdapter({
  selectId: (post) => post.id || post._id,
});

// Create normalized initial state
const initialState = postsAdapter.getInitialState({
  loading: false,
});

export const getPosts = createAsyncThunk("posts/getPosts", async () => {
  const response = await axios.get(`${API_BASE_URL}/posts/allPosts`, { withCredentials: true });
  return response.data;
});

export const createPost = createAsyncThunk("posts/createPost", async (postData) => {
  const response = await axios.post(`${API_BASE_URL}/posts`, postData, { withCredentials: true });
  socket.emit("newPost", response.data);
  return response.data;
});

// Async thunk for voting on a post (upvote or downvote)
export const voteOnPost = createAsyncThunk(
  "posts/voteOnPost",
  async ({ postId, voteType, userId }) => {
    let endpoint = "";
    if (voteType === "upvote") {
      endpoint = `${API_BASE_URL}/posts/upvote/${postId}`;
    } else if (voteType === "downvote") {
      endpoint = `${API_BASE_URL}/posts/downvote/${postId}`;
    } else {
      throw new Error("Invalid vote type");
    }
    const response = await axios.post(
      endpoint,
      { voteType, userId },
      { withCredentials: true }
    );
    socket.emit("voteUpdate", response.data);
    // Return only the updated post object
    return response.data.post;
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost(state, action) {
      postsAdapter.addOne(state, action.payload);
    },
    updatePost(state, action) {
      postsAdapter.updateOne(state, {
        id: action.payload.id || action.payload._id,
        changes: action.payload,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.loading = false;
        postsAdapter.setAll(state, action.payload);
      })
      .addCase(voteOnPost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        postsAdapter.updateOne(state, {
          id: updatedPost.id || updatedPost._id,
          changes: updatedPost,
        });
      });
  },
});

export const { addPost, updatePost } = postSlice.actions;
export default postSlice.reducer;

// Export the selectors for use in components
export const postSelectors = postsAdapter.getSelectors((state) => state.posts);
