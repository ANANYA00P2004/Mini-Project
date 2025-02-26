import React, { useState, useRef, useEffect } from "react";
import "./LandingPage.css";
import logo from "../images/logo.PNG";
import heroImage from "../images/img1.jpg";
import featuresImage from "../images/img2.jpg";
import { useNavigate } from "react-router-dom";

const featuresData = [
  "Tracking expenses into categories",
  "Customized budget planning",
  "Super insightful dashboard",
  "AI generated report and insights",
  "Savings wishlist",
  "Managing future financial events",
  "Timely reminders and alerts to keep you on track"
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const featuresRef = useRef(null);
  
  // Scroll to features section when clicking the features button
  const scrollToFeatures = () => {
    featuresRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleNext = () => {
    setCurrentCard((prev) =>
      prev === featuresData.length - 1 ? 0 : prev + 1
    );
  };
  const handlePrev = () => {
    setCurrentCard((prev) =>
      prev === 0 ? featuresData.length - 1 : prev - 1
    );
  };

  const [startX, setStartX] = useState(0);

  const handleDragStart = (e) => {
    setStartX(e.clientX);
  };

  const handleDragEnd = (e) => {
    const endX = e.clientX;
    if (startX - endX > 50) {
      handleNext();
    } else if (endX - startX > 50) {
      handlePrev();
    }
  };

  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const node = featuresRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (node) observer.observe(node);
    return () => {
      if (node) observer.unobserve(node);
    };
  }, []);

  return (
    <div className="landing-container">
      <div className="main-part">
        <nav className="navbar">
          <img src={logo} alt="Wyzo Logo" className="logo" />
          <div className="nav-links">
            <button className="feature-btn" onClick={scrollToFeatures}>
              Features
            </button>
            <button className="login-btn" onClick={() => navigate("/sign-in")}>Login</button>
          </div>
        </nav>

        <div className="hero-section">
          <div className="hero-text">
            <h1>Welcome to Wyzo</h1>
            <p>Your go-to destination for managing personal finances.</p>
            <button className="signup-btn" onClick={() => navigate ("/sign-up")}>Sign Up</button>
          </div>
          <div className="hero-image">
            <img src={heroImage} alt="Financial Growth" />
          </div>
        </div>
      </div>

      <div
        className={`features-full-container ${
          featuresVisible ? "features-visible" : ""
        }`}
        ref={featuresRef}
      >
        <div className="features-heading">
          <h2>Our Features</h2>
        </div>

        <div className="features-content">
          <div className="features-image">
            <img src={featuresImage} alt="Features Overview" />
          </div>

          <div className="features-carousel">
            <div
              className="feature-card"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="feature-circle">
                <span>{currentCard + 1}</span>
              </div>
              <div className="feature-text">
                <h3>{featuresData[currentCard]}</h3>
              </div>
            </div>

            <div className="carousel-controls">
              <button onClick={handlePrev}>&larr;</button>
              <button onClick={handleNext}>&rarr;</button>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer-container">
        <p className="footer-text">
          Give our solution a try, and you’ll be hooked on managing<br /> your personal finances like never before. <br />Be wise with Wyzo!!
        </p>
        <p className="copyright">© Wyzo</p>
      </footer>
    </div>
  );
};

export default LandingPage;
