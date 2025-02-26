//"use client";

import { useState } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  Film,
  Home,
  Bus,
  GraduationCap,
  Plus,
  DollarSign,
  PiggyBank,
  Wallet,
  User,
  LayoutDashboard,
  CalendarDays,
  Target,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import Image from "../images/logo.jpeg";
import "./Expenses.css"; // Import the regular CSS file

export default function ExpensesPage() {
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    date: "",
    description: "",
  });

  const handleIncomeChange = (e) => {
    setIncome(Number.parseFloat(e.target.value) || 0);
  };

  const handleExpenseChange = (e) => {
    setNewExpense({ ...newExpense, [e.target.name]: e.target.value });
  };

  const addExpense = () => {
    if (newExpense.category && newExpense.amount && newExpense.date) {
      setExpenses([...expenses, newExpense]);
      setNewExpense({ category: "", amount: "", date: "", description: "" });
    }
  };

  const availableBalance =
    income -
    expenses.reduce(
      (total, exp) => total + Number.parseFloat(exp.amount),
      0
    );

  const getCategoryIcon = (category) => {
    switch (category) {
      case "shopping":
        return <ShoppingBag className="icon" />;
      case "groceries":
        return <ShoppingCart className="icon" />;
      case "entertainment":
        return <Film className="icon" />;
      case "rent":
        return <Home className="icon" />;
      case "transport":
        return <Bus className="icon" />;
      case "education":
        return <GraduationCap className="icon" />;
      default:
        return <Plus className="icon" />;
    }
  };

  return (
    <div className="app-container1">
      <nav className="navbar1">
        <img src={Image} alt="Logo" width={60} height={60} />
        <User className="user-icon" />
      </nav>

      <aside className="sidebar">
        <ul>
          {[
            { icon: <LayoutDashboard className="icon" />, label: "Home" },
            { icon: <DollarSign className="icon" />, label: "Expenses" },
            { icon: <PiggyBank className="icon" />, label: "Budget Plan" },
            { icon: <Target className="icon" />, label: "Goals" },
            { icon: <CalendarDays className="icon" />, label: "Events" },
            { icon: <MessageSquare className="icon" />, label: "Chatbot" },
            { icon: <UserCircle className="icon" />, label: "Profile" },
          ].map((item, index) => (
            <li key={index}>
              <a href="#" className="sidebar-item">
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        <section className="financial-overview">
          <h2>Financial Overview</h2>
          <div className="card-container">
            <div className="card income-card">
              <h3>
                <DollarSign className="icon" /> Total Income
              </h3>
              <input
                type="number"
                value={income}
                onChange={handleIncomeChange}
                placeholder="Enter monthly income"
              />
            </div>
            <div className="card savings-card">
              <h3>
                <PiggyBank className="icon" /> Savings
              </h3>
              <p>${savings.toFixed(2)}</p>
            </div>
            {/* <div className="card balance-card">
              <h3>
                <Wallet className="icon" /> Available Balance
              </h3>
              <p>${availableBalance.toFixed(2)}</p>
            </div> */}
          </div>
        </section>

        <section className="add-expenses">
          <h2>Add Expenses</h2>
          <div className="expense-form">
            <select
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
            >
              <option value="">Select category</option>
              {[
                "shopping",
                "groceries",
                "entertainment",
                "rent",
                "transport",
                "education",
                "other",
              ].map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="amount"
              value={newExpense.amount}
              onChange={handleExpenseChange}
              placeholder="Amount"
            />
            <input
              type="date"
              name="date"
              value={newExpense.date}
              onChange={handleExpenseChange}
            />
            <input
              type="text"
              name="description"
              value={newExpense.description}
              onChange={handleExpenseChange}
              placeholder="Description"
            />
            <button className="add-button" onClick={addExpense}>
              Add Expense
            </button>
          </div>
        </section>

        <section className="transaction-history">
          <h2>Transaction History</h2>
          <div className="transactions">
            {expenses.map((expense, index) => (
              <div key={index} className="transaction-item">
                <div className="category-icon">
                  {getCategoryIcon(expense.category)}
                </div>
                <div className="transaction-details">
                  <h3>
                    {expense.category.charAt(0).toUpperCase() +
                      expense.category.slice(1)}
                  </h3>
                  <p>{expense.description}</p>
                </div>
                <div className="transaction-amount">
                  <p>${Number.parseFloat(expense.amount).toFixed(2)}</p>
                  <p>{expense.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
