const supabase = require("../supabaseClient");

// Helper function to get first and last date of current and last month
const getDateRange = (monthOffset = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthOffset);
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split("T")[0];
  return { firstDay, lastDay };
};

exports.getDashboardData = async (req, res) => {
  const { user_id } = req.query.userId;
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

    const { monthly_income, expected_savings } = budget || { monthly_income: 0, expected_savings: 0 };

    // 3️⃣ Get total expenses for the current month
    const { firstDay, lastDay } = getDateRange();
    const { data: transactions, error: transactionsError } = await supabase
      .from("Transactions")
      .select("amount, type, category_id")
      .eq("user_id", user_id)
      .gte("date", firstDay)
      .lte("date", lastDay);
    if (transactionsError) throw transactionsError;

    const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses - income;

    // 4️⃣ Get future expenses for this month
    const { data: futureExpenses, error: futureError } = await supabase
      .from("Future_Expenses")
      .select("expected_amount")
      .eq("user_id", user_id)
      .gte("date", firstDay)
      .lte("date", lastDay);
    if (futureError) throw futureError;

    const totalFutureExpenses = futureExpenses.reduce((sum, fe) => sum + fe.expected_amount, 0);

    // 5️⃣ Get recurring expenses
    const { data: recurring, error: recurringError } = await supabase
      .from("Recurring")
      .select("rec_limits")
      .eq("user_id", user_id);
    if (recurringError) throw recurringError;

    const totalRecurringExpenses = recurring.reduce((sum, r) => sum + r.rec_limits, 0);

    // 6️⃣ Budget utilization calculation
    const remainingAmount = monthly_income - (expected_savings + totalFutureExpenses + totalRecurringExpenses);
    const budgetUtilization = ((expenses / monthly_income) * 100).toFixed(2);

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

    const { data: categories, error: categoriesError } = await supabase
      .from("Categories")
      .select("id, label, category_limits")
      .eq("user_id", user_id);
    if (categoriesError) throw categoriesError;

    const categorySpending = categories.map((cat) => ({
      label: cat.label,
      data: {
        labels: ["Spent", "Remaining"],
        datasets: [
          {
            data: [categoryExpenses[cat.id] || 0, cat.category_limits ? cat.category_limits - (categoryExpenses[cat.id] || 0) : 0],
            backgroundColor: ["#FF6384", "#36A2EB"],
          },
        ],
      },
    }));

    // 9️⃣ Top 3 Expense Categories
    const sortedCategories = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, amount]) => {
        const category = categories.find((c) => c.id == id);
        return category ? `${category.label} - ₹${amount}` : "";
      });

    // 🔟 Weekly & Monthly Comparisons
    const { firstDay: lastWeekStart, lastDay: lastWeekEnd } = getDateRange(1);
    const lastWeekTransactions = transactions.filter((t) => t.date >= lastWeekStart && t.date <= lastWeekEnd);
    const lastWeekExpenses = lastWeekTransactions.reduce((acc, curr) => {
      acc[curr.category_id] = (acc[curr.category_id] || 0) + curr.amount;
      return acc;
    }, {});

    const weeklyComparison = {
      labels: categories.map((c) => c.label),
      datasets: [
        {
          label: "Last Week",
          data: categories.map((c) => lastWeekExpenses[c.id] || 0),
          backgroundColor: "#C0C0C0",
        },
        {
          label: "This Week",
          data: categories.map((c) => categoryExpenses[c.id] || 0),
          backgroundColor: "#36A2EB",
        },
      ],
    };

    const { firstDay: lastMonthStart, lastDay: lastMonthEnd } = getDateRange(1);
    const lastMonthTransactions = transactions.filter((t) => t.date >= lastMonthStart && t.date <= lastMonthEnd);
    const lastMonthExpenses = lastMonthTransactions.reduce((acc, curr) => {
      acc[curr.category_id] = (acc[curr.category_id] || 0) + curr.amount;
      return acc;
    }, {});

    const monthlyComparison = {
      labels: categories.map((c) => c.label),
      datasets: [
        {
          label: "Last Month",
          data: categories.map((c) => lastMonthExpenses[c.id] || 0),
          backgroundColor: "#C0C0C0",
        },
        {
          label: "This Month",
          data: categories.map((c) => categoryExpenses[c.id] || 0),
          backgroundColor: "#36A2EB",
        },
      ],
    };

    // 1️⃣1️⃣ Daily Expense Trend (Line Graph)
    const dailyTrend = {
      labels: Array.from({ length: new Date().getDate() }, (_, i) => i + 1),
      datasets: [
        {
          label: "Daily Expense",
          data: dailyTrend,
          borderColor: "#FF6384",
          fill: false,
        },
      ],
    };

    // 1️⃣2️⃣ Future Expenses Timeline
    const futureTimeline = futureExpenses.map((fe) => ({
      date: fe.date,
      title: fe.title,
      expected_cost: fe.expected_amount,
    }));

    res.json({
      user,
      total_expenses: totalExpenses,
      budget_utilization: budgetUtilization,
      budget_overview: budgetOverview,
      category_spending: categorySpending,
      top_expense_categories: sortedCategories,
      weekly_comparison: weeklyComparison,
      monthly_comparison: monthlyComparison,
      daily_trend: dailyTrend,
      future_expenses: futureTimeline,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Server error" });
  }
};
