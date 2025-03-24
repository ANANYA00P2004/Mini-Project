const supabase = require("../supabaseClient");

exports.getDashboardData = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch User
    const { data: user, error: userError } = await supabase
      .from("Users")
      .select("name")
      .eq("id", userId)
      .single();
    if (userError) throw userError;

    // Fetch Transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("Transactions")
      .select("*")
      .eq("user_id", userId);
    if (transactionsError) throw transactionsError;

    let totalExpenses = 0;
    let totalIncome = 0;
    let dailyExpenses = {};

    transactions.forEach(({ amount, type, date }) => {
      if (type === "expense") totalExpenses += amount;
      else totalIncome += amount;

      const day = date.split("T")[0];
      dailyExpenses[day] = (dailyExpenses[day] || 0) + amount;
    });

    // Fetch Budget
    const { data: budget, error: budgetError } = await supabase
      .from("Budget")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (budgetError) throw budgetError;

    const { monthly_income, expected_savings } = budget;

    // Fetch Recurring Expenses
    const { data: recurring, error: recurringError } = await supabase
      .from("Recurring")
      .select("rec_limits")
      .eq("user_id", userId);
    if (recurringError) throw recurringError;

    const totalRecurring = recurring.reduce((sum, r) => sum + r.rec_limits, 0);

    // Fetch Future Expenses (Current Month)
    const { data: futureEvents, error: futureError } = await supabase
      .from("Future_Expenses")
      .select("*")
      .eq("user_id", userId);
    if (futureError) throw futureError;

    const totalFutureExpenses = futureEvents.reduce(
      (sum, e) => sum + e.expected_amount,
      0
    );

    // Max Possible Expense Calculation
    const maxPossibleExpense =
      monthly_income - expected_savings - totalFutureExpenses - totalRecurring;

    const budgetUtilization = ((totalExpenses / maxPossibleExpense) * 100).toFixed(2);

    // Fetch Category Data
    const { data: categories, error: categoryError } = await supabase
      .from("Categories")
      .select("*")
      .eq("user_id", userId);
    if (categoryError) throw categoryError;

    let categoryData = categories.map((category) => {
      const totalSpent = transactions
        .filter((t) => t.category_id === category.id && t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        label: category.label,
        totalSpent,
        chartData: {
          labels: ["Spent", "Remaining"],
          datasets: [
            {
              data: [
                totalSpent,
                category.category_limits
                  ? category.category_limits - totalSpent
                  : maxPossibleExpense / categories.length,
              ],
              backgroundColor: ["#e63946", "#0a0f5b"],
            },
          ],
        },
      };
    });

    categoryData.sort((a, b) => b.totalSpent - a.totalSpent);

    // Weekly & Monthly Comparisons
    let weeklyComparison = {
      labels: categories.map((c) => c.label),
      datasets: [
        {
          label: "Last Week",
          data: categories.map(() =>
            Math.floor(Math.random() * 1000)
          ), // Replace with actual last week data
          backgroundColor: "#0a0f5b",
        },
        {
          label: "This Week",
          data: categories.map(() =>
            Math.floor(Math.random() * 1000)
          ), // Replace with actual this week data
          backgroundColor: "#e63946",
        },
      ],
    };

    let monthlyComparison = {
      labels: categories.map((c) => c.label),
      datasets: [
        {
          label: "Last Month",
          data: categories.map(() =>
            Math.floor(Math.random() * 5000)
          ), // Replace with actual last month data
          backgroundColor: "#0a0f5b",
        },
        {
          label: "This Month",
          data: categories.map(() =>
            Math.floor(Math.random() * 5000)
          ), // Replace with actual this month data
          backgroundColor: "#e63946",
        },
      ],
    };

    // Prepare Future Expenses Timeline
    let futureTimeline = futureEvents.map((event) => ({
      title: event.title,
      date: event.date,
      expected_amount: event.expected_amount,
    }));

    res.json({
      user,
      totalExpenses,
      budgetUtilization,
      budgetData: {
        labels: ["Total Income", "Savings", "Future Expenses", "Recurring", "Remaining"],
        datasets: [
          {
            data: [monthly_income, expected_savings, totalFutureExpenses, totalRecurring, maxPossibleExpense],
            backgroundColor: ["#0a0f5b", "#2a9d8f", "#e9c46a", "#f4a261", "#e63946"],
          },
        ],
      },
      categoryData,
      weeklyComparison,
      monthlyComparison,
      dailyExpenses: {
        labels: Object.keys(dailyExpenses),
        datasets: [
          {
            label: "Expenses",
            data: Object.values(dailyExpenses),
            borderColor: "#e63946",
            fill: false,
          },
        ],
      },
      futureEvents: futureTimeline,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
