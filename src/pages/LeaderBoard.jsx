// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Leaderboard.css";
import DateRangeFilter from "../components/DateRangeFilter";
import CompanyLeaderboard from "../components/CompanyLeaderboard";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Leaderboard = () => {
  // Filters for leaderboard
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mostFilter, setMostFilter] = useState("mostUpvoted"); // Options: "mostUpvoted", "mostDownvoted", "mostCommented"
  // Default date range values (can be modified by the user via DateRangeFilter)
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-09");
  const [leaderboardSubTab, setLeaderboardSubTab] = useState("company"); // "company" or "users"

  // This state holds the aggregated leaderboard data fetched from the API.
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Fixed list of categories for filtering
  const availableCategories = ["All", "Issues", "Bothers", "Recommend", "Feedback", "Suggestion"];

  // Fetch aggregated leaderboard data based on the date range.
  useEffect(() => {
    if (startDate && endDate) {
      axios
        .get(`${API_BASE_URL}/posts/getCompanyLeaderboard`, {
          params: { startDate, endDate },
          withCredentials: true,
        })
        .then((response) => {
          setLeaderboardData(response.data);
        })
        .catch((error) => console.error("Error fetching leaderboard data:", error));
    }
  }, [startDate, endDate]);

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <div className="leaderboard-tabs">
          <button
            className={leaderboardSubTab === "company" ? "active" : ""}
            onClick={() => setLeaderboardSubTab("company")}
          >
            Company Leaderboard
          </button>
          <button
            className={leaderboardSubTab === "users" ? "active" : ""}
            onClick={() => {
              setLeaderboardSubTab("users");
              toast("User leaderboard functionality will be implemented soon!");
            }}
          >
            User Leaderboard
          </button>
        </div>
        <div className="categories">
          {availableCategories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="date-range-filter">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
          />
        </div>
      </header>

      <main className="leaderboard-content">
        {leaderboardSubTab === "company" ? (
          // Passing the fetched leaderboardData along with filters, including startDate and endDate.
          <CompanyLeaderboard
            leaderboardData={leaderboardData}
            category={selectedCategory}
            mostFilter={mostFilter}
            startDate={startDate}
            endDate={endDate}
          />
        ) : (
          <div className="coming-soon">User leaderboard coming soon...</div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
