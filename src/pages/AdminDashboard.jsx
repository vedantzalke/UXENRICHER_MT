// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import "../styles/AdminDashboard.css";
import AdminPostModal from "../components/AdminPostModal"; // Import the new modal

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New state for modal overlay
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedFlaggedPost, setSelectedFlaggedPost] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, { withCredentials: true });
        setDashboardData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading Dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="admin-error">Error loading dashboard data.</div>;
  }

  // Destructure data (assumes keys: totalPosts, totalComments, totalUsers, sentimentScore, flaggedPosts, flaggedComments)
  const { totalPosts, totalComments, totalUsers, sentimentScore, flaggedPosts, flaggedComments } = dashboardData;

  // Summary Chart Data
  const summaryData = {
    labels: ['Posts', 'Comments', 'Users'],
    datasets: [{
      label: 'Dashboard Metrics',
      data: [totalPosts, totalComments, totalUsers],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
    }]
  };

  // Handler for viewing a flagged post
const handleViewFlaggedPost = (post) => {
  setSelectedFlaggedPost(post);
  setViewModalOpen(true);
};

// Handler for when a post is deleted or its flag removed (to update state)
const handleDeleteSuccess = (deletedPostId) => {
  setDashboardData((prevData) => ({
    ...prevData,
    flaggedPosts: prevData.flaggedPosts.filter((post) => post._id !== deletedPostId)
  }));
};

  return (
    <div className="admin-dashboard">
      <h1>Admin Page</h1>
      <div className="dashboard-summary">
        <Bar 
          data={summaryData} 
          options={{ responsive: true, maintainAspectRatio: false }} 
        />
      </div>
      <div className="dashboard-sentiment">
        <h2>Product Sentiment Score</h2>
        <p>{sentimentScore}</p>
      </div>
      <div className="dashboard-flagged">
        <h2>Flagged Posts</h2>
        <table>
          <thead>
            <tr>
              <th>Post ID</th>
              <th>Title</th>
              <th>User</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flaggedPosts && flaggedPosts.map(post => (
              <tr key={post._id} onClick={() => handleViewFlaggedPost(post)}>
                <td>{post._id}</td>
                <td>{post.title}</td>
                <td>{post.user || "N/A"}</td>
                <td>{new Date(post.timestamp).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click from firing
                      handleViewFlaggedPost(post);
                    }}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>Flagged Comments</h2>
        <table>
          <thead>
            <tr>
              <th>Comment ID</th>
              <th>Text</th>
              <th>User</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {flaggedComments && flaggedComments.map(comment => (
              <tr key={comment._id}>
                <td>{comment._id}</td>
                <td>{comment.text}</td>
                <td>{comment.user || "N/A"}</td>
                <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay for Viewing/Deleting Flagged Post */}
      {viewModalOpen && selectedFlaggedPost && (
        <AdminPostModal 
          post={selectedFlaggedPost}
          closeModal={() => {
            setViewModalOpen(false);
            setSelectedFlaggedPost(null);
          }}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
