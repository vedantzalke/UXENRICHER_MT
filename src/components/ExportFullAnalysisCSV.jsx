// src/components/ExportFullAnalysisCSV.jsx
import React from "react";
import "../styles/ExportFullAnalysisCSV.css"; // You can reuse your CSS or create custom styles

const ExportFullAnalysisCSV = ({ filters, posts, sentiments }) => {
  const exportCSV = () => {
    if (!posts || posts.length === 0) {
      alert("No posts data available to export.");
      return;
    }

    let csvRows = [];

    // Title
    csvRows.push("Analysis Page Details");
    csvRows.push("");

    // Export Filter Settings
    csvRows.push("Filter Settings:");
    csvRows.push(`Category,${filters.selectedCategory}`);
    csvRows.push(`Company,${filters.selectedCompany}`);
    csvRows.push(`Start Date,${filters.startDate || "N/A"}`);
    csvRows.push(`End Date,${filters.endDate || "N/A"}`);
    csvRows.push(`Sort Option,${filters.sortOption}`);
    csvRows.push("");

    // Export Overall Sentiments
    csvRows.push("Overall Sentiments:");
    csvRows.push(`Positive,${sentiments.positive}`);
    csvRows.push(`Negative,${sentiments.negative}`);
    csvRows.push(`Neutral,${sentiments.neutral}`);
    csvRows.push("");

    // Export Posts Data (as a table)
    csvRows.push("Posts Data:");
    // Create header from keys of the first post (assuming all posts share the same keys)
    const postKeys = Object.keys(posts[0]);
    csvRows.push(postKeys.join(","));
    // Append each post's data
    posts.forEach((post) => {
      const row = postKeys.map((key) => {
        let val = post[key];
        // If value is an object or array, stringify it.
        if (typeof val === "object") {
          val = JSON.stringify(val);
        }
        // Escape double quotes
        if (typeof val === "string") {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      csvRows.push(row.join(","));
    });

    // Combine rows into a single CSV string
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "fullAnalysis.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="export-dashboard-csv">
      <button onClick={exportCSV}>Export Full Analysis as CSV</button>
    </div>
  );
};

export default ExportFullAnalysisCSV;
