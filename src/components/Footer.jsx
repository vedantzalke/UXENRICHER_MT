import React, { useState } from "react";
import { Link } from "react-router-dom"; // For navigation links
import "../styles/Footer.css";
import logo from "../assets/Logo.svg";
import axios from "axios";

// Define API_BASE_URL using the environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
    try {
      // Send the email to your backend subscription endpoint
      const response = await axios.post(`${API_BASE_URL}/subscribe`, { email });
      console.log("Subscribed with email:", email, response.data);
      setEmail("");
      alert("Thank you for subscribing!");
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Subscription failed. Please try again.");
    }
  };

  return (
    <footer className="footer-container glass-bg">
      <div className="footer-content">
        
        {/* Left side: Logo + Navigation */}
        <div className="footer-left">
          {/* Replace with your actual logo path */}
                <img 
                src={logo} 
                alt="Logo" 
                className="footer-logo" 
                onClick={() => window.location.href = "/"}
                />
                <ul className="footer-nav">
                
                <li><Link to="/about">About</Link></li>
                <li><Link to="/allPosts">Issues</Link></li>
                <li><Link to="/analysis">Analysis</Link></li>
                <li><Link to="/leaderboard">Leaderboard</Link></li>
                </ul>
              </div>

              {/* Right side: Newsletter Subscription */}
        <div className="newsletter-section">
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSubscribe}>JOIN OUR NEWSLETTER</button>
        </div>
      </div>

      {/* Footer Bottom Text */}
      <p className="footer-bottom-text">
        © 2025 Vedant Zalke | All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
