// src/pages/About.jsx
import React from "react";
import Slider from "react-slick";
import "../styles/About.css";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const slidesData = [
  {
    title: "Issues",
    online: "Critical bugs and failures that prevent core functionality (e.g., crashes, broken links, data errors). Immediate fixes are required to restore usability.",
    offline: "Defects in physical products or service disruptions (e.g., faulty components or delays) that hinder proper functioning and need urgent resolution."
  },
  {
    title: "Bothers",
    online: "Minor annoyances like slow load times, misaligned elements, or small UI glitches that don’t block tasks but detract from a polished experience.",
    offline: "Inconveniences like difficult-to-open packaging or unclear instructions that cause slight frustration but do not prevent use."
  },
  {
    title: "Recommend",
    online: "Suggestions for additional features or enhancements such as dark mode, advanced search filters, or new integrations to improve the digital experience.",
    offline: "Ideas for new product features, accessory options, or service improvements that add value and enhance overall performance."
  },
  {
    title: "Feedback",
    online: "General user opinions on overall usability, performance, and satisfaction that help gauge sentiment and direct future improvements.",
    offline: "Customer reviews and comments about quality and usability that inform iterative improvements for physical products or services."
  },
  {
    title: "Suggestion",
    online: "Actionable proposals for refinements in the interface or functionality that can lead to a smoother and more innovative digital experience.",
    offline: "Detailed proposals for design or service enhancements, such as better ergonomics or additional support options, that can set a product apart."
  }
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  pauseOnHover: true,
};

const About = () => {
  return (
    <div className="about-page">
      <header className="about-header">
        <h1>About UXEnricher</h1>
      </header>
      <section className="about-overview glass-bg">
        <h2>Our Vision</h2>
        <p>
          UXEnricher is designed to help businesses unlock deep insights into their user engagement. Our platform tracks user feedback, categorizes posts, and provides detailed analytics to empower data-driven decisions.
        </p>
      </section>
            {/* New Slider Section for Detailed Categories */}
            <section className="about-slider">
        <h2>Product Categories Explained</h2>
        <Slider {...sliderSettings}>
          {slidesData.map((slide, index) => (
            <div className="slide glass-bg" key={index}>
              <h3>{slide.title}</h3>
              <div className="slide-content">
                <div className="slide-section">
                  <h4>Online Products</h4>
                  <p>{slide.online}</p>
                </div>
                <div className="slide-section">
                  <h4>Offline Products</h4>
                  <p>{slide.offline}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>
      <section className="about-features glass-bg">
        <h2>Key Features</h2>
        <ul>
          <li><strong>Real-Time Analytics:</strong> Immediate feedback on post engagement and sentiment.</li>
          <li><strong>Sentiment Analysis:</strong> Detailed breakdown of user emotions across various categories.</li>
          <li><strong>Customizable Dashboards:</strong> Tailor the view to display the metrics that matter most.</li>
          <li><strong>Company Leaderboards:</strong> Benchmark performance against competitors.</li>
        </ul>
      </section>
      <section className="about-flow glass-bg">
        <h2>How It Works</h2>
        <p>
          Users post feedback, which is automatically categorized and analyzed for sentiment. Our platform aggregates this data into intuitive charts and dashboards—making it easy for companies to spot trends and areas for improvement.
        </p>
      </section>
      <section className="about-value glass-bg">
        <h2>What Companies Can Expect</h2>
        <p>
          With UXEnricher, companies can expect a comprehensive view of customer feedback, enabling them to optimize product features, improve user experience, and ultimately drive business growth.
        </p>
      </section>
      <section className="about-contact glass-bg">
        <h2>Contact & Support</h2>
        <p>
          Interested in a demo or partnership? <a href="mailto:vedantzalke14@gmail.com">Contact us</a> to learn more.
        </p>
      </section>
    </div>
  );
};

export default About;
