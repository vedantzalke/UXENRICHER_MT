// src/components/CompanyLeaderboard.jsx
import React from "react";
import "../styles/CompanyLeaderboard.css";

const CompanyLeaderboard = ({ leaderboardData, category, mostFilter, startDate, endDate }) => {
  if (!leaderboardData || leaderboardData.length === 0) {
    return <div>Loading leaderboard...</div>;
  }

  // Process the leaderboard data based on the selected category.
  // For "All", we use aggregated analytics. Otherwise, we extract the matching category's analytics.
  const filteredData = leaderboardData.map((item) => {
    if (category === "All") {
      return {
        company: item._id,
        posts: item.totalPostsAllCategories,
        upvotes: item.totalUpvotesAllCategories,
        comments: item.totalCommentsAllCategories,
      };
    } else {
      const catData = item.categories.find(
        (cat) => cat.category.toLowerCase() === category.toLowerCase()
      );
      return {
        company: item._id,
        posts: catData ? catData.analytics.totalPosts : 0,
        upvotes: catData ? catData.analytics.totalUpvotes : 0,
        comments: catData ? catData.analytics.totalComments : 0,
      };
    }
  });

  // Apply sorting based on the mostFilter prop.
  let sortedData = [...filteredData];
  if (mostFilter === "mostUpvoted") {
    sortedData.sort((a, b) => b.upvotes - a.upvotes);
  } else if (mostFilter === "mostCommented") {
    sortedData.sort((a, b) => b.comments - a.comments);
  } else {
    // Default sort: alphabetically by company name.
    sortedData.sort((a, b) => a.company.localeCompare(b.company));
  }

  return (
    <div className="leaderboard">
      <h2>Company Leaderboard</h2>
      <p>
        Below table states that from selected under the category "{category}" leaderboard position was :
      </p>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Posts</th>
            <th>Upvotes</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr key={item.company}>
              <td>{item.company}</td>
              <td>{item.posts}</td>
              <td>{item.upvotes}</td>
              <td>{item.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyLeaderboard;
