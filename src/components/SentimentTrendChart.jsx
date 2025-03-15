// src/components/SentimentTrendChart.jsx
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "../styles/SentimentTrendChart.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const SentimentTrendChart = () => {
  // State to hold company list (fetched from getSentimentByCategory)
  const [companyData, setCompanyData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("All");

  // States for date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State to hold trend data
  const [trendData, setTrendData] = useState([]);

  // Fetch company list similar to CategorySentimentChart
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/posts/getSentimentByCategory`, { withCredentials: true })
      .then((res) => {
        console.log("Company List:", res.data);
        setCompanyData(res.data);
        if (res.data.length > 0) {
          // Set default company to the first in the list
          setSelectedCompany(res.data[0]._id);
        }
      })
      .catch((err) => console.error("Error fetching company list:", err));
  }, []);

  // Fetch trend data when selectedCompany or date range changes
  useEffect(() => {
    let params = {};
    if (selectedCompany && selectedCompany !== "All") {
      params.company = selectedCompany;
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }
    axios
      .get(`${API_BASE_URL}/posts/getSentimentTrends`, { params, withCredentials: true })
      .then((res) => {
        console.log("Trend Data:", res.data);
        setTrendData(res.data);
      })
      .catch((err) => console.error("Error fetching trend data:", err));
  }, [selectedCompany, startDate, endDate]);

  // Prepare Chart.js data
  const labels = trendData.map((item) => item._id);
  const positiveData = trendData.map((item) => item.positive);
  const negativeData = trendData.map((item) => item.negative);
  const neutralData = trendData.map((item) => item.neutral);

  const data = {
    labels,
    datasets: [
      {
        label: "Positive",
        data: positiveData,
        borderColor: "#4CAF50",
        fill: false,
      },
      {
        label: "Negative",
        data: negativeData,
        borderColor: "#F44336",
        fill: false,
      },
      {
        label: "Neutral",
        data: neutralData,
        borderColor: "#FFCE56",
        fill: false,
      },
    ],
  };

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Handlers for filter controls
  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  return (
    <div className="trend-chart-card">
      <h2>
        {selectedCompany && selectedCompany !== "All"
          ? `Sentiment Trend for ${selectedCompany}`
          : "Sentiment Trend Over Time"}
      </h2>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-item">
          <label htmlFor="company-select">Select Company:</label>
          <select id="company-select" value={selectedCompany} onChange={handleCompanyChange}>
            <option value="All">All</option>
            {companyData.map((company) => (
              <option key={company._id} value={company._id}>
                {company._id}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-item">
          <label htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div className="filter-item">
          <label htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>

      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SentimentTrendChart;
