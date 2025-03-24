import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import "./Home.css";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Home = () => {
  const userId = localStorage.getItem("userId");
  const [userData, setUserData] = useState({});
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [budgetUtilization, setBudgetUtilization] = useState(0);
  const [budgetOverview, setBudgetOverview] = useState({ datasets: [] });
  const [categorySpending, setCategorySpending] = useState([]);
  const [topExpenseCategories, setTopExpenseCategories] = useState([]);
  const [weeklyComparison, setWeeklyComparison] = useState({ datasets: [] });
  const [monthlyComparison, setMonthlyComparison] = useState({ datasets: [] });
  const [dailyTrend, setDailyTrend] = useState({ datasets: [] });
  const [futureTimeline, setFutureTimeline] = useState([]);

  useEffect(() => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/home?user_id=${userId}`
        );
        const data = await response.json();

        setUserData(data.user || {});
        setTotalExpenses(data.total_expenses || 0);
        setBudgetUtilization(data.budget_utilization || 0);
        setBudgetOverview(data.budget_overview || { datasets: [] });
        setCategorySpending(data.category_spending || []);
        setTopExpenseCategories(data.top_expense_categories || []);
        setWeeklyComparison(data.weekly_comparison || { datasets: [] });
        setMonthlyComparison(data.monthly_comparison || { datasets: [] });
        setDailyTrend(data.daily_trend || { datasets: [] });
        setFutureTimeline(data.future_expenses || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="wyzo-home-container">
        <h1 className="wyzo-home-title">
          Hey {userData?.name || "User"}, Welcome to Wyzo!
        </h1>

        {/* Row 1: Total Expenses, Budget Utilization, Top 3 Categories */}
        <div className="wyzo-home-row">
          <div className="wyzo-home-box expenses">
            <h3>Current Month - Total Expenses</h3>
            <p className="wyzo-home-number">₹ {totalExpenses}</p>
          </div>

          <div className="wyzo-home-box">
            <h3>Budget Utilization</h3>
            <div className="wyzo-home-progress">
              <div
                className="wyzo-home-progress-bar"
                style={{ width: `${budgetUtilization}%` }}
              ></div>
            </div>
            <p>{budgetUtilization}% Utilized</p>
          </div>

          <div className="wyzo-home-box top-expenses">
            <h3>Top 3 Expense Categories</h3>
            <ul>
              {topExpenseCategories.length > 0 ? (
                topExpenseCategories.map((category, index) => (
                  <li key={index} className={`rank-${index + 1}`}>
                    <span className={`rank-badge rank-${index + 1}`}>
                      #{index + 1}
                    </span>{" "}
                    {category}
                  </li>
                ))
              ) : (
                <p>No data available</p>
              )}
            </ul>
          </div>
        </div>

        {/* Row 2: Budget Overview and Daily Expense Trend */}
        <div className="wyzo-home-row equal-split">
          <div className="wyzo-home-box">
            <h3>Budget Overview</h3>
            <Bar data={budgetOverview} options={{ responsive: true }} />
          </div>

          <div className="wyzo-home-box">
            <h3>Daily Expense Trend</h3>
            <Line data={dailyTrend} options={{ responsive: true }} />
          </div>
        </div>

        {/* Row 3: Category-Wise Spending with Scroll */}
        <div className="wyzo-home-box category-spending">
          <h3>Category-Wise Spending</h3>
          <div className="wyzo-home-chart-scroll">
            {categorySpending.length > 0 ? (
              categorySpending.map((category, index) => (
                <div key={index} className="wyzo-home-chart-item">
                  <h4>{category.label}</h4>
                  <Doughnut data={category.data} />
                </div>
              ))
            ) : (
              <p>No data available</p>
            )}
          </div>
        </div>

        {/* Row 4: Weekly, Monthly Comparison and Future Expenses */}
        <div className="wyzo-home-row equal-split">
          <div className="wyzo-home-box">
            <h3>Weekly Expense Comparison</h3>
            <Bar data={weeklyComparison} options={{ responsive: true }} />
          </div>

          <div className="wyzo-home-box">
            <h3>Monthly Expense Comparison</h3>
            <Bar data={monthlyComparison} options={{ responsive: true }} />
          </div>

          <div className="wyzo-home-box future-expenses">
            <h3>Future Expenses Timeline</h3>
            <ul className="future-expense-list">
              {futureTimeline.length > 0 ? (
                futureTimeline.map((event, index) => (
                  <li key={index} className="future-expense-item">
                    <span className="future-date">{event.date}</span> -{" "}
                    <span className="future-title">{event.title}</span> (
                    <span className="future-cost">₹ {event.expected_cost}</span>
                    )
                  </li>
                ))
              ) : (
                <p>No future expenses recorded</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
