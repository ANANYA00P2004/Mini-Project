"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, DollarSign, IndianRupee, Target, PiggyBank, ShoppingBag, Car, Home, Briefcase, Plane, Gift, Coffee, Heart } from "lucide-react"
import "./Wishlist.css"
import Layout from "./Layout"

const BASE_URL = "http://localhost:5000/api/wishlist";
// Icons mapping for different goal types
const goalIcons = {
  default: <Target size={24} />,
  shopping: <ShoppingBag size={24} />,
  car: <Car size={24} />,
  home: <Home size={24} />,
  travel: <Plane size={24} />,
  education: <Briefcase size={24} />,
  gift: <Gift size={24} />,
  entertainment: <Coffee size={24} />,
  health: <Heart size={24} />
};

const WishlistPage = () => {
  const [financialData, setFinancialData] = useState({
    income: 0,
    savings: 0,
    monthlyExpenses: 0,
    availableSavings: 0 // Track available savings after contributions
  })

  const [wishlistItems, setWishlistItems] = useState([])
  const [newGoal, setNewGoal] = useState({
    item: "",
    expectedCost: "",
    category: "default" // Default category for icons
  })
  const [contribution, setContribution] = useState({
    amount: "",
    itemId: "", // Changed from selectedItemId to match controller expectation
  })
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null) // For debugging purposes

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      fetchFinancialData(storedUserId);
      fetchWishlistItems(storedUserId);
    }
  }, []);

  const fetchFinancialData = async (userId) => {
    try {
      // Updated to match router path
      const response = await fetch(`${BASE_URL}/financial-data?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setFinancialData(data);
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Failed to load financial data");
    }
  };

  const fetchWishlistItems = async (userId) => {
    try {
      // Updated to match router path (root path)
      const response = await fetch(`${BASE_URL}?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setWishlistItems(data);
    } catch (err) {
      console.error("Error fetching wishlist items:", err);
      setError("Failed to load wishlist items");
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Updated to match router path
      const response = await fetch(`${BASE_URL}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          item: newGoal.item, 
          expectedCost: parseFloat(newGoal.expectedCost),
          category: newGoal.category 
        })
      });
      if (!response.ok) throw new Error("Failed to add goal");
      setNewGoal({ item: "", expectedCost: "", category: "default" });
      fetchWishlistItems(userId);
      setSuccess("Goal added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error adding goal:", err);
      setError("Failed to add goal");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Updated to match router path and HTTP method (PUT)
      const response = await fetch(`${BASE_URL}/contribute`, {
        method: "PUT", // Changed from POST to PUT to match router
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          itemId: contribution.itemId, // Changed key name from selectedItemId to itemId
          amount: parseFloat(contribution.amount)
        })
      });
      if (!response.ok) throw new Error("Failed to contribute");
      setContribution({ amount: "", itemId: "" });
      fetchWishlistItems(userId);
      fetchFinancialData(userId);
      setSuccess("Contribution added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error adding contribution:", err);
      setError("Failed to contribute");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    setLoading(true);
    try {
      // Updated to match router path
      const response = await fetch(`${BASE_URL}/delete/${goalId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete goal");
      fetchWishlistItems(userId);
      setSuccess("Goal deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError("Failed to delete goal");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const getGoalIcon = (category) => {
    return goalIcons[category] || goalIcons.default;
  }

  return (
    <Layout>
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p className="saved-amount-subheading">
          The money you saved could be used for your desires. <br /> Save more daily and start tracking the path towards your wishes.......
        </p>
        <div className="wishlist-savings-card">
          <PiggyBank size={32} />
          <div className="wishlist-savings-info">
            <h2>Available Savings</h2>
            <p className="wishlist-amount">₹{financialData.availableSavings.toFixed(2)}</p>
            <p className="wishlist-total-savings">Total Savings: ₹{financialData.savings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {error && <div className="wishlist-error">{error}</div>}
      {success && <div className="wishlist-success">{success}</div>}
      {debugInfo && (
        <div className="wishlist-debug">
          <p>Debug Info (will be removed in production)</p>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}

      <div className="wishlist-content">
        <div className="wishlist-add-goal">
          <h2>Add New Goal</h2>
          <form onSubmit={handleAddGoal}>
            <div className="wishlist-form-group">
              <label>Goal Name</label>
              <div className="wishlist-input-icon">
                <Target size={18} />
                <input
                  type="text"
                  value={newGoal.item}
                  onChange={(e) => setNewGoal({ ...newGoal, item: e.target.value })}
                  placeholder="What are you saving for?"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="wishlist-form-group">
              <label>Expected Cost</label>
              <div className="wishlist-input-icon">
              <IndianRupee size={18} />
                <input
                  type="number"
                  value={newGoal.expectedCost}
                  onChange={(e) => setNewGoal({ ...newGoal, expectedCost: e.target.value })}
                  placeholder="How much will it cost?"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <button type="submit" className="wishlist-button" disabled={loading}>
              <Plus size={18} />
              {loading ? "Adding..." : "Add Goal"}
            </button>
          </form>
        </div>

        <div className="wishlist-contribute">
          <h2>Contribute to Goal</h2>
          <form onSubmit={handleContribute}>
            <div className="wishlist-form-group">
              <label>Select Goal</label>
              <select
                value={contribution.itemId || ""}
                onChange={(e) => setContribution({ ...contribution, itemId: e.target.value })}
                required
                disabled={loading || wishlistItems.length === 0}
                
              >
                <option value="">Select a goal</option>
                {wishlistItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.item} (₹{item.currently_saved?.toFixed(2) || "0.00"}/₹{item.expected_cost?.toFixed(2) || "0.00"})
                  </option>
                ))}
              </select>
            </div>

            <div className="wishlist-form-group">
              <label>Amount to Contribute</label>
              <div className="wishlist-input-icon">
                <IndianRupee size={18} />
                <input
                  type="number"
                  value={contribution.amount}
                  onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
                  placeholder="How much to add?"
                  min="0.01"
                  max={financialData.availableSavings}
                  step="0.01"
                  required
                  disabled={loading || wishlistItems.length === 0}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="wishlist-button"
              disabled={loading || wishlistItems.length === 0 || !contribution.itemId}
            >
              <Plus size={18} />
              {loading ? "Adding..." : "Add Contribution"}
            </button>
          </form>
        </div>
      </div>

      <div className="wishlist-goals">
        <h2>My Goals</h2>
        {loading && wishlistItems.length === 0 ? (
          <p className="wishlist-loading">Loading your goals...</p>
        ) : wishlistItems.length === 0 ? (
          <p className="wishlist-empty">No goals added yet. Add your first goal above!</p>
        ) : (
          <div className="wishlist-goals-list">
            {wishlistItems.map((item) => {
              const progress = item.expected_cost > 0 ? (item.currently_saved / item.expected_cost) * 100 : 0

              return (
                <div key={item.id} className="wishlist-goal-card">
                  <div className="wishlist-goal-header">
                    <div className="wishlist-goal-title">
                      <div className="wishlist-goal-icon">
                        {getGoalIcon(item.category)}
                      </div>
                      <h3>{item.item}</h3>
                    </div>
                    <button 
                      className="wishlist-delete-button" 
                      onClick={() => handleDeleteGoal(item.id)}
                      disabled={loading}
                      type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="wishlist-goal-amounts">
                    <span>Saved: ₹{(item.currently_saved || 0).toFixed(2)}</span>
                    <span>Goal: ₹{(item.expected_cost || 0).toFixed(2)}</span>
                  </div>

                  <div className="wishlist-progress-container">
                    <div 
                      className="wishlist-progress-bar" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  <div className="wishlist-progress-percentage">
                    {progress.toFixed(0)}% Complete
                    {progress >= 100 && <span className="wishlist-goal-completed"> ✓ Ready to purchase!</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
    </Layout>
  )
}

export default WishlistPage