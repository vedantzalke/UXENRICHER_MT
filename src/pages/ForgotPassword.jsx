// src/components/ForgotPassword.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';
import Logo from '../assets/Logo.svg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

// Define API base URL using environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Email is required');
      toast.error('Email is required');
      return;
    }
    const emailPattern = /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailPattern.test(email)) {
      setMessage('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      // Call the backend endpoint for resetting the password
      const response = await axios.post(`${API_BASE_URL}/api/auth/resetPassword`, { email });
      
      // Use the response from the backend
      setMessage(response.data.message || 'If an account with that email exists, you will receive an email to reset your password.');
      toast.success(response.data.message || 'If an account with that email exists, you will receive an email to reset your password.');
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Password reset failed');
      toast.error(error.response?.data?.msg || 'Password reset failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt="UXENRICHER Logo" className="auth-logo" />
          </Link>
        </div>
        <h2>Forgot Password</h2>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {message && <p className="message">{message}</p>}
        <button type="submit" onClick={handleSubmit} className="auth-btn primary-btn">
          Reset Password
        </button>
        <p className="auth-alt-links">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default ForgotPassword;
