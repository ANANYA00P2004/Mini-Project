// BudgetController.js
const supabase = require("../supabaseClient");

// Controller functions for budget operations
const BudgetController = {
  // Get current user
  async getCurrentUser(req, res) {
    try {
      
      const { data, error } = await supabase
        .from('Users')
        .select('id')
        .limit(1)
        .single();

      if (error) throw error;
      
      res.status(200).json(data);
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: error.message });
    }
  },
// Create a new budget record
// Create a new budget record
async createBudget(req, res) {
  try {
    const { user_id, ...budgetFields } = req.body;

    // Check for user_id
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Make sure at least one budget field is provided
    if (Object.keys(budgetFields).length === 0) {
      return res.status(400).json({ error: "At least one budget field is required" });
    }

    // Convert numeric fields to numbers
    Object.keys(budgetFields).forEach(key => {
      if (key === 'monthly_income' || key === 'expected_savings') {
        budgetFields[key] = Number(budgetFields[key]);
        
        // Validate that it's a valid number
        if (isNaN(budgetFields[key])) {
          return res.status(400).json({ error: `${key} must be a valid number` });
        }
      }
    });

    // Insert into the Budget table with only the provided fields
    const { data, error } = await supabase
      .from("Budget")
      .insert({ user_id, ...budgetFields })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ error: error.message });
  }
},
  // Get budget data for a user
  async getBudgetData(req, res) {
    try {
      const userId = req.params.userId;
      
      const { data, error } = await supabase
        .from('Budget')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      res.status(200).json(data || { id: null, user_id: userId, monthly_income: null, expected_savings: null });
    } catch (error) {
      console.error('Error getting budget data:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get categories for a user
  async getCategories(req, res) {
    try {
      const userId = req.params.userId;
      //console.log("Received userId:", userId); // Debugging step

      const { data, error } = await supabase
        .from('Categories')
        .select('*')
        .eq('user_id', userId)
        .order('category_priority', { ascending: true, nullsLast: true });
      
      if (error) throw error;
      
      res.status(200).json(data || []);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Get recurring expenses for a user
  async getRecurringExpenses(req, res) {
    try {
      const userId = req.params.userId;
      
      const { data, error } = await supabase
        .from('Recurring')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      res.status(200).json(data || []);
    } catch (error) {
      console.error('Error getting recurring expenses:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update budget data (PATCH method)
  async updateBudgetData(req, res) {
    try {
      const userId = req.params.userId;
      const updateData = req.body; // This will contain the field and value to update
      
      // Check if budget record exists
      const { data: existingBudget } = await supabase
        .from('Budget')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      let result;
      
      if (existingBudget) {
        // Update existing record
        result = await supabase
          .from('Budget')
          .update(updateData)
          .eq('user_id', userId)
          .select();
      } else {
        // Create new record
        result = await supabase
          .from('Budget')
          .insert({ user_id: userId, ...updateData })
          .select();
      }
      
      const { data, error } = result;
      
      if (error) throw error;
      
      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error updating budget data:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update category limit
  async updateCategory(req, res) {
    try {
      const categoryId = req.params.categoryId;
      const { category_limits } = req.body;
      
      const { data, error } = await supabase
        .from('Categories')
        .update({ category_limits })
        .eq('id', categoryId)
        .select();
      
      if (error) throw error;
      
      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Add category
  async addCategory(req, res) {
    try {
      const { user_id, label, category_limits } = req.body;
      
      const { data, error } = await supabase
        .from('Categories')
        .insert({ user_id, label, category_limits })
        .select();
      
      if (error) throw error;
      
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Update category priority
  async updateCategoryPriority(req, res) {
    try {
      const categoryId = req.params.categoryId;
      const { category_priority } = req.body;
      
      const { data, error } = await supabase
        .from('Categories')
        .update({ category_priority })
        .eq('id', categoryId)
        .select();
      
      if (error) throw error;
      
      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error updating category priority:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Remove category priority
  async removeCategoryPriority(req, res) {
    try {
      const categoryId = req.params.categoryId;
      
      // Update the category to remove priority
      const { data, error } = await supabase
        .from('Categories')
        .update({ category_priority: null })
        .eq('id', categoryId)
        .select();
      
      if (error) throw error;
      
      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error removing category priority:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Add recurring expense
  async addRecurringExpense(req, res) {
    try {
      const { user_id, label, rec_limits } = req.body;
      
      const { data, error } = await supabase
        .from('Recurring')
        .insert({ user_id, label, rec_limits })
        .select();
      
      if (error) throw error;
      
      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error adding recurring expense:', error);
      res.status(500).json({ error: error.message });
    }
  },
  
  // Remove recurring expense
  async removeRecurringExpense(req, res) {
    try {
      const expenseId = req.params.expenseId;
      
      const { error } = await supabase
        .from('Recurring')
        .delete()
        .eq('id', expenseId);
      
      if (error) throw error;
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error removing recurring expense:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = BudgetController;