'use client';

import * as React from 'react';
import { 
  CalendarDays, DollarSign, LayoutDashboard, MessageSquare, 
  PiggyBank, Plus, ShoppingBag, Target, UserCircle, Coffee, 
  Car, Film, ShoppingCart, Home, GraduationCap, Wifi, Smartphone, 
  CreditCard, ChevronDown 
} from 'lucide-react';

import './BudgetPlan.css';

const initialCategories = [
  { icon: <ShoppingBag />, name: 'Shopping' },
  { icon: <ShoppingCart />, name: 'Groceries' },
  { icon: <Coffee />, name: 'Entertainment' },
  { icon: <Car />, name: 'Transport' },
  { icon: <Film />, name: 'Movies' },
];

const recurringExpenses = [
  { icon: <Wifi />, name: 'Subscriptions' },
  { icon: <Smartphone />, name: 'Recharge' },
  { icon: <Home />, name: 'Rent' },
  { icon: <GraduationCap />, name: 'Education' },
  { icon: <CreditCard />, name: 'EMI' },
];

export default function BudgetPlan() {
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [categories, setCategories] = React.useState(initialCategories);
  const [showDropdown, setShowDropdown] = React.useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const addNewCategory = () => {
    const newCategoryName = prompt("Enter the new category name:");
    if (newCategoryName) {
      setCategories([...categories, { icon: <Plus />, name: newCategoryName }]);
    }
  };

  return (
    <div className="budget-container">
      <aside className="plan-sidebar">
        <div className="plan-sidebar-header">
          <h2 className="plan-sidebar-title">Budget Tracker</h2>
        </div>
        <nav className="plan-sidebar-content">
          <ul className="plan-sidebar-menu">
            {[
              { icon: <LayoutDashboard />, label: "Home" },
              { icon: <DollarSign />, label: "Expenses" },
              { icon: <PiggyBank />, label: "Budget Plan" },
              { icon: <Target />, label: "Goals" },
              { icon: <CalendarDays />, label: "Events" },
              { icon: <MessageSquare />, label: "Chatbot" },
              { icon: <UserCircle />, label: "Profile" },
            ].map((item) => (
              <li key={item.label} className="plan-sidebar-item">
                <a href="#" className="plan-sidebar-link">
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="plan-main-content">
        <div className="plan-content-wrapper">
          <div className="plan-grid-container">
            <div className="plan-card">
              <div className="plan-card-header">
                <h3>Categories</h3>
              </div>
              <div className="plan-card-content">
                <button className="plan-dropdown-button" onClick={toggleDropdown}>
                  Select Categories <ChevronDown />
                </button>
                {showDropdown && (
                  <ul className="plan-dropdown-menu">
                    {categories.map((category) => (
                      <li key={category.name} className="dropdown-item" onClick={() => setSelectedCategories(prev => [...prev, category.name])}>
                        {category.icon} {category.name}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="plan-category-list">
                  {selectedCategories.map((category) => (
                    <div key={category} className="category-item">{category}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="plan-card">
              <div className="plan-card-header">
                <h3>Add New Category</h3>
              </div>
              <div className="card-content add-category-container">
                <button className="add-category-button" onClick={addNewCategory}>
                  <Plus />
                </button>
              </div>
            </div>
          </div>

          <div className="plan-card">
            <div className="plan-card-header">
              <h3>Set Limits</h3>
            </div>
            <div className="plan-card-content">
              <div className="plan-grid-container">
                {categories.map((category) => (
                  <div key={category.name} className="category-limit">
                  <div className={`category-icon ${category.name.toLowerCase()}`}>
                    {category.icon}
                  </div>
                  <div className="category-name">{category.name}</div>
                  <input type="number" placeholder="Set limit" className="input-field" />
                </div>
                
                ))}
              </div>
            </div>
          </div>

          <div className="plan-card">
            <div className="plan-card-header">
              <h3>Recurring Expenses</h3>
            </div>
            <div className="plan-card-content">
              <div className="plan-grid-container">
                {recurringExpenses.map((expense) => (
                 <div key={expense.name} className="category-limit">
                 <div className={`category-icon ${expense.name.toLowerCase()}`}>
                   {expense.icon}
                 </div>
                 <div className="category-name">{expense.name}</div>
                 <input type="number" placeholder="Enter amount" className="input-field" />
               </div>
               
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
