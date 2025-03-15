// src/pages/Home.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PostIdea from "../assets/Postidea.svg";
import ViewIdea from "../assets/Viewidea.svg";
import AnalyseIdea from "../assets/Analyseidea.svg";
import HeroImage from "../assets/hero-img.png";

import "../styles/Home.css"; // Importing styles

const Home = () => {
  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* ===== HERO SECTION ===== */}
      <section className="hero-section">
        <motion.div 
          className="hero-text"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Discover & Address Your UI/UX Issues</h1>
          <p>
            Dive into our analytics board to understand, prioritize,
            and fix your product issues. Create a better user experience!
          </p>
          <Link to="/analysis" className="primary-btn">ANALYZE ISSUES</Link>
        </motion.div>
        <motion.div 
          className="hero-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src={HeroImage} alt="Hero Illustration" />
        </motion.div>
      </section>

      {/* ===== FEATURE SECTIONS ===== */}
      {[
        { title: "Post Any Issue You Encounter", desc: "Share bugs, improvements, or feedback for any digital product.", img: PostIdea, link: "/allPosts", btnText: "POST ISSUE", reverse: false },
        { title: "View Issues as Posts", desc: "Browse through a feed of issues and see how people tackle them.", img: ViewIdea, link: "/allPosts", btnText: "VIEW ISSUES", reverse: true },
        { title: "Built-In Analytics Board", desc: "See trends, top issues, and real-time feedback on UX.", img: AnalyseIdea, link: "/analysis", btnText: "VIEW ANALYTICS", reverse: false },
        { title: "Get Notifications", desc: "Stay updated on reported issues and resolved bugs.", img: "/get-notifications.png", link: "/subscribe", btnText: "SUBSCRIBE", reverse: true }
      ].map((feature, index) => (
        <section key={index} className={`feature-section ${feature.reverse ? "reverse" : ""}`}>
          <div className="feature-text">
            <h2>{feature.title}</h2>
            <p>{feature.desc}</p>
            <Link to={feature.link} className="secondary-btn">{feature.btnText}</Link>
          </div>
          <div className="feature-image">
            <img src={feature.img} alt={feature.title} />
          </div>
        </section>
      ))}
    </motion.div>
  );
};

export default Home;
