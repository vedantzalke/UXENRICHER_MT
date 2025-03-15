// src/pages/Subscribe.jsx
import React, { useState } from 'react';
import axios from 'axios';
import "../styles/Subscribe.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Subscribe = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/subscribe`, { email });
      toast.success(response.data.message || "Subscribed successfully!");
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Subscription failed.");
    }
  };

  return (
    <div className="subscribe-page">
      <h1>Join Our Newsletter</h1>
      <div className="subscribe-form">
        <input
          type="email"
          placeholder="Enter your email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleSubscribe}>Subscribe</button>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Subscribe;
