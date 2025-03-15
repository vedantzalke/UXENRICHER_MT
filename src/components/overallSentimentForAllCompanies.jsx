// src/components/CategorySentimentChart.jsx
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import "../styles/overallSentimentForAllCompanies.css";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const OverallSentimentForAllCompanies = () => {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/posts/overallSentimentForAllCompanies`, { withCredentials: true })
      .then((res) => {
        console.log("Category Data:", res.data);
        setCategoryData(res.data);
      })
      .catch((err) => console.error("Error fetching category sentiment:", err));
  }, []);

  // Changed here: use item._id instead of item.id
  const labels = categoryData.map((item) => item._id);
  const positive = categoryData.map((item) => item.positive);
  const negative = categoryData.map((item) => item.negative);
  const neutral = categoryData.map((item) => item.neutral);

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
      <h2>Sentiment analysis of all post.</h2>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default OverallSentimentForAllCompanies;
