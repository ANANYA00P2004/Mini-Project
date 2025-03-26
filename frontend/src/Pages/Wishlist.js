import React, { useState } from "react";
import Sidebar from "../Pages/Sidebar";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [savedAmount, setSavedAmount] = useState("");
  const [newItem, setNewItem] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [message, setMessage] = useState(""); 
  const [showPopup, setShowPopup] = useState(false);
  const [extraMessage, setExtraMessage] = useState(""); 
  const [showExtraPopup, setShowExtraPopup] = useState(false);

  const addItem = () => {
    if (newItem && newAmount) {
      setWishlistItems([...wishlistItems, { item: newItem, amount: parseFloat(newAmount) }]);
      setNewItem("");
      setNewAmount("");
    }
  };

  const removeItem = (index) => {
    const updatedItems = wishlistItems.filter((_, i) => i !== index);
    setWishlistItems(updatedItems);
  };

  const markAsAccomplished = (index, itemName) => {
    const accomplishedItem = wishlistItems[index];

    // Update saved amount after item is purchased
    const newSavedAmount = Math.max(0, savedAmount - accomplishedItem.amount);
    setSavedAmount(newSavedAmount);

    setMessage(`MAKE YOUR OTHER WISHES HAPPEN JUST LIKE YOUR ${itemName}`);
    setShowPopup(true);

    setCompletedItems([...completedItems, accomplishedItem]);
    removeItem(index);

    setTimeout(() => {
      setShowPopup(false);
      
      // Show the extra message after 10 seconds
      setExtraMessage(`You have Rs. ${newSavedAmount} for your other wishes.\nSAVE MORE TO SPEND MORE 💰`);
      setShowExtraPopup(true);

      setTimeout(() => {
        setShowExtraPopup(false);
      }, 3000);
    }, 10000);
  };

  return (
    <div className="wishlist-layout">
      <Sidebar /> 

      <div className="wishlist-content">
        <div className="wishlist-header">
          <h1 className="wishlist-title">WishList</h1>
          <div className="wishlist-subtitle-box">
            <h2 className="wishlist-subtitle">
              Save Today, Own Tomorrow: <br /> Your Future Starts with Every Penny!
            </h2>
          </div>
        </div>

        {/* ✅ Popup Messages */}
        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <p>{message}</p>
            </div>
          </div>
        )}

        {showExtraPopup && (
          <div className="popup-overlay">
            <div className="popup-content">
              <p>{extraMessage}</p>
            </div>
          </div>
        )}

        <div className="saved-amount-container">
          <input
            type="number"
            placeholder="Saved Amount"
            className="saved-amount-input"
            value={savedAmount}
            onChange={(e) => setSavedAmount(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="wishlist-input-container">
          <input
            type="text"
            placeholder="Enter Item"
            className="wishlist-input"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <input
            type="number"
            placeholder="Enter Amount"
            className="wishlist-input"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
        </div>

        <button className="add-button" onClick={addItem}>ADD</button>

        <div className="wishlist-items-container">
          {wishlistItems.map((item, index) => {
            const progress = (savedAmount / item.amount) * 100;
            const savedForItem = Math.min(savedAmount, item.amount);

            return (
              <div key={index} className="wishlist-item">
                <p className="wishlist-item-name">{item.item} - Rs. {item.amount}</p>

                <div className="progress-box">
                  <button className="close-button" onClick={() => removeItem(index)}>×</button>

                  <div
                    className="progress-bar"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  {hoveredIndex === index && (
                    <div className="speech-bubble">
                      🎉 You saved Rs. {savedForItem} for your {item.item}! 🎉
                    </div>
                  )}

                  {progress < 100 ? (
                    <div className="right-text-box">
                      You should save Rs. {item.amount - savedAmount} more to achieve your goal. Keep going, buddy!
                    </div>
                  ) : (
                    <button className="accomplished-button" onClick={() => markAsAccomplished(index, item.item)}>
                      Accomplished 🎉
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {completedItems.length > 0 && (
          <div className="completed-items-section">
            <h2 className="completed-title">Completed 🎯</h2>
            <div className="completed-items-container">
              {completedItems.map((item, index) => (
                <div key={index} className="completed-item">
                  {item.item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
