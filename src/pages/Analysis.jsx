// src/pages/Analysis.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Analysis.css";
import { FaSearch, FaTags } from "react-icons/fa";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import PostCard from "../components/PostCard";
import CompanyFilter from "../components/CompanyFilter";
import PostOverview from "../components/PostOverview";
import SentimentChart from "../components/SentimentChart";
import SentimentTrendChart from "../components/SentimentTrendChart";
import CategorySentimentChart from "../components/CategorySentimentChart";
import ExportDashboard from "../components/ExportFullAnalysisCSV"; // CSV Export component
import OverallSentimentForAllCompanies from "../components/overallSentimentForAllCompanies";
import { useModal } from "../components/ModalContext";
import DateRangeFilter from "../components/DateRangeFilter";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5009";

const Analysis = () => {
  // Original states
  const [posts, setPosts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState("Most Recent");
  const [entriesPerPage, setEntriesPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const { openModal, closeModal, isModalOpen, selectedPost } = useModal();
  const [sentiments, setSentiments] = useState({ positive: 0, negative: 0, neutral: 0 });

  // New states for tab navigation and filtering in details section
  const [activeMainTab, setActiveMainTab] = useState("company"); // "company" or "leaderboard"
  const [companySubTab, setCompanySubTab] = useState("details"); // "graphs" or "details"
  const [graphTab, setGraphTab] = useState("sentiment"); // "sentiment", "trend", "category", "trending", "resolved"
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "recent", "lastMonth"
  const [sortingOptionDetails, setSortingOptionDetails] = useState("alphabetAZ"); // sorting control for posts in details

  // New state for Tag Filter in Details section
  const [tagFilter, setTagFilter] = useState("");
  // New separate states for category and "most" filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [mostFilter, setMostFilter] = useState("mostUpvoted"); // Options: mostUpvoted, mostDownvoted, mostCommented, none

  // Compute available tags from posts (both tag1 and tag2)
  const availableTags = [
    ...new Set(
      posts.flatMap((post) => {
        const arr = [];
        if (post.tag1) arr.push(post.tag1);
        if (post.tag2 && Array.isArray(post.tag2)) arr.push(...post.tag2);
        return arr;
      })
    ),
  ];

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/posts/allPosts`, { withCredentials: true })
      .then((response) => {
        setPosts(response.data);
        const pos = response.data.filter((post) => post.sentiment === "positive").length;
        const neg = response.data.filter((post) => post.sentiment === "negative").length;
        const neu = response.data.filter((post) => post.sentiment === "neutral").length;
        setSentiments({ positive: pos, negative: neg, neutral: neu });
      })
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  // Filter posts based on search, category, and company:
  const filteredByCategory = posts.filter((post) => {
    if (selectedCategory === "All") return true;
    return post.category && post.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const filteredPosts = filteredByCategory.filter((post) =>
    post.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const filteredByCompany = filteredPosts.filter(
    (post) => selectedCompany === "All" || post.tag1 === selectedCompany
  );

  // *** Sorted posts block including "Most Commented" sort option ***
  const sortedPosts = [...filteredByCompany].sort((a, b) => {
    if (sortOption === "Most Liked") {
      return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
    }
    if (sortOption === "Most Recent") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if (sortOption === "Most Commented") {
      // Using commentCount property; adjust if needed
      return (b.commentCount || 0) - (a.commentCount || 0);
    }
    return 0;
  });

  // Pagination
  const totalEntries = sortedPosts.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentRows = sortedPosts.slice(startIndex, startIndex + entriesPerPage);

  // Build trendingTags from posts as before:
  const trendingTags = {};
  posts.forEach((post) => {
    if (post.tag1) {
      trendingTags[post.tag1] = (trendingTags[post.tag1] || 0) + 1;
    }
    if (post.tag2 && Array.isArray(post.tag2)) {
      post.tag2.forEach((tag) => {
        trendingTags[tag] = (trendingTags[tag] || 0) + 1;
      });
    }
  });

  // Convert to an array, sort by frequency, and take the top 25:
  const trendingTagsArray = Object.entries(trendingTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25);

  // Create trendingTagsData for Chart.js:
  const trendingTagsData = {
    labels: trendingTagsArray.map(([tag]) => tag),
    datasets: [
      {
        label: "Tag Frequency",
        data: trendingTagsArray.map(([, count]) => count),
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#FF9800",
          "#a29bfe", "#fd79a8", "#55efc4", "#81ecec", "#fab1a0",
          "#e17055", "#00cec9", "#0984e3", "#6c5ce7", "#fdcb6e",
          "#00b894", "#d63031", "#e84393", "#2d3436", "#fd79a8",
          "#f0932b", "#eb4d4b", "#6ab04c", "#686de0", "#f9ca24"
        ].slice(0, trendingTagsArray.length)
      },
    ],
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Compute distinct companies
  const companies = ["All", ...Array.from(new Set(posts.map((post) => post.tag1).filter(Boolean)))];

  // Function to sort details posts based on mostFilter and sortingOptionDetails
  const sortDetailsPosts = (postsArray) => {
    let sorted = [...postsArray];
    if (mostFilter === "mostUpvoted") {
      sorted = sorted.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
    } else if (mostFilter === "mostDownvoted") {
      sorted = sorted.sort((a, b) => (b.downvotes?.length || 0) - (a.downvotes?.length || 0));
    } else if (mostFilter === "mostCommented") {
      sorted = sorted.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
    } else {
      if (sortingOptionDetails === "alphabetAZ") {
        sorted = sorted.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortingOptionDetails === "alphabetZA") {
        sorted = sorted.sort((a, b) => b.title.localeCompare(a.title));
      } else if (sortingOptionDetails === "lastMonth" || sortingOptionDetails === "lastWeek") {
        sorted = sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      } else if (sortingOptionDetails === "topToBottom") {
        sorted = sorted.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));
      } else if (sortingOptionDetails === "bottomToTop") {
        sorted = sorted.sort((a, b) => (a.upvotes?.length || 0) - (b.upvotes?.length || 0));
      }
    }
    return sorted;
  };

  let detailsPosts = [...sortedPosts];

  if (tagFilter) {
    detailsPosts = detailsPosts.filter((post) => {
      const tags = [post.tag1, ...(post.tag2 || [])];
      return tags.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()));
    });
  }

  if (categoryFilter !== "All") {
    detailsPosts = detailsPosts.filter(
      (post) => post.category && post.category.toLowerCase() === categoryFilter.toLowerCase()
    );
  }
  detailsPosts = sortDetailsPosts(detailsPosts);

  // Prepare filter details for CSV export
  const filters = {
    selectedCategory,
    selectedCompany,
    startDate,
    endDate,
    sortOption,
  };

  return (
    <div className="analysis-page" id="dashboard">
      {/* Header: Main Tabs */}
      {activeMainTab === "company" && (
        <div className="company-analysis-section">
          <div className="main-tabs">
            <div className="company-analysis-tabs">
              <button
                className={companySubTab === "details" ? "active" : ""}
                onClick={() => setCompanySubTab("details")}
              >
                Details
              </button>
              <button
                className={companySubTab === "graphs" ? "active" : ""}
                onClick={() => setCompanySubTab("graphs")}
              >
                Graphs
              </button>
            </div>
            <ExportDashboard 
              filters={{ selectedCategory, selectedCompany, startDate, endDate, sortOption }} 
              posts={posts} 
              sentiments={sentiments} 
            />
          </div>
          {companySubTab === "graphs" && (
            <div className="graphs-section">
              {/* Graph tabs and content */}
              <div className="graph-tabs">
                <button className={graphTab === "sentiment" ? "active" : ""} onClick={() => setGraphTab("sentiment")}>
                  Total Sentiments
                </button>
                <button className={graphTab === "trending" ? "active" : ""} onClick={() => setGraphTab("allcomanysentiment")}>
                  Over all Sentiments
                </button>
                <button className={graphTab === "trend" ? "active" : ""} onClick={() => setGraphTab("trend")}>
                  Trend
                </button>
                <button className={graphTab === "category" ? "active" : ""} onClick={() => setGraphTab("category")}>
                  Category
                </button>
                <button className={graphTab === "trending" ? "active" : ""} onClick={() => setGraphTab("trending")}>
                  Trending Tags
                </button>
              </div>
              <div className="graph-content">
                {graphTab === "sentiment" && (
                  <>
                    <p>Explanation: This chart shows the overall sentiment breakdown for all posts done for individual company.</p>
                    <SentimentChart sentiments={sentiments} company={selectedCompany} />
                  </>
                )}
                {graphTab === "allcomanysentiment" && (
                  <>
                    <p>Explanation: This chart shows the overall sentiment breakdown across all posts for all companies.</p>
                    <OverallSentimentForAllCompanies />
                  </>
                )}
                {graphTab === "trend" && (
                  <>
                    <p>Explanation: This chart displays the sentiment trend over time for a company.</p>
                    <SentimentTrendChart />
                  </>
                )}
                {graphTab === "category" && (
                  <>
                    <p>Explanation: This chart illustrates sentiment distribution by category of the posts that are done for that company.</p>
                    <CategorySentimentChart />
                  </>
                )}
                {graphTab === "trending" && (
                  <>
                    <p>Explanation: This chart shows the frequency of tags used in posts.</p>
                    <Bar data={trendingTagsData} />
                  </>
                )}
              </div>
            </div>
          )}
          {companySubTab === "details" && (
            <>
              <div className="details-controls">
                <div className="tag-filter-control">
                  <CompanyFilter companies={companies} selectedCompany={selectedCompany} onChange={setSelectedCompany} />
                  <label htmlFor="tagFilter">Tags:</label>
                  <input
                    type="text"
                    id="tagFilter"
                    list="tags-list"
                    placeholder="Enter tag..."
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                  />
                  <datalist id="tags-list">
                    {availableTags.map((tag) => (
                      <option key={tag} value={tag} />
                    ))}
                  </datalist>
                </div>
                <div className="category-filters">
                  <label>Categories:</label>
                  <select
                    className="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Issues">Issues</option>
                    <option value="Bothers">Bothers</option>
                    <option value="Recommend">Recommend</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Suggestion">Suggestion</option>
                  </select>
                </div>
                <div className="most-filters">
                  <label>Most:</label>
                  <select
                    className="category-filter"
                    value={mostFilter}
                    onChange={(e) => setMostFilter(e.target.value)}
                  >
                    <option value="mostUpvoted">Upvoted</option>
                    <option value="mostDownvoted">Downvoted</option>
                    <option value="mostCommented">Commented</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div className="sorting-controls">
                  <label>Sort:</label>
                  <select
                    className="category-filter"
                    value={sortingOptionDetails}
                    onChange={(e) => setSortingOptionDetails(e.target.value)}
                  >
                    <option value="alphabetAZ">Alphabet (A-Z)</option>
                    <option value="alphabetZA">Alphabet (Z-A)</option>
                    <option value="lastMonth">Last Month</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="topToBottom">Top to Bottom</option>
                    <option value="bottomToTop">Bottom to Top</option>
                  </select>
                </div>
              </div>
              <PostOverview posts={detailsPosts} openModal={openModal} truncateText={truncateText} />
            </>
          )}
        </div>
      )}
      <div className="pagination-controls">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Prev
        </button>
        <span>
          Page {currentPage} of {Math.ceil(posts.length / entriesPerPage)}
        </span>
        <button disabled={currentPage === Math.ceil(posts.length / entriesPerPage)} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </div>
      {/* The modal is now rendered by the ModalContext, so no need to include it here */}
    </div>
  );
};

export default Analysis;
