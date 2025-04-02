import React, { useState, useEffect } from "react";
import PiggyBank from "./Pages/piggyBank";
import LandingPage from "./Pages/LandingPage";
import "./App.css";

const App = () => {
  const [loading, setLoading] = useState(!sessionStorage.getItem("hasVisited"));

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem("hasVisited", "true"); // Store flag in sessionStorage
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return <div className="app-container">{loading ? <PiggyBank /> : <LandingPage />}</div>;
};

export default App;
