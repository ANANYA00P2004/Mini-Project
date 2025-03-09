// controllers/ExpensesController.js
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Default categories
const defaultCategories = ["Shopping", "Groceries", "Transport", "Education", "Rent", "Entertainment","Food"];
// Function to add default categories for a new user
const addDefaultCategories = async (req, res) => {
  const { user_id } = req.body;

  try {
    const { data: existingCategories, error: fetchError } = await supabase
      .from("Categories")
      .select("label")
      .eq("user_id", user_id);

    if (fetchError) throw fetchError;

    const existingLabels = existingCategories.map((cat) => cat.label);
    const categoriesToInsert = defaultCategories
      .filter((cat) => !existingLabels.includes(cat))
      .map((label) => ({ user_id, label }));

    if (categoriesToInsert.length > 0) {
      const { error: insertError } = await supabase.from("Categories").insert(categoriesToInsert);
      if (insertError) throw insertError;
    }

    res.status(200).json({ message: "Default categories added successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to create a new category
const createCategory = async (req, res) => {
  const { user_id, label } = req.body;

  try {
    const { data, error } = await supabase.from("Categories").insert([{ user_id, label }]);
    if (error) throw error;
    res.status(201).json({ message: "Category created successfully.", category: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to add an expense transaction
const addExpense = async (req, res) => {
  const { user_id, category, amount, date, description, expense_type } = req.body;

  try {
    const { data, error } = await supabase
      .from("Transactions")
      .insert([{ user_id, category, amount, date, description, expense_type }]);

    if (error) throw error;

    res.status(201).json({ message: "Expense added successfully.", transaction: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to assign priorities to a category
const addPriority = async (req, res) => {
  const { user_id, category } = req.body;

  try {
    const { data, error } = await supabase
      .from("Budget")
      .insert([{ user_id, expense_priorities: category }]);

    if (error) throw error;

    res.status(201).json({ message: "Priority assigned successfully.", priority: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addDefaultCategories,
  createCategory,
  addExpense,
  addPriority,
};
