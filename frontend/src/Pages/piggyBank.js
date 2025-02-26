import React, { useState, useEffect } from "react";
import piggyImage from "../images/piggy 2.jpeg";
import "./piggy.css";

const PiggyBank = () => {
  const [coins, setCoins] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let coinInterval = setInterval(() => {
      if (progress < 100) {
        setCoins((prevCoins) => [
          ...prevCoins,
          { id: prevCoins.length },
        ]);
        setProgress((prev) => prev + 10);
      } else {
        clearInterval(coinInterval);
      }
    }, 500);

    return () => clearInterval(coinInterval);
  }, [progress]);

  return (
    <div className="piggy-section">
      <div className="piggy-container">
        {/* Falling Coins */}
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="coin"
            style={{ animationDelay: `${coin.id * 0.2}s` }}
          ></div>
        ))}

        {/* Piggy Bank Image */}
        <div className="piggy-bank">
          <img src={piggyImage} alt="Piggy Bank" className="piggy-image" />
        </div>

        {/* Loading Bar */}
        <div className="loading-bar-container">
          <div className="loading-bar" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default PiggyBank;
