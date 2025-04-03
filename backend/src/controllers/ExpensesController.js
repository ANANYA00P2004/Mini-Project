
const supabase = require("../supabaseClient");

// Fetch aggregated financial data
exports.getFinancialData = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch monthly income
    const { data: budgetData, error: budgetError } = await supabase
      .from("Budget")
      .select("monthly_income")
      .eq("user_id", userId)
      .single();

    if (budgetError) throw budgetError;

    const monthlyIncome = budgetData?.monthly_income || 0;

    // Aggregate total income
    const { data: incomeData, error: incomeError } = await supabase
      .from("Transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "income");

    const totalIncome = incomeData?.reduce((acc, item) => acc + item.amount, 0) || 0;

    // Aggregate total expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from("Transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("type", "expense");

    const totalExpenses = expenseData?.reduce((acc, item) => acc + item.amount, 0) || 0;

    const income = monthlyIncome + totalIncome;
    const savings = income - totalExpenses;
    const monthlyExpenses = totalExpenses;

    res.json({ income, savings, monthlyExpenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch categories
exports.getCategories = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("Categories")
      .select("*")
      .eq("user_id", userId)
      .order("label");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch transactions
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("Transactions")
      .select("id, amount, date, description, type, category_id")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add new expense
exports.addExpense = async (req, res) => {
  try {
    const { user_id, category_id, amount, date, description } = req.body;
    const { error } = await supabase.from("Transactions").insert({
      user_id,
      category_id,
      amount: parseFloat(amount),
      date,
      description,
      type: "expense",
    });

    if (error) throw error;
    res.json({ message: "Expense added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add new income
exports.addIncome = async (req, res) => {
  try {
    const { user_id, category_id, amount, date, description } = req.body;
    const { error } = await supabase.from("Transactions").insert({
      user_id,
      category_id,
      amount: parseFloat(amount),
      date,
      description,
      type: "income",
    });

    if (error) throw error;
    res.json({ message: "Income added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
