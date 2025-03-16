import React, { useState, useEffect } from 'react';
import {
  Wallet, PiggyBank, ListOrdered, Plus, X, ShoppingBag, ShoppingCart, Tv, Bus, GraduationCap, Home, Utensils, Coffee, Wifi, Gift,
  CreditCard, Phone, DollarSign, FileText, AlertCircle, Briefcase
} from 'lucide-react';
import './BudgetPlan.css';
import Layout from "./Layout";

const BASE_URL = "http://localhost:5000/api/BudgetPlan";

const budgetService = {
  getCurrentUser: async () => {
    const response = await fetch(`${BASE_URL}/user`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  createBudgetData: async (userId, field, value) => {
    // Convert to number if it's a numeric field
    if (field === 'monthly_income' || field === 'expected_savings') {
      value = Number(value);
      
      // Validate that it's a valid number
      if (isNaN(value)) {
        throw new Error(`${field} must be a valid number`);
      }
    }
    
    console.log("Sending data:", { user_id: userId, [field]: value });
  
    const response = await fetch(`${BASE_URL}/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId,
        [field]: value 
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error('Failed to create budget data');
    }
    
    return response.json();
  },
  getBudgetData: async (userId) => {
    const response = await fetch(`${BASE_URL}/budget/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch budget data');
    return response.json();
  },
  getCategories: async (userId) => {
    const response = await fetch(`${BASE_URL}/categories/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },
  getRecurringExpenses: async (userId) => {
    const response = await fetch(`${BASE_URL}/recurring-expenses/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch recurring expenses');
    return response.json();
  },
  updateBudgetData: async (userId, field, value) => {
    const response = await fetch(`${BASE_URL}/budget/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value })
    });
    if (!response.ok) throw new Error('Failed to update budget data');
    return response.json();
  },
  updateCategory: async (categoryId, limit) => {
    const response = await fetch(`${BASE_URL}/category/${categoryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_limits: limit })
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },
  addCategory: async (userId, categoryName, limit) => {
    const response = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, label: categoryName, category_limits: limit })
    });
    if (!response.ok) throw new Error('Failed to add category');
    return response.json();
  },
  updateCategoryPriority: async (categoryId, priority) => {
    const response = await fetch(`${BASE_URL}/category/${categoryId}/priority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_priority: priority })
    });
    if (!response.ok) throw new Error('Failed to update category priority');
    return response.json();
  },
  removeCategoryPriority: async (categoryId) => {
    const response = await fetch(`${BASE_URL}/category/${categoryId}/priority`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove category priority');
    return response.json();
  },
  addRecurringExpense: async (userId, category, amount) => {
    const response = await fetch(`${BASE_URL}/recurring-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, label: category, rec_limits: amount })
    });
    if (!response.ok) throw new Error('Failed to add recurring expense');
    return response.json();
  },
  removeRecurringExpense: async (expenseId) => {
    const response = await fetch(`${BASE_URL}/recurring-expenses/${expenseId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove recurring expense');
    return response.json();
  }
};



// Category icons mapping
const categoryIcons = {
  Shopping: <ShoppingBag className="budget-category-icon budget-shopping" />,
  Groceries: <ShoppingCart className="budget-category-icon budget-groceries" />,
  Entertainment: <Tv className="budget-category-icon budget-entertainment" />,
  Transport: <Bus className="budget-category-icon budget-transport" />,
  Education: <GraduationCap className="budget-category-icon budget-education" />,
  Rent: <Home className="budget-category-icon budget-rent" />,
  Food: <Utensils className="budget-category-icon budget-food" />,
  Coffee: <Coffee className="budget-category-icon budget-coffee" />,
  Internet: <Wifi className="budget-category-icon budget-internet" />,
  Gifts: <Gift className="budget-category-icon budget-gifts" />,
  EMI: <CreditCard className="budget-category-icon budget-emi" />,
  "Mobile Recharge": <Phone className="budget-category-icon budget-mobile" />,
  Insurance: <FileText className="budget-category-icon budget-insurance" />,
  Subscriptions: <DollarSign className="budget-category-icon budget-subscriptions" />,
  Utilities: <AlertCircle className="budget-category-icon budget-utilities" />,
  Investments: <Briefcase className="budget-category-icon budget-investments" />
};

const BudgetPlan = () => {
  // User state
  const [userId, setUserId] = useState('');

  // Budget state
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [expectedSavings, setExpectedSavings] = useState(0);
  const [budgetId, setBudgetId] = useState(null);

  // Category states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryLimit, setCategoryLimit] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);

  // Priority states
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [priorityCategories, setPriorityCategories] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('');

  // Recurring expenses states
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [newRecurringCategory, setNewRecurringCategory] = useState('');
  const [recurringAmount, setRecurringAmount] = useState('');
  const [showNewRecurring, setShowNewRecurring] = useState(false);

  // Fetch user ID and data on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await budgetService.getCurrentUser();
        if (user) {
          setUserId(user.id);
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        console.error("Authentication error:", error);
      }
    };
    
    getCurrentUser();
  }, []);

  // Fetch data when userId is available
  useEffect(() => {
    if (userId) {
      fetchBudgetData();
      fetchCategories();
      fetchRecurringExpenses();
    }
  }, [userId]);

  // Fetch budget data
  const fetchBudgetData = async () => {
    try {
      const data = await budgetService.getBudgetData(userId);
      if (data) {
        setBudgetId(data.id);
        setMonthlyIncome(data.monthly_income || "");
        setExpectedSavings(data.expected_savings || "");
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const data = await budgetService.getCategories(userId);
      setCategories(data || []);
      
      // Set priority categories
      const priorityData = data?.filter(cat => cat.category_priority !== null) || [];
      setPriorityCategories(priorityData.sort((a, b) => 
        (a.category_priority || 0) - (b.category_priority || 0))
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch recurring expenses
  const fetchRecurringExpenses = async () => {
    try {
      const data = await budgetService.getRecurringExpenses(userId);
      setRecurringExpenses(data || []);
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    }
  };

  // Handle monthly income changes
  const handleMonthlyIncomeChange = (e) => {
    setMonthlyIncome(e.target.value);
  };
  
  // Handle expected savings changes
  const handleExpectedSavingsChange = (e) => {
    setExpectedSavings(e.target.value);
  };
  
  // Update budget data
  const updateBudgetData = async (field, value) => {
    try {
      console.log(`Updating budget: field=${field}, value=${value}, userId=${userId}, budgetId=${budgetId}`);
  
      // Validate inputs
      if (!value.toString().trim()) {
        alert(`Please enter a valid value for ${field.replace("_", " ")}`);
        return;
      }
  
      if (!userId) {
        alert("User ID is missing. Please log in again.");
        return;
      }
  
      // Convert to number for numeric fields
      const processedValue = (field === 'monthly_income' || field === 'expected_savings') 
        ? Number(value) 
        : value;
      
      console.log(`Processed value: ${processedValue}, type: ${typeof processedValue}`);
  
      let result;
      
      if (budgetId) {
        // Update existing budget
        console.log("Updating existing budget...");
        result = await budgetService.updateBudgetData(userId, field, processedValue);
      } else {
        // Create new budget
        console.log("Creating new budget...");
        result = await budgetService.createBudgetData(userId, field, processedValue);
        setBudgetId(result.id);
      }
  
      console.log("Operation successful:", result);
      alert(`${field.replace("_", " ")} updated successfully!`);
      
      // Refresh budget data
      fetchBudgetData();
    } catch (error) {
      console.error("Error managing budget:", error);
      alert(`Failed to ${budgetId ? 'update' : 'create'} budget. Please try again.`);
    }
  };
  

  // Add or update category
  const handleAddCategory = async () => {
    const categoryName = showNewCategory ? newCategory : selectedCategory;
    
    if (!categoryName || !categoryLimit) {
      alert('Please enter a category name and limit');
      return;
    }

    try {
      // Check if the category already exists
      const existingCategory = categories.find(
        cat => cat.label.toLowerCase() === categoryName.toLowerCase()
      );

      if (existingCategory) {
        await budgetService.updateCategory(existingCategory.id, parseFloat(categoryLimit));
      } else {
        await budgetService.addCategory(userId, categoryName, parseFloat(categoryLimit));
      }

      // Reset form and fetch updated categories
      setSelectedCategory('');
      setNewCategory('');
      setCategoryLimit('');
      setShowNewCategory(false);
      fetchCategories();
    } catch (error) {
      console.error('Error managing category:', error);
      alert('Failed to save category. Please try again.');
    }
  };

  // Handle adding a priority
  const handleAddPriority = async () => {
    if (!selectedPriority) return;

    try {
      // Find the selected category
      const selectedCat = categories.find(cat => cat.id.toString() === selectedPriority);
      if (!selectedCat) return;

      // Calculate the next priority number
      const nextPriority = priorityCategories.length + 1;

      await budgetService.updateCategoryPriority(selectedCat.id, nextPriority);

      setSelectedPriority('');
      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error adding priority:', error);
      alert('Failed to add priority. Please try again.');
    }
  };

  // Handle removing a priority
  const handleRemovePriority = async (categoryId) => {
    try {
      await budgetService.removeCategoryPriority(categoryId);
      
      // Re-order remaining priorities
      const updatedPriorities = priorityCategories
        .filter(cat => cat.id !== categoryId)
        .map((cat, index) => ({
          ...cat,
          category_priority: index + 1
        }));

      // Update each category with new priority
      for (const cat of updatedPriorities) {
        await budgetService.updateCategoryPriority(cat.id, cat.category_priority);
      }

      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error managing priorities:', error);
      alert('Failed to update priorities. Please try again.');
    }
  };

  // Add recurring expense
  const handleAddRecurringCategory = async () => {
    if (!newRecurringCategory || !recurringAmount) {
      alert('Please enter both category name and amount');
      return;
    }

    try {
      await budgetService.addRecurringExpense(
        userId, 
        newRecurringCategory, 
        parseFloat(recurringAmount)
      );
      
      // Reset form fields
      setShowNewRecurring(false);
      setNewRecurringCategory('');
      setRecurringAmount('');
      
      // Refresh the list from the database
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Error adding recurring expense:', error);
      alert('Failed to add recurring expense. Please try again.');
    }
  };

  // Handle removing a recurring expense
  const handleRemoveRecurringExpense = async (expenseId) => {
    try {
      await budgetService.removeRecurringExpense(expenseId);
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Error removing recurring expense:', error);
      alert('Failed to remove expense. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="budget-container">
        {/* Module 1: Monthly Income & Expected Savings */}
        <section className="budget-income-section">
          <h2>Income & Savings</h2>
          <div className="budget-cards">
            {/* Monthly Income Card */}
            <div className="budget-card">
              <Wallet className="budget-card-icon" />
              <h3>Monthly Income</h3>
              <input
                type="number"
                value={monthlyIncome}
                onChange={handleMonthlyIncomeChange}
                placeholder="Enter monthly income"
                className="budget-input"
              />
              <button
                className="enter-button"
                onClick={() => updateBudgetData("monthly_income", monthlyIncome)}
              >
                Enter
              </button>
            </div>

            {/* Expected Savings Card */}
            <div className="budget-card">
              <PiggyBank className="budget-card-icon" />
              <h3>Expected Savings</h3>
              <input
                type="number"
                value={expectedSavings}
                onChange={handleExpectedSavingsChange}
                placeholder="Enter savings goal"
                className="budget-input"
              />
              <button
                className="enter-button"
                onClick={() => updateBudgetData("expected_savings", expectedSavings)}
              >
                Enter
              </button>
            </div>

            <div className="budget-card priority-card">
              <ListOrdered className="budget-card-icon" />
              <h3>Category Priorities</h3>
              <button 
                className="toggle-button"
                onClick={() => setShowPriorityModal(true)}
              >
                Set Priorities
              </button>
            </div>
          </div>

          {/* Priority Categories Display */}
          {priorityCategories.length > 0 && (
            <div className="priority-categories">
              <h3>Priority Categories</h3>
              <div className="priority-tags">
                {priorityCategories.map((category) => (
                  <div key={category.id} className="priority-tag">
                    {categoryIcons[category.label] || <ShoppingBag className="budget-category-icon" />}
                    <span>{category.label}</span>
                    <span className="priority-number">Priority {category.category_priority}</span>
                    <button 
                      className="remove-priority" 
                      onClick={() => handleRemovePriority(category.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Priority Modal */}
          {showPriorityModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Select Priority Categories</h3>
                <p>Current priority: {priorityCategories.length + 1}</p>
                
                <select 
                  value={selectedPriority} 
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="budget-select"
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter(cat => cat.category_priority === null)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))
                  }
                </select>
                
                <div className="modal-buttons">
                  <button 
                    className="budget-add-btn" 
                    onClick={handleAddPriority}
                    disabled={!selectedPriority}
                  >
                    Add Priority
                  </button>
                  <button 
                    className="budget-cancel-btn" 
                    onClick={() => setShowPriorityModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Module 2: Expense Limits Management */}
        <section className="budget-category-limits">
          <h2>Set Your Limits for Expenses</h2>
          <div className="budget-category-input">
            {!showNewCategory ? (
              <>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'new') {
                      setShowNewCategory(true);
                    } else {
                      setSelectedCategory(value);
                    }
                  }}
                  className="budget-select"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.label}>{category.label}</option>
                  ))}
                  <option value="new">+ Add New Category</option>
                </select>
              </>
            ) : (
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                className="budget-input"
              />
            )}
            
            <input
              type="number"
              value={categoryLimit}
              onChange={(e) => setCategoryLimit(e.target.value)}
              placeholder="Enter limit"
              className="budget-input"
            />
            
            <button onClick={handleAddCategory} className="budget-add-btn">
              <Plus size={20} /> {showNewCategory ? 'Add New Category' : 'Set Limit'}
            </button>
            
            {showNewCategory && (
              <button 
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategory('');
                }} 
                className="budget-cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
          
          <div className="budget-categories-scroll">
            <div className="budget-categories-list">
              {categories
                .filter(category => category.category_limits !== null)
                .map((category) => (
                  <div key={category.id} className="budget-category-item">
                    {categoryIcons[category.label] || <ShoppingBag className="budget-category-icon" />}
                    <span>{category.label}</span>
                    <span className="budget-limit">${category.category_limits}</span>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Module 3: Recurring Expenses Management */}
        <section className="recurring-expenses-container">
          <h2>Recurring Expenses</h2>
          
          {!showNewRecurring ? (
            <button onClick={() => setShowNewRecurring(true)} className="budget-add-btn">
              Add Recurring Expense
            </button>
          ) : (
            <div className="new-recurring-form">
              <input
                type="text"
                value={newRecurringCategory}
                onChange={(e) => setNewRecurringCategory(e.target.value)}
                placeholder="Enter category name"
                className="budget-input"
              />
              
              <input
                type="number"
                value={recurringAmount}
                onChange={(e) => setRecurringAmount(e.target.value)}
                placeholder="Enter amount"
                className="budget-input"
              />
              
              <div className="button-group">
                <button onClick={handleAddRecurringCategory} className="budget-submit-btn">
                  Add Expense
                </button>
                
                <button 
                  onClick={() => {
                    setShowNewRecurring(false);
                    setNewRecurringCategory('');
                    setRecurringAmount('');
                  }} 
                  className="budget-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="recurring-expenses-list">
            {recurringExpenses.length === 0 ? (
              <p className="no-expenses-message">No recurring expenses added yet</p>
            ) : (
              recurringExpenses.map((expense) => (
                <div key={expense.id} className="recurring-expense-item">
                  <span className="expense-icon">
                    {categoryIcons[expense.label] || '💰'}
                  </span>
                  <span className="expense-label">{expense.label}</span>
                  <span className="expense-amount">${expense.rec_limits}</span>
                  <button 
                    onClick={() => handleRemoveRecurringExpense(expense.id)} 
                    className="delete-expense-btn"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default BudgetPlan;