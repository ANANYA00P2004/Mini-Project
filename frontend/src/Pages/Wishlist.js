"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Trash2, Plus, DollarSign,IndianRupee, Target, PiggyBank, ShoppingBag, Car, Home, Briefcase, Plane, Gift, Coffee, Heart } from "lucide-react"
import "./Wishlist.css"
import Layout from "./Layout"

// Make sure your Supabase URL and key are correctly defined in your environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

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
    selectedItemId: "",
  })
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [debugInfo, setDebugInfo] = useState(null) // For debugging purposes

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Auth error:", error.message)
          setError("Authentication error: " + error.message)
          return
        }
        
        if (user) {
          console.log("User authenticated:", user.id)
          setUserId(user.id)
          await fetchFinancialData(user.id)
          await fetchWishlistItems(user.id)
        } else {
          console.log("No user found")
          setError("No authenticated user found")
        }
      } catch (error) {
        console.error("Error getting user:", error)
        setError("Failed to authenticate user. Please try logging in again.")
      }
    }

    getCurrentUser()
  }, [])

  // Function to calculate total contributions from wishlist items
  const calculateTotalContributions = (items) => {
    return items.reduce((total, item) => total + (item.currently_saved || 0), 0);
  }

  // Function to fetch aggregated financial data
  const fetchFinancialData = async (userId) => {
    try {
      // 1️⃣ Fetch monthly income from the Budget table
      const { data: budgetData, error: budgetError } = await supabase
        .from("Budget")
        .select("monthly_income")
        .eq("user_id", userId)
        .single()

      if (budgetError && budgetError.code !== 'PGRST116') {
        console.error("Budget fetch error:", budgetError)
        throw budgetError
      }

      const monthlyIncome = budgetData?.monthly_income || 0

      // 2️⃣ Aggregate total income from Transactions table
      const { data: incomeData, error: incomeError } = await supabase
        .from("Transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "income")

      if (incomeError) {
        console.error("Income fetch error:", incomeError)
        throw incomeError
      }

      const totalIncome = incomeData?.reduce((acc, item) => acc + item.amount, 0) || 0

      // 3️⃣ Aggregate total expenses from Transactions table
      const { data: expenseData, error: expenseError } = await supabase
        .from("Transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "expense")

      if (expenseError) {
        console.error("Expense fetch error:", expenseError)
        throw expenseError
      }

      const totalExpenses = expenseData?.reduce((acc, item) => acc + item.amount, 0) || 0

      // 4️⃣ Calculate financial values
      const income = monthlyIncome + totalIncome
      const savings = income - totalExpenses

      // 5️⃣ Fetch wishlist items to calculate total contributions
      const { data: wishlistData } = await supabase
        .from("Wishlist")
        .select("currently_saved")
        .eq("user_id", userId)

      const totalContributions = wishlistData?.reduce((total, item) => total + (item.currently_saved || 0), 0) || 0
      
      // Calculate available savings (total savings minus contributions)
      const availableSavings = savings - totalContributions

      // 6️⃣ Update the state with calculated data
      setFinancialData({
        income,
        savings,
        monthlyExpenses: totalExpenses,
        availableSavings
      })
    } catch (error) {
      console.error("Error fetching financial data:", error)
      setError("Failed to load financial data. Please refresh the page.")
    }
  }

  const fetchWishlistItems = async (userId) => {
    try {
      setLoading(true)
      console.log("Fetching wishlist items for user:", userId)
      
      const { data, error } = await supabase
        .from("Wishlist")
        .select("*")
        .eq("user_id", userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Wishlist fetch error:", error)
        throw error
      }
      
      console.log("Wishlist items fetched:", data)
      setWishlistItems(data || [])
      
      // Update available savings based on contributions
      const totalContributions = calculateTotalContributions(data || [])
      setFinancialData(prev => ({
        ...prev,
        availableSavings: prev.savings - totalContributions
      }))
      
      // Only set default selected item if no item is selected and there are items
      if (data && data.length > 0 && !contribution.selectedItemId) {
        setContribution((prev) => ({
          ...prev,
          selectedItemId: data[0].id,
        }))
      }
    } catch (error) {
      console.error("Error fetching wishlist items:", error)
      setError("Failed to load wishlist items. Please refresh the page.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setDebugInfo(null)

    if (!newGoal.item || !newGoal.expectedCost) {
      setError("Please fill in all required fields")
      return
    }

    if (!userId) {
      setError("User not authenticated. Please log in again.")
      return
    }

    try {
      setLoading(true)
      console.log("Adding new goal:", newGoal, "for user:", userId)
      
      // Convert expected cost to number and ensure it's valid
      const expectedCost = Number.parseFloat(newGoal.expectedCost)
      if (isNaN(expectedCost) || expectedCost <= 0) {
        setError("Please enter a valid cost amount")
        setLoading(false)
        return
      }
      
      // Create the new item object
      const newItem = {
        user_id: userId,
        item: newGoal.item,
        expected_cost: expectedCost,
        currently_saved: 0,
        //category: newGoal.category || "default"
      }
      
      console.log("Inserting new item:", newItem)
      
      // Insert new wishlist item
      const { data, error } = await supabase
        .from("Wishlist")
        .insert([newItem])
        .select()

      if (error) {
        console.error("Insert error:", error)
        throw error
      }

      console.log("Insert successful, inserted data:", data)
      
      // Refresh the list to get the newly added item
      await fetchWishlistItems(userId)
      
      // Refresh financial data to update available savings
      await fetchFinancialData(userId)

      // Clear form
      setNewGoal({
        item: "",
        expectedCost: "",
        category: "default"
      })
      
      setSuccess("Goal added successfully!")
      console.log("Form cleared, goal added successfully")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error adding goal:", error)
      setError("Failed to add new goal: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }
  const handleContribute = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setDebugInfo(null);
  
    // ✅ Ensure the contribution amount and goal are selected
    if (!contribution.amount || !contribution.selectedItemId) {
      setError("Please select a goal and enter an amount");
      return;
    }
  
    if (!userId) {
      setError("User not authenticated. Please log in again.");
      return;
    }
  
    try {
      setLoading(true);
      console.log("Contributing to item ID:", contribution.selectedItemId);
  
      // ✅ Fetch the current goal directly from the database to avoid stale state
      const { data: currentGoal, error: goalFetchError } = await supabase
        .from("Wishlist")
        .select("*")
        .eq("id", contribution.selectedItemId)
        .single();
  
      if (goalFetchError || !currentGoal) {
        console.error("Error fetching goal from DB:", goalFetchError);
        setError("Selected goal not found");
        setLoading(false);
        return;
      }
  
      console.log("Goal from DB:", currentGoal);
  
      // ✅ Convert contribution amount to float
      const contributionAmount = Number.parseFloat(contribution.amount);
      if (isNaN(contributionAmount) || contributionAmount <= 0) {
        setError("Please enter a valid contribution amount");
        setLoading(false);
        return;
      }
  
      // ✅ Check if contribution exceeds available savings
      if (contributionAmount > financialData.availableSavings) {
        setError(`Contribution exceeds available savings of $${financialData.availableSavings.toFixed(2)}`);
        setLoading(false);
        return;
      }
  
      // ✅ Calculate new saved amount
      const currentSavedAmount = currentGoal.currently_saved || 0;
      const newSavedAmount = currentSavedAmount + contributionAmount;
  
      console.log("Current saved amount:", currentSavedAmount);
      console.log("Contribution amount:", contributionAmount);
      console.log("New saved amount:", newSavedAmount);
  
      // ✅ Update the goal with the new saved amount
      const { error: updateError } = await supabase
        .from("Wishlist")
        .update({
          currently_saved: newSavedAmount,
         // last_contribution_date: new Date().toISOString(),
        })
        .eq("id", contribution.selectedItemId);
  
      if (updateError) {
        console.error("Contribution update error:", updateError);
        throw updateError;
      }
  
      console.log("Goal updated successfully.");
  
      // ✅ Update financial data in state immediately
      setFinancialData((prev) => ({
        ...prev,
        availableSavings: prev.availableSavings - contributionAmount,
      }));
  
      // ✅ Update the wishlist locally for immediate UI refresh
      setWishlistItems((prev) =>
        prev.map((item) =>
          item.id === contribution.selectedItemId
            ? { ...item, currently_saved: newSavedAmount }
            : item
        )
      );
  
      // ✅ Refresh data from the database to avoid stale state issues
      await Promise.all([fetchWishlistItems(userId), fetchFinancialData(userId)]);
  
      // ✅ Clear the form but retain the selected goal
      setContribution({
        amount: "",
        selectedItemId: contribution.selectedItemId,
      });
  
      setSuccess("Contribution added successfully!");
  
      // ✅ Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Error contributing to goal:", error);
      setError("Failed to add contribution: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteGoal = async (itemId) => {
    if (!userId) {
      setError("User not authenticated. Please log in again.")
      return
    }
    
    try {
      setLoading(true)
      console.log("Deleting goal:", itemId)
      
      // Get the item to be deleted to restore the savings
      const item = wishlistItems.find(item => item.id === itemId)
      const amountToRestore = item ? item.currently_saved || 0 : 0
      
      // Delete from database
      const { error } = await supabase
        .from("Wishlist")
        .delete()
        .eq("id", itemId)

      if (error) {
        console.error("Delete error:", error)
        throw error
      }

      console.log("Delete successful, refreshing list")
      
      // Restore the available savings
      setFinancialData(prev => ({
        ...prev,
        availableSavings: prev.availableSavings + amountToRestore
      }))
      
      // Update local state immediately
      setWishlistItems(prev => prev.filter(item => item.id !== itemId))
      
      // Reset selected item if needed
      if (contribution.selectedItemId === itemId) {
        const remainingItems = wishlistItems.filter(item => item.id !== itemId)
        setContribution(prev => ({
          ...prev,
          selectedItemId: remainingItems.length > 0 ? remainingItems[0].id : ""
        }))
      }
      
      // Refresh the list after deletion
      await fetchWishlistItems(userId)
      
      // Refresh financial data to ensure consistency
      await fetchFinancialData(userId)
      
      setSuccess("Goal deleted successfully!")
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error deleting goal:", error)
      setError("Failed to delete goal: " + (error.message || "Unknown error"))
    } finally {
      setLoading(false)
    }
  }

  // Get the appropriate icon for a goal category
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
                value={contribution.selectedItemId ||"" }
                onChange={(e) => setContribution({ ...contribution, selectedItemId: e.target.value })}
                required
                disabled={loading || wishlistItems.length === 0}
                
              >
                <option value=""  >Select a goal</option>
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
              disabled={loading || wishlistItems.length === 0 || !contribution.selectedItemId}
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