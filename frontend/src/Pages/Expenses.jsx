"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Minus,
  ShoppingBag,
  ShoppingCart,
  Film,
  Bus,
  BookOpen,
  Home,
  Coffee,
  Utensils,
  Wifi,
  Gift,
} from "lucide-react"
import "./Expenses.css"
import Layout from "./Layout"

export default function Expenses() {
  // Base URL for API endpoints
  const BASE_URL = "http://localhost:5000/api/expenses";
  
  // Category icons mapping
  const categoryIcons = {
    shopping: <ShoppingBag className="category-icon shopping" />,
    groceries: <ShoppingCart className="category-icon groceries" />,
    entertainment: <Film className="category-icon entertainment" />,
    transport: <Bus className="category-icon transport" />,
    education: <BookOpen className="category-icon education" />,
    rent: <Home className="category-icon rent" />,
    food: <Utensils className="category-icon food" />,
    coffee: <Coffee className="category-icon coffee" />,
    internet: <Wifi className="category-icon internet" />,
    gifts: <Gift className="category-icon gifts" />,
  }

  // States
  const [categories, setCategories] = useState([])
  
  // State for priority categories
  const [priorityCategories, setPriorityCategories] = useState([])
  const [showPriorityPopup, setShowPriorityPopup] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState("")
  const [priorityCounter, setPriorityCounter] = useState(1)

  // State for expense form
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [newExpense, setNewExpense] = useState({
    category_id: "",
    amount: "",
    date: "",
    description: "",
    type: "expense"
  })

  // State for income form
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [newIncome, setNewIncome] = useState({
    category_id: "",
    amount: "",
    date: "",
    description: "",
    type: "income"
  })

  // State for transactions
  const [transactions, setTransactions] = useState([])

  // State for filters
  const [filters, setFilters] = useState({
    amount: "",
    date: "",
    description: "",
  })

  // State for financial data
  const [financialData, setFinancialData] = useState({
    income: 0,
    savings: 0,
    monthlyExpenses: 0,
  })

  // Get the user ID from localStorage
  const [userId, setUserId] = useState(null)

  // Initialize user ID from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      fetchFinancialData(storedUserId);
      fetchCategories(storedUserId);
      fetchTransactions(storedUserId);
    }
  }, []);

  // Fetch financial data
  const fetchFinancialData = async (uid) => {
    try {
      const response = await fetch(`${BASE_URL}/financial-data/${uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch financial data');
      }
      const data = await response.json();
      setFinancialData(data);
    } catch (error) {
      console.error("Error fetching financial data:", error);
    }
  }

  // Fetch categories
  const fetchCategories = async (uid) => {
    try {
      const response = await fetch(`${BASE_URL}/categories/${uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Fetch transactions
  const fetchTransactions = async (uid) => {
    try {
      const response = await fetch(`${BASE_URL}/transactions/${uid}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const transactionsData = await response.json();
      
      // Enhance transaction data with category information
      const enhancedTransactions = transactionsData.map((transaction) => {
        const category = categories.find(cat => cat.id === transaction.category_id);
        return {
          ...transaction,
          category: category ? category.label : "Uncategorized"
        };
      });
      
      setTransactions(enhancedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }

  // Handle expense form changes
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: value
    });
  }

  // Handle income form changes
  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    setNewIncome({
      ...newIncome,
      [name]: value
    });
  }

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  }

  // Handle adding new expense
  const handleAddExpense = async () => {
    try {
      if (!newExpense.category_id || !newExpense.amount || !newExpense.date) {
        alert("Please fill in all required fields");
        return;
      }

      const response = await fetch(`${BASE_URL}/add-expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...newExpense
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      // Reset form and refresh data
      setNewExpense({
        category_id: "",
        amount: "",
        date: "",
        description: "",
        type: "expense"
      });
      setShowExpenseForm(false);
      
      // Refresh data
      fetchFinancialData(userId);
      fetchTransactions(userId);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please try again.");
    }
  }

  // Handle adding new income
  const handleAddIncome = async () => {
    try {
      if (!newIncome.category_id || !newIncome.amount || !newIncome.date) {
        alert("Please fill in all required fields");
        return;
      }

      const response = await fetch(`${BASE_URL}/add-income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...newIncome
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add income');
      }

      // Reset form and refresh data
      setNewIncome({
        category_id: "",
        amount: "",
        date: "",
        description: "",
        type: "income"
      });
      setShowIncomeForm(false);
      
      // Refresh data
      fetchFinancialData(userId);
      fetchTransactions(userId);
    } catch (error) {
      console.error("Error adding income:", error);
      alert("Failed to add income. Please try again.");
    }
  }

  // Effect to update transactions when categories change
  useEffect(() => {
    if (userId && categories.length > 0) {
      fetchTransactions(userId);
    }
  }, [categories, userId]);

  // Filter transactions based on filters 
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (filters.amount ? transaction.amount.toString().includes(filters.amount) : true) &&
      (filters.date ? transaction.date.includes(filters.date) : true) &&
      (filters.description ? transaction.description.toLowerCase().includes(filters.description.toLowerCase()) : true)
    );
  });

  return (
    <Layout>
      <div className="expenses-container">
        {/* Financial Overview Section */}
        <section className="financial-overview">
          <h2>Financial Overview</h2>
          <div className="overview-content">
            <div className="financial-cards">
              <div className="card income-card">
                <h3>Total Income</h3>
                <p className="amount">₹{financialData.income}</p>
              </div>
              <div className="card savings-card">
                <h3>Total Savings</h3>
                <p className="amount">₹{financialData.savings}</p>
              </div>
            </div>
            <div className="priority-section">
              <div className="card priority-card">
                <h3>Monthly Expenses</h3>
                <p className="amount">₹{financialData.monthlyExpenses}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Add Expenses Section */}
        <section className="add-expenses">
          <h2>Add Your Expenses</h2>
          <div className="expense-cards">
            <div className="card add-card" onClick={() => setShowExpenseForm(true)}>
              <Minus size={40} />
              <p>Add Expense</p>
            </div>
            <div className="card minus-card" onClick={() => setShowIncomeForm(true)}>
              <Plus size={40} />
              <p>Add Income</p>
            </div>
          </div>

          {/* Expense Form */}
          {showExpenseForm && (
            <div className="popup-overlay">
              <div className="popup expense-form">
                <h3>Add New Expense</h3>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category_id" value={newExpense.category_id} onChange={handleExpenseChange}>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={newExpense.amount}
                    onChange={handleExpenseChange}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={newExpense.date} onChange={handleExpenseChange} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newExpense.description}
                    onChange={handleExpenseChange}
                    placeholder="Enter description"
                  />
                </div>
                <div className="popup-buttons">
                  <button className="add-button" onClick={handleAddExpense}>
                    Add Expense
                  </button>
                  <button className="cancel-button" onClick={() => setShowExpenseForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Income Form */}
          {showIncomeForm && (
            <div className="popup-overlay">
              <div className="popup expense-form">
                <h3>Add New Income</h3>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category_id" value={newIncome.category_id} onChange={handleIncomeChange}>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={newIncome.amount}
                    onChange={handleIncomeChange}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={newIncome.date} onChange={handleIncomeChange} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newIncome.description}
                    onChange={handleIncomeChange}
                    placeholder="Enter description"
                  />
                </div>
                <div className="popup-buttons">
                  <button className="add-button" onClick={handleAddIncome}>
                    Add Income
                  </button>
                  <button className="cancel-button" onClick={() => setShowIncomeForm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Transaction History Section */}
        <section className="transaction-history">
          <h2>Transaction History</h2>

          {/* Filters */}
          <div className="filters">
            <div className="filter-group">
              <label>Filter by Amount</label>
              <input
                type="text"
                name="amount"
                value={filters.amount}
                onChange={handleFilterChange}
                placeholder="Filter by amount"
              />
            </div>
            <div className="filter-group">
              <label>Filter by Date</label>
              <input
                type="text"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="filter-group">
              <label>Filter by Description</label>
              <input
                type="text"
                name="description"
                value={filters.description}
                onChange={handleFilterChange}
                placeholder="Filter by description"
              />
            </div>
          </div>

          {/* Transactions List */}
          <div className="transactions-list">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                  <div className="transaction-icon">
                    {categoryIcons[transaction.category.toLowerCase()] || <ShoppingBag className="category-icon default" />}
                  </div>
                  <div className="transaction-details">
                    <h4>{transaction.category}</h4>
                    <p>{transaction.description}</p>
                  </div>
                  <div className="transaction-date">{transaction.date}</div>
                  <div className="transaction-amount">
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-transactions">No transactions found</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}