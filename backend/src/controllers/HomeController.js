const supabase = require("../supabaseClient");


const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // Months are 0-based in JS, so add 1

console.log(`Current Year: ${currentYear}, Current Month: ${currentMonth}`);

exports.getDashboardData = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "User ID is required" });

  try {
    // 1️⃣ Fetch user details
    const { data: user, error: userError } = await supabase.from("Users").select("name").eq("id", user_id).single();
    if (userError) throw userError;

    // 2️⃣ Fetch budget details
    const { data: budget, error: budgetError } = await supabase
      .from("Budget")
      .select("monthly_income, expected_savings")
      .eq("user_id", user_id)
      .single();
    if (budgetError) throw budgetError;

    const { monthly_income = 0, expected_savings = 0 } = budget || {};

    // 3️⃣ Get total expenses & income for the current month
    const { data: transactions, error: transactionsError } = await supabase
    .from("Transactions")
    .select("amount, type, category_id, date")
    .eq("user_id", user_id);
  
  if (transactionsError) throw transactionsError;
  
  console.log("Fetched Transactions:", transactions);
  
  // ✅ Filter transactions for the current month & year
  const filteredTransactions = transactions.filter((t) => {
    const [year, month] = t.date.split("-").map(Number); // Extract year & month from 'YYYY-MM-DD'
    return year === currentYear && month === currentMonth;
  });
  
  console.log("Filtered Transactions (Current Month & Year):", filteredTransactions);
  
  // Calculate total income and expenses separately
  const Income = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const Expenses = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  
  console.log(`Total Income: ${Income}`);
  console.log(`Total Expenses: ${Expenses}`);
  
  // ✅ Correct net spending calculation
  const  totalExpenses = Expenses - Income;
  
  console.log(`Net Spending (Total Expenses - Total Income): ${totalExpenses}`);

  const { data: futureExpenses, error: futureError } = await supabase
  .from("Future_Expenses")
  .select("expected_amount, date, title")
  .eq("user_id", user_id);

  if (futureError) throw futureError;

  console.log("Fetched Future Expenses (Raw):", futureExpenses);

// Filter expenses to only include those for the current month and year
  const filteredFutureExpenses = futureExpenses.filter(fe => {
  const [year, month] = fe.date.split("-").map(Number); // Extract year & month from date string
  const isValid = year === currentYear && month === currentMonth;
  console.log(`Checking Expense: ${fe.title} | Date: ${fe.date} | Valid: ${isValid}`);
  return isValid; // ✅ Strictly match year & month
  });

// Calculate the correct total sum
  const totalFutureExpenses = filteredFutureExpenses.reduce((sum, fe) => sum + fe.expected_amount, 0);

  console.log("Filtered Future Expenses:", filteredFutureExpenses);
  console.log("Total Future Expenses Sum:", totalFutureExpenses);
  // 4️⃣ Get future expenses for this month
    

  // 5️⃣ Get recurring expenses
  const { data: recurring, error: recurringError } = await supabase
      .from("Recurring")
      .select("rec_limits")
      .eq("user_id", user_id);
  if (recurringError) throw recurringError;

  const totalRecurringExpenses = recurring.reduce((sum, r) => sum + r.rec_limits, 0);

    // 6️⃣ Budget utilization calculation
  const remainingAmount = monthly_income - (expected_savings + totalFutureExpenses + totalRecurringExpenses);
  const budgetUtilization = ((totalExpenses / remainingAmount) * 100).toFixed(2);

    // 7️⃣ Budget Overview (Bar Graph Data)
    const budgetOverview = {
      labels: ["Income", "Savings", "Future Expenses", "Recurring", "Remaining"],
      datasets: [
        {
          label: "₹",
          data: [monthly_income, expected_savings, totalFutureExpenses, totalRecurringExpenses, remainingAmount],
          backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384", "#4BC0C0", "#9966FF"],
        },
      ],
    };

    // 8️⃣ Category-wise Spending
const categoryExpenses = transactions
.filter((t) => t.type === "expense")
.reduce((acc, curr) => {
  acc[curr.category_id] = (acc[curr.category_id] || 0) + curr.amount;
  return acc;
}, {});

// Fetch all categories
const { data: categories, error: categoriesError } = await supabase
.from("Categories")
.select("id, label, category_limits, category_priority")
.eq("user_id", user_id);
if (categoriesError) throw categoriesError;

if (!categories || categories.length === 0) {
console.error("No categories found for user:", user_id);
return [];
}

// Prepare Category-Wise Spending Data
let categorySpending = categories.map((cat) => {
const totalExpense = categoryExpenses[cat.id] || 0;

// If category has no preset limit, use remainingAmount
const categoryLimit = cat.category_limits !== null ? cat.category_limits : remainingAmount;

return {
  id: cat.id,
  label: cat.label || "Unknown Category",
  spent: totalExpense,
  remaining: Math.max(0, categoryLimit - totalExpense),
  exceeding: Math.max(0, totalExpense - categoryLimit),
  limitReduction: 0, // Track reductions from lower-priority categories
  priority: cat.category_priority,
};
});

// Identify the total exceeding amount
let totalExceeding = categorySpending.reduce((sum, cat) => sum + cat.exceeding, 0);

// Distribute the exceeded amount from **lowest-priority (higher number) to highest-priority (1)**
if (totalExceeding > 0) {
// Sort categories in descending order of priority (higher number first, lower priority first)
categorySpending.sort((a, b) => b.priority - a.priority);

for (let i = 0; i < categorySpending.length && totalExceeding > 0; i++) {
  let category = categorySpending[i];

  if (category.remaining > 0) {
    let deduction = Math.min(category.remaining, totalExceeding);
    category.remaining -= deduction;
    category.limitReduction += deduction;
    totalExceeding -= deduction;
  }
}
}

// Convert category data into chart-compatible format
const formattedCategorySpending = categorySpending.map((cat) => {
let labels = ["Spent", "Remaining"];
let dataValues = [cat.spent, cat.remaining];
let backgroundColors = ["#FF6384", "#36A2EB"];

if (cat.exceeding > 0) {
  labels.push("Exceeding Limit");
  dataValues.push(cat.exceeding);
  backgroundColors.push("#FFB74D");
}

if (cat.limitReduction > 0) {
  labels.push("Limit Reduction");
  dataValues.push(cat.limitReduction);
  backgroundColors.push("#8B5CF6"); // Purple color for limit reduction
}

return {
  label: cat.label,
  data: {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: backgroundColors,
      },
    ],
  },
};
});

// Debugging Output
console.log("Final Category Spending Data:", formattedCategorySpending);



    // 9️⃣ Top 3 Expense Categories
    const sortedCategories = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, amount]) => {
        const category = categories.find((c) => c.id == id);
        return category ? `${category.label} - ₹${amount}` : "";
      });

    //weekly and monthly comparison
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay()); // Sunday of this week

    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // Saturday of this week

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7); // Sunday of last week

    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); // Saturday of last week

    // Get current and past months' date ranges
    const startOfThisMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
    const endOfThisMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));

    // 🟠 Last Month: 1st to Last Day of Previous Month (Corrected)
    const startOfLastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0));
    const endOfLastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0, 23, 59, 59));

    console.log("Date Ranges:");
    console.log("This Week:", startOfThisWeek, "to", endOfThisWeek);
    console.log("Last Week:", startOfLastWeek, "to", endOfLastWeek);
    console.log("This Month:", startOfThisMonth, "to", endOfThisMonth);
    console.log("Last Month:", startOfLastMonth, "to", endOfLastMonth);

    // Fetch expenses for all time ranges
    const result = await supabase
      .from("Transactions")
      .select("amount, type, category_id, date, Categories(label)")
      .eq("user_id", user_id)
      .eq("type", "expense")
      .gte("date", startOfLastMonth.toISOString()) // Get all relevant transactions
      .lte("date", endOfThisMonth.toISOString());

    if (result.error) throw result.error;

    const expenseRecords = result.data;
    console.log("Fetched Expense Records:", expenseRecords);

    // Organize expenses into categories
    const expenseData = {
      thisWeek: {},
      lastWeek: {},
      thisMonth: {},
      lastMonth: {},
    };

    expenseRecords.forEach((t) => {
      const category = t.Categories?.label || "Uncategorized";
      const transactionDate = new Date(t.date);

      if (transactionDate >= startOfThisWeek && transactionDate <= endOfThisWeek) {
        expenseData.thisWeek[category] = (expenseData.thisWeek[category] || 0) + t.amount;
      } else if (transactionDate >= startOfLastWeek && transactionDate <= endOfLastWeek) {
        expenseData.lastWeek[category] = (expenseData.lastWeek[category] || 0) + t.amount;
      }

      if (transactionDate >= startOfThisMonth && transactionDate <= endOfThisMonth) {
        expenseData.thisMonth[category] = (expenseData.thisMonth[category] || 0) + t.amount;
      } else if (transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth) {
        expenseData.lastMonth[category] = (expenseData.lastMonth[category] || 0) + t.amount;
      }
    });

    console.log("Expense Data After Processing:", expenseData);

    // Ensure all categories exist in both periods with value 0 if missing
    const allCategories = new Set([
      ...Object.keys(expenseData.thisWeek),
      ...Object.keys(expenseData.lastWeek),
      ...Object.keys(expenseData.thisMonth),
      ...Object.keys(expenseData.lastMonth),
    ]);

    allCategories.forEach((category) => {
      expenseData.thisWeek[category] = expenseData.thisWeek[category] || 0;
      expenseData.lastWeek[category] = expenseData.lastWeek[category] || 0;
      expenseData.thisMonth[category] = expenseData.thisMonth[category] || 0;
      expenseData.lastMonth[category] = expenseData.lastMonth[category] || 0;
    });

    console.log("Final Categories with Zero Handling:", expenseData);

    // Define two uniform colors
    const lastPeriodColor = "#2196F3"; // Blue for last week/month
    const thisPeriodColor = "#4CAF50"; // Green for this week/month

    console.log("Assigned Colors: Last Period -", lastPeriodColor, "This Period -", thisPeriodColor);

    // Prepare data for frontend
    const weeklyComparison = {
      labels: [...allCategories],
      datasets: [
        {
          label: "This Week",
          backgroundColor: thisPeriodColor,
          data: [...allCategories].map((cat) => expenseData.thisWeek[cat]),
        },
        {
          label: "Last Week",
          backgroundColor: lastPeriodColor,
          data: [...allCategories].map((cat) => expenseData.lastWeek[cat]),
        },
      ],
    };

    const monthlyComparison = {
      labels: [...allCategories],
      datasets: [
        {
          label: "This Month",
          backgroundColor: thisPeriodColor,
          data: [...allCategories].map((cat) => expenseData.thisMonth[cat]),
        },
        {
          label: "Last Month",
          backgroundColor: lastPeriodColor,
          data: [...allCategories].map((cat) => expenseData.lastMonth[cat]),
        },
      ],
    };

    console.log("Final Weekly Comparison Data:", weeklyComparison);
    console.log("Final Monthly Comparison Data:", monthlyComparison);

    // 🔟 Daily Expense Trend (Fixed)
    const dailyExpenses = {};
    transactions.forEach((t) => {
      if (t.type === "expense") {
        const day = new Date(t.date).getDate();
        dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amount;
      }
    });

    const dailyTrend = {
      labels: Array.from({ length: new Date().getDate() }, (_, i) => i + 1),
      datasets: [
        {
          label: "Daily Expense",
          data: Array.from({ length: new Date().getDate() }, (_, i) => dailyExpenses[i + 1] || 0),
          borderColor: "#FF6384",
          fill: false,
        },
      ],
    };

    // 1️⃣1️⃣ Future Expenses Timeline
    const futureTimeline = futureExpenses
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date in ascending order
    .map((fe) => ({
    date: fe.date,
    title: fe.title,
    expected_cost: fe.expected_amount,
    }));

    console.log("Sorted Future Timeline:", futureTimeline);


    res.json({
      user,
      total_expenses: totalExpenses,
      budget_utilization: budgetUtilization,
      budget_overview: budgetOverview,
      category_spending: formattedCategorySpending,
      top_expense_categories: sortedCategories,
      weekly_comparison: weeklyComparison,
      monthly_comparison: monthlyComparison,
      daily_trend: dailyTrend, // ✅ FIXED
      future_expenses: futureTimeline,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Server error" });
  }
};