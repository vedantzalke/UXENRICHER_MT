// src/components/CategorySentimentChart.jsx
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "../styles/CategorySentimentChart.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const CategorySentimentChart = () => {
  const [companyData, setCompanyData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/posts/getSentimentByCategory`, { withCredentials: true })
      .then((res) => {
        console.log("Company Sentiment Data:", res.data);
        setCompanyData(res.data);
        if (res.data.length > 0) {
          setSelectedCompany(res.data[0]._id); // select first company by default
        }
      })
      .catch((err) => console.error("Error fetching company sentiment:", err));
  }, []);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  // Find the data for the selected company.
  const selectedCompanyData = companyData.find(
    (company) => company._id === selectedCompany
  );

  // Prepare chart data from the selected company's categories.
  let labels = [];
  let positive = [];
  let negative = [];
  let neutral = [];

  if (selectedCompanyData && selectedCompanyData.categories) {
    labels = selectedCompanyData.categories.map((item) => item.category);
    positive = selectedCompanyData.categories.map((item) => item.positive);
    negative = selectedCompanyData.categories.map((item) => item.negative);
    neutral = selectedCompanyData.categories.map((item) => item.neutral);
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Positive",
        data: positive,
        backgroundColor: "#4CAF50",
      },
      {
        label: "Negative",
        data: negative,
        backgroundColor: "#F44336",
      },
      {
        label: "Neutral",
        data: neutral,
        backgroundColor: "#FFCE56",
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
      legend: {
        position: "bottom",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="category-chart-card">
      <h2>Sentiment by Category</h2>
      <div className="company-selector">
        <label htmlFor="company-select">Select Company:</label>
        <select
          id="company-select"
          value={selectedCompany}
          onChange={handleCompanyChange}
        >
          {companyData.map((company) => (
            <option key={company._id} value={company._id}>
              {company._id}
            </option>
          ))}
        </select>
      </div>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default CategorySentimentChart;
