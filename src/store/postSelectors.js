import { createSelector } from "reselect";
import { postSelectors } from "./postSlice";

// Use the adapter's selectors to get all posts
const selectAllPosts = postSelectors.selectAll;

// Memoized selector for filtering and sorting posts
export const selectFilteredSortedPosts = createSelector(
  [
    selectAllPosts,
    (_, searchQuery) => searchQuery,
    (_, __, selectedCategory) => selectedCategory,
    (_, __, ___, sortOption) => sortOption,
  ],
  (posts, searchQuery, selectedCategory, sortOption) => {
    let filtered = posts;

    // Filter by search query if provided
    if (searchQuery && searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          (post.title && post.title.toLowerCase().includes(lowerQuery)) ||
          (post.description && post.description.toLowerCase().includes(lowerQuery))
      );
    }

    // Filter by category if it's not "All"
    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (post) =>
          post.category &&
          post.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort the filtered posts based on the selected option    
    if (sortOption === "Most Recent") {
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortOption === "Most Liked") {
      // Use totalUpvotes property instead of upvotes
      filtered.sort((a, b) => (b.totalUpvotes || 0) - (a.totalUpvotes || 0));
    } else if (sortOption === "Most Commented") {
      filtered.sort((a, b) => (b.repliesCount || 0) - (a.repliesCount || 0));
    }

    return filtered;
  }
);
