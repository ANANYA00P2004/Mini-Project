import React, { useState } from "react";
import Sidebar from "../Pages/Sidebar";
import ProfileMenu from "../Pages/ProfileMenu"; // ✅ Import Profile Menu
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

    const newSavedAmount = Math.max(0, savedAmount - accomplishedItem.amount);
    setSavedAmount(newSavedAmount);

    setMessage(`Make Your Other Wishes Happen Just Like Your ${itemName}`);
    setShowPopup(true);

    setCompletedItems([...completedItems, accomplishedItem]);
    removeItem(index);
  };

  const handleFirstPopupClose = () => {
    setShowPopup(false);
    setExtraMessage(`You have Rs. ${savedAmount} for your other wishes.\nSAVE MORE TO SPEND MORE 💰`);
    setShowExtraPopup(true);
  };

  const handleSecondPopupClose = () => {
    setShowExtraPopup(false);
  };

  return (
    <div className="wishlist-layout">
      <Sidebar />

      {/* ✅ Profile Menu Added */}
      <div className="profile-menu-container">
        <ProfileMenu />
      </div>

      {/* ✅ Blurred background when popups are active */}
      <div className={`wishlist-content ${showPopup || showExtraPopup ? "blurred" : ""}`}>
        <h1 className="wishlist-title">WishList</h1>

        <p className="saved-amount-subheading">
          The money you saved after the expenses of {new Date().toLocaleString("default", { month: "long" })} could be used for your desires. <br /> Save more daily and start tracking the path towards your wishes.......
        </p>

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

        <div className="wishlist-subtitle-box">
          <h2 className="wishlist-subtitle">
            Save Today, Own Tomorrow: <br /> Your Future Starts with Every Penny!
          </h2>
        </div>
      </div>

      {/* ✅ First Popup Message */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>{message}</p>
            <button className="popup-button light-blue" onClick={handleFirstPopupClose}>
              Sure, Thank you
            </button>
          </div>
        </div>
      )}

      {/* ✅ Second Popup Message */}
      {showExtraPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>{extraMessage}</p>
            <button className="popup-button blue" onClick={handleSecondPopupClose}>
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
