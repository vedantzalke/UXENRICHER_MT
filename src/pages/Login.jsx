// src/components/Login.jsx
import React from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Link, useNavigate } from 'react-router-dom';
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Auth.css';
import Logo from '../assets/Logo.svg';
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/userSlice"; // Make sure this exists and is imported

// Define API base URL using Vite's environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009/api";

// Validation schema for Login
const schema = yup.object().shape({
  email: yup.string().email("Please enter a valid email address").required("Email is required"),
  password: yup.string().required("Password is required")
});

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    try {
      // Call the backend login endpoint using axios
      const response = await axios.post(`${API_BASE_URL}/users/login`, data, {withCredentials: true});
      // Dispatch the login action with the returned user info
      dispatch(loginUser(response.data));
      
      // Optionally store the user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data));
      
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      // Handle error responses
      toast.error("Login failed: " + (error.response?.data?.msg || error.message));
    }
  };

  const onError = (formErrors) => {
    Object.values(formErrors).forEach((error) => {
      toast.error(error.message);
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <Link to="/">
          <img src={Logo} alt="UXENRICHER Logo" className="auth-logo" />
        </Link>
        <input
          type="email"
          placeholder="Email"
          className="auth-input"
          {...register("email")}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          {...register("password")}
          autoComplete="new-password"
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
        <button
          type="submit"
          onClick={handleSubmit(onSubmit, onError)}
          className="auth-btn primary-btn"
        >
          Login
        </button>
        <p className="forgot-password-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <p className="auth-alt-links">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
        <button type="button" className="auth-btn google-btn">
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
