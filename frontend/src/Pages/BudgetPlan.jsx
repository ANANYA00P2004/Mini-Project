import React, { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";
import {Wallet,PiggyBank,ListOrdered,Plus,X,ShoppingBag,ShoppingCart,Tv,Bus,GraduationCap,Home,Utensils,Coffee,Wifi,Gift,
  CreditCard,Phone, DollarSign, FileText, AlertCircle, Briefcase} from 'lucide-react';
import './BudgetPlan.css';
import Layout from "./Layout"
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
// Extended icons list to include recurring expenses categories
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
  // User ID (you would get this from your auth context/provider)
  const [userId, setUserId] = useState('');

  // Budget state
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [expectedSavings, setExpectedSavings] = useState('');
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

  // Fetch user ID on component mount
  // Get user session and set userId
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) setUserId(session.user.id);
    else console.error("User not authenticated");
  });
}, []);

// Insert or update budget data
// const updateBudgetData = async (field, value) => {
//   if (!userId) return console.error("User ID is missing");

//   try {
//     const { error } = await supabase
//       .from("Budget")
//       .upsert(
//         { user_id: userId, [field]: parseFloat(value) || 0 },
//         { onConflict: ["user_id"] }
//       );

//     if (error) console.error("Error updating budget:", error);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };
const updateBudgetData = async (field, value) => {
  if (!userId) {
    console.error("User ID is missing");
    alert("User authentication failed. Please log in again.");
    return;
  }

  // Validate input: Ensure value is not empty
  if (!value.trim()) {
    alert(`Please enter a valid value for ${field.replace("_", " ")}`);
    return;
  }

  try {
    const { error } = await supabase
      .from("Budget")
      .upsert(
        { user_id: userId, [field]: parseFloat(value) || 0 },
        { onConflict: ["user_id"] }
      );

    if (error) {
      console.error("Error updating budget:", error);
      alert("Failed to update budget. Please try again.");
    } else {
      alert(`${field.replace("_", " ")} updated successfully!`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An unexpected error occurred. Please try again.");
  }
};

  // useEffect(() => {
  //   const fetchUserSession = async () => {
  //     const { data: { session }, error } = await supabase.auth.getSession();
  //     if (session) {
  //       setUserId(session.user.id);
  //     } else {
  //       console.error("User not authenticated:", error);
  //     }
  //   };
  //   fetchUserSession();
  // }, []);
  
  // // Fetch budget data when userId is available
  // useEffect(() => {
  //   if (userId) {
  //     fetchBudgetData();
  //     fetchCategories();
  //     fetchRecurringExpenses();
  //   }
  // }, [userId]);
  
  // // Fetch existing budget data
  // const fetchBudgetData = async () => {
  //   if (!userId) return;
  //   try {
  //     const { data, error } = await supabase
  //       .from("Budget")
  //       .select("id, monthly_income, expected_savings")
  //       .eq("user_id", userId)
  //       .single();
  
  //     if (error && error.code !== "PGRST116") {
  //       console.error("Error fetching budget data:", error);
  //       return;
  //     }
  
  //     if (data) {
  //       setBudgetId(data.id);
  //       setMonthlyIncome(data.monthly_income || "");
  //       setExpectedSavings(data.expected_savings || "");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching budget data:", error);
  //   }
  // };
  
  // // Update or insert budget data
  // const updateBudgetData = async (field, value) => {
  //   if (!userId) {
  //     console.error("User ID is missing, cannot update budget data.");
  //     return;
  //   }
    
  //   const numericValue = parseFloat(value) || 0;
    
  //   try {
  //     let { data: existingBudget, error: fetchError } = await supabase
  //       .from("Budget")
  //       .select("id")
  //       .eq("user_id", userId)
  //       .single();
  
  //     if (fetchError && fetchError.code !== "PGRST116") {
  //       console.error("Error checking existing budget:", fetchError);
  //     }
  
  //     if (existingBudget) {
  //       // If entry exists, update the specific field
  //       const { error: updateError } = await supabase
  //         .from("Budget")
  //         .update({ [field]: numericValue })
  //         .eq("user_id", userId);
  
  //       if (updateError) {
  //         console.error("Error updating budget:", updateError);
  //         return;
  //       }
  //     } else {
  //       // If no entry exists, insert a new row
  //       const { data, error: insertError } = await supabase
  //         .from("Budget")
  //         .insert([
  //           {
  //             user_id: userId,
  //             monthly_income: field === "monthly_income" ? numericValue : 0,
  //             expected_savings: field === "expected_savings" ? numericValue : 0,
  //           },
  //         ])
  //         .select();
  
  //       if (insertError) {
  //         console.error("Error inserting budget:", insertError);
  //         return;
  //       }
  
  //       if (data && data.length > 0) {
  //         setBudgetId(data[0].id);
  //       }
  //     }
  //     // Update local state to reflect changes
  //     if (field === "monthly_income") setMonthlyIncome(value);
  //     if (field === "expected_savings") setExpectedSavings(value);
  //   } catch (error) {
  //     console.error("Error updating budget:", error);
  //   }
  // };
  const handleMonthlyIncomeChange = (e) => {
    setMonthlyIncome(e.target.value);
  };
  
  const handleExpectedSavingsChange = (e) => {
    setExpectedSavings(e.target.value);
  };
  

  // Fetch categories
  const fetchCategories = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('Categories')
        .select('*')
        .eq('user_id', userId)
        .order('category_priority', { ascending: true, nullsLast: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

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
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('Recurring')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching recurring expenses:', error);
        return;
      }

      setRecurringExpenses(data || []);
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
    }
  };

  // Add or update category
  const handleAddCategory = async () => {
    if (!userId) return;
    
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
        // Update existing category
        const { error } = await supabase
          .from('Categories')
          .update({ category_limits: parseFloat(categoryLimit) })
          .eq('id', existingCategory.id);

        if (error) {
          console.error('Error updating category:', error);
          return;
        }
      } else {
        // Create new category
        const { error } = await supabase
          .from('Categories')
          .insert([{
            user_id: userId,
            label: categoryName,
            category_limits: parseFloat(categoryLimit),
            category_priority: null
          }]);

        if (error) {
          console.error('Error adding category:', error);
          return;
        }
      }

      // Reset form and fetch updated categories
      setSelectedCategory('');
      setNewCategory('');
      setCategoryLimit('');
      setShowNewCategory(false);
      fetchCategories();
    } catch (error) {
      console.error('Error managing category:', error);
    }
  };

  // Handle adding a priority
  const handleAddPriority = async () => {
    if (!userId || !selectedPriority) return;

    try {
      // Find the selected category
      const selectedCat = categories.find(cat => cat.id.toString() === selectedPriority);
      if (!selectedCat) return;

      // Calculate the next priority number
      const nextPriority = priorityCategories.length + 1;

      // Update the category with the new priority
      const { error } = await supabase
        .from('Categories')
        .update({ category_priority: nextPriority })
        .eq('id', selectedCat.id);

      if (error) {
        console.error('Error updating priority:', error);
        return;
      }

      setSelectedPriority('');
      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error adding priority:', error);
    }
  };

  // Handle removing a priority
  const handleRemovePriority = async (categoryId) => {
    if (!userId) return;

    try {
      // Remove priority for this category
      const { error } = await supabase
        .from('Categories')
        .update({ category_priority: null })
        .eq('id', categoryId);

      if (error) {
        console.error('Error removing priority:', error);
        return;
      }

      // Re-order remaining priorities
      const updatedPriorities = priorityCategories
        .filter(cat => cat.id !== categoryId)
        .map((cat, index) => ({
          ...cat,
          category_priority: index + 1
        }));

      // Update each category with new priority
      for (const cat of updatedPriorities) {
        const { error } = await supabase
          .from('Categories')
          .update({ category_priority: cat.category_priority })
          .eq('id', cat.id);

        if (error) {
          console.error('Error reordering priorities:', error);
        }
      }

      fetchCategories(); // Refresh the categories list
    } catch (error) {
      console.error('Error managing priorities:', error);
    }
  };

  // Add recurring expense with direct insertion to the Recurring table
  const handleAddRecurringCategory = async () => {
    if (!newRecurringCategory || !recurringAmount) {
      alert('Please enter both category name and amount');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Recurring')
        .insert([{
          user_id: userId,
          label: newRecurringCategory,
          rec_limits: parseFloat(recurringAmount)
        }])
        .select();

      if (error) {
        console.error('Error adding recurring expense:', error);
        return;
      }

      // Update local state to show the new expense immediately
      if (data && data[0]) {
        setRecurringExpenses([...recurringExpenses, data[0]]);
      }
      
      // Reset form fields
      setShowNewRecurring(false);
      setNewRecurringCategory('');
      setRecurringAmount('');
      
      // Refresh the list from the database to ensure consistency
      fetchRecurringExpenses();
    } catch (error) {
      console.error('Error adding recurring expense:', error);
    }
  };

  // Handle removing a recurring expense
  const handleRemoveRecurringExpense = async (expenseId) => {
    try {
      const { error } = await supabase
        .from('Recurring')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Error removing recurring expense:', error);
        return;
      }

      // Update local state 
      setRecurringExpenses(recurringExpenses.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error removing recurring expense:', error);
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