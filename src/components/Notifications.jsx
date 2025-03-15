// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Notifications.css";
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // // Connect to Socket.IO server
  // useEffect(() => {
  //   const socket = io(API_BASE_URL, { withCredentials: true });
    
  //   // Listen for new notifications from the server
  //   socket.on("newNotification", (newNotif) => {
  //     setNotifications((prev) => [newNotif, ...prev]);
  //   });

  //   // Clean up on unmount
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  // Fetch existing notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Assumes your endpoint returns { notifications: [...] }
        const response = await axios.get(`${API_BASE_URL}/users/not`, { withCredentials: true });
        console.log(response.data);
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        <ul className="notifications-list">
  {notifications.slice().reverse().map((notif) => (
    <li key={notif._id} className="notification-item">
      <p className="notification-message">{notif.message}</p>
      <span className="notification-timestamp">
        {new Date(notif.timestamp).toLocaleString()}
      </span>
    </li>
  ))}
</ul>

      )}
    </div>
  );
};

export default Notifications;
