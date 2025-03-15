// src/components/SentimentChart.jsx
import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import "../styles/SentimentChart.css"; // Create/update this file as needed
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const SentimentChart = () => {
  const [companyData, setCompanyData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [sentiments, setSentiments] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });

  // Fetch overall sentiment data for companies from the API
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/posts/overallSentimentForAllCompanies`, {
        withCredentials: true,
      })
      .then((res) => {
        setCompanyData(res.data);
        // Set default sentiments to the aggregated values for "All"
        const allSentiments = res.data.reduce(
          (acc, curr) => {
            acc.positive += curr.positive;
            acc.negative += curr.negative;
            acc.neutral += curr.neutral;
            return acc;
          },
          { positive: 0, negative: 0, neutral: 0 }
        );
        setSentiments(allSentiments);
      })
      .catch((err) =>
        console.error("Error fetching overall sentiment data:", err)
      );
  }, []);

  // Update sentiments when the selected company changes or companyData is updated.
  useEffect(() => {
    if (selectedCompany === "All") {
      const allSentiments = companyData.reduce(
        (acc, curr) => {
          acc.positive += curr.positive;
          acc.negative += curr.negative;
          acc.neutral += curr.neutral;
          return acc;
        },
        { positive: 0, negative: 0, neutral: 0 }
      );
      setSentiments(allSentiments);
    } else {
      const company = companyData.find((comp) => comp._id === selectedCompany);
      if (company) {
        setSentiments({
          positive: company.positive,
          negative: company.negative,
          neutral: company.neutral,
        });
      } else {
        setSentiments({ positive: 0, negative: 0, neutral: 0 });
      }
    }
  }, [selectedCompany, companyData]);

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
  };

  const data = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        data: [
          sentiments.positive || 0,
          sentiments.negative || 0,
          sentiments.neutral || 0,
        ],
        backgroundColor: ["#4CAF50", "#F44336", "#FFCE56"],
      },
    ],
  };

  return (
    <div className="chart-card">
      <h2>
        {selectedCompany !== "All"
          ? `Sentiment Analysis for ${selectedCompany}`
          : "Overall Sentiment Analysis"}
      </h2>
      <div className="company-selector">
        <label htmlFor="company-select">Select Company:</label>
        <select
          id="company-select"
          value={selectedCompany}
          onChange={handleCompanyChange}
        >
          <option value="All">All</option>
          {companyData.map((company) => (
            <option key={company._id} value={company._id}>
              {company._id}
            </option>
          ))}
        </select>
      </div>
      <Pie data={data} />
    </div>
  );
};

export default SentimentChart;
