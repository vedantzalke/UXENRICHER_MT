import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
};

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async ({ userId, updatedData }) => {
    // Ensure the URL uses the /api/users prefix if your backend mounts it that way
    const response = await axios.patch(`${API_BASE_URL}/api/users/me`, updatedData);
    return response.data;
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async ({ userId, oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/users/me/password`, {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginUser(state, action) {
      const user = action.payload;
      // Normalize by ensuring we have an 'id' property
      const normalizedUser = { ...user, id: user.id || user._id };
      state.user = normalizedUser;
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    },
    logoutUser(state) {
      state.user = null;
      localStorage.removeItem("user");
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    
  },
});
export const { loginUser, logoutUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
