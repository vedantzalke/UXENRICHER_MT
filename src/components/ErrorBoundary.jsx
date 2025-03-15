import React, { Component } from "react";
import {useDispatch} from "react-redux";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h2>Oops! Something went wrong.</h2>
          <p>We're working on fixing the issue. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    color: "#D7263D",
    fontFamily: "Arial, sans-serif",
  },
};

export default ErrorBoundary;
