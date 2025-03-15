import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import postReducer from "./postSlice";
import globalReducer from "./globalSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    posts: postReducer, 
    global: globalReducer,
  },
});

export default store;
