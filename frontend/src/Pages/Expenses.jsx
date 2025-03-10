"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
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
  X,
} from "lucide-react"
import "./Expenses.css"
import Layout from "./Layout"



const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
// Initialize Supabase client - replace with your actual Supabase URL and anon key
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export default function Expenses() {
  // State for financial data from Budget table
  const [financialData, setFinancialData] = useState({
    income: 0,
    savings: 0,
  })

  // State for categories from Categories table
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

  // Get the current user ID
  const [userId, setUserId] = useState(null)

  // Fetch user and initialize data
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchBudgetData(user.id)
        fetchCategories(user.id)
        fetchTransactions(user.id)
      }
    }
    
    fetchUser()
  }, [])

  // Fetch budget data from Budget table
  const fetchBudgetData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('Budget')
        .select('monthly_income, expected_savings')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      if (data) {
        setFinancialData({
          income: data.monthly_income || 0,
          savings: data.expected_savings || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching budget data:', error)
    }
  }

  // Fetch categories from Categories table
  const fetchCategories = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('Categories')
        .select('*')
        .eq('user_id', userId)
        .order('label')

      if (error) throw error

      if (data) {
        setCategories(data)
        
        // Get priority categories
        const priorityData = data.filter(cat => cat.category_priority !== null)
          .sort((a, b) => a.category_priority - b.category_priority)
        
        setPriorityCategories(priorityData)
        setPriorityCounter(priorityData.length > 0 ? Math.max(...priorityData.map(cat => cat.category_priority)) + 1 : 1)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Fetch transactions from Transactions table
  const fetchTransactions = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('Transactions')
        .select(`
          id,
          amount,
          date,
          description,
          type,
          Categories(id, label)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      if (data) {
        const formattedTransactions = data.map(transaction => ({
          id: transaction.id,
          category: transaction.Categories.label,
          category_id: transaction.Categories.id,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
          type: transaction.type
        }))
        
        setTransactions(formattedTransactions)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  // Handle adding priority category
  const handleAddPriority = async () => {
    if (selectedPriority && userId) {
      try {
        // Update category_priority in the Categories table
        const { error } = await supabase
          .from('Categories')
          .update({ category_priority: priorityCounter })
          .eq('id', selectedPriority)
          .eq('user_id', userId)

        if (error) throw error

        // Update local state
        setPriorityCounter(prev => prev + 1)
        setSelectedPriority("")
        
        // Refresh categories
        fetchCategories(userId)
      } catch (error) {
        console.error('Error updating priority:', error)
      }
    }
  }

  // Handle removing priority category
  const handleRemovePriority = async (categoryId) => {
    if (userId) {
      try {
        // Reset category_priority to NULL in the Categories table
        const { error } = await supabase
          .from('Categories')
          .update({ category_priority: null })
          .eq('id', categoryId)
          .eq('user_id', userId)

        if (error) throw error

        // Refresh categories
        fetchCategories(userId)
      } catch (error) {
        console.error('Error removing priority:', error)
      }
    }
  }

  // Handle expense form input changes
  const handleExpenseChange = (e) => {
    const { name, value } = e.target
    setNewExpense({
      ...newExpense,
      [name]: value,
    })
  }

  // Handle income form input changes
  const handleIncomeChange = (e) => {
    const { name, value } = e.target
    setNewIncome({
      ...newIncome,
      [name]: value,
    })
  }

  // Handle adding new expense
  const handleAddExpense = async () => {
    if (newExpense.category_id && newExpense.amount && newExpense.date && userId) {
      try {
        // Insert new transaction into Transactions table
        const { data, error } = await supabase
          .from('Transactions')
          .insert({
            user_id: userId,
            category_id: newExpense.category_id,
            amount: Number.parseFloat(newExpense.amount),
            date: newExpense.date,
            description: newExpense.description,
            type: 'expense'
          })
          .select()

        if (error) throw error

        // Reset form and refresh transactions
        setNewExpense({
          category_id: "",
          amount: "",
          date: "",
          description: "",
          type: "expense"
        })
        setShowExpenseForm(false)
        fetchTransactions(userId)
      } catch (error) {
        console.error('Error adding expense:', error)
      }
    }
  }

  // Handle adding new income
  const handleAddIncome = async () => {
    if (newIncome.category_id && newIncome.amount && newIncome.date && userId) {
      try {
        // Insert new transaction into Transactions table
        const { data, error } = await supabase
          .from('Transactions')
          .insert({
            user_id: userId,
            category_id: newIncome.category_id,
            amount: Number.parseFloat(newIncome.amount),
            date: newIncome.date,
            description: newIncome.description,
            type: 'income'
          })
          .select()

        if (error) throw error

        // Reset form and refresh transactions
        setNewIncome({
          category_id: "",
          amount: "",
          date: "",
          description: "",
          type: "income"
        })
        setShowIncomeForm(false)
        fetchTransactions(userId)
      } catch (error) {
        console.error('Error adding income:', error)
      }
    }
  }

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  // Filter transactions based on filters
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (filters.amount ? transaction.amount.toString().includes(filters.amount) : true) &&
      (filters.date ? transaction.date.includes(filters.date) : true) &&
      (filters.description ? transaction.description.toLowerCase().includes(filters.description.toLowerCase()) : true)
    )
  })

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
              <p className="amount">${financialData.income}</p>
            </div>
            <div className="card savings-card">
              <h3>Total Savings</h3>
              <p className="amount">${financialData.savings}</p>
            </div>
          </div>
          <div className="priority-section">
            <div className="card priority-card" onClick={() => setShowPriorityPopup(true)}>
              <h3>Monthly Expenses</h3>
              <p className="amount">${financialData.savings}</p>
            </div>
          </div>
        </div>

        {/* Priority Categories Display */}
        {/* {priorityCategories.length > 0 && (
          <div className="priority-categories">
            <h3>Priority Categories</h3>
            <div className="priority-tags">
              {priorityCategories.map((category) => (
                <div key={category.id} className="priority-tag">
                  {categoryIcons[category.label.toLowerCase()] || <ShoppingBag className="category-icon default" />}
                  <span>{category.label}</span>
                  <button className="remove-priority" onClick={() => handleRemovePriority(category.id)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Priority Popup */}
        {showPriorityPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <h3>Select Priority Categories</h3>
              <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <div className="popup-buttons">
                <button className="add-button" onClick={handleAddPriority}>
                  Add
                </button>
                <button className="cancel-button" onClick={() => setShowPriorityPopup(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
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
  )
}