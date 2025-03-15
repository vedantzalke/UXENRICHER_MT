import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import { logoutUser } from "../store/userSlice";
import "../styles/Navbar.css";
import logo from "../assets/Logo.svg";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Navbar = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set up Socket.IO to listen for new notifications
  useEffect(() => {
    const socket = io(API_BASE_URL, { withCredentials: true });
    
    // Listen for new notifications from the server
    socket.on("newNotification", (newNotif) => {
      console.log("Received newNotification:", newNotif);
      setNotificationCount((prevCount) => prevCount + 1);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/">
        <img src={logo} alt="UXEnricher Logo" />       
         </Link>
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Links */}
      <ul className={menuOpen ? "nav-links open" : "nav-links"}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/allPosts">Issues</Link></li>
        <li><Link to="/analysis">Analysis</Link></li>
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        {!user && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        )}

        {/* User Dropdown for Logged-In Users */}
        {user && (
          <div className="user-dropdown" ref={dropdownRef}>
            {user.id.profilePicture ? (
              <img
                src={user.id.profilePicture}
                alt="User"
                className="avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            ) : (
              <FaUser
                className="avatar-icon"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
            )}
            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/me" onClick={() => setDropdownOpen(false)}>Profile</Link>
                <Link to="/notifications" onClick={() => setDropdownOpen(false)}>
                  Notifications 
                  {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                </Link>
                <button 
                  className="logout-btn" 
                  onClick={() => { 
                    dispatch(logoutUser());
                    setDropdownOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
