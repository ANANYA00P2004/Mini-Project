const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to verify user from token
const getUserFromToken = async (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error verifying user token:', error);
    return null;
  }
};

const ExpensesController = {
  // Get user's budget data
  getBudgetData: async (req, res) => {
    try {
      const user = await getUserFromToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { data, error } = await supabase
        .from('Budget')
        .select('monthly_income, expected_savings')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      res.status(200).json({
        income: data?.monthly_income || 0,
        savings: data?.expected_savings || 0
      });
    } catch (error) {
      console.error('Error fetching budget data:', error);
      res.status(500).json({ error: 'Error fetching budget data' });
    }
  },

  // Get user's categories
  getCategories: async (req, res) => {
    try {
      const user = await getUserFromToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { data, error } = await supabase
        .from('Categories')
        .select('*')
        .eq('user_id', user.id)
        .order('label');

      if (error) throw error;

      res.status(200).json(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Error fetching categories' });
    }
  },

  // Get user's transactions
  getTransactions: async (req, res) => {
    try {
      const user = await getUserFromToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

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
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedTransactions = data.map(transaction => ({
        id: transaction.id,
        category: transaction.Categories.label,
        category_id: transaction.Categories.id,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        type: transaction.type
      }));

      res.status(200).json(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Error fetching transactions' });
    }
  },

  // Add new transaction (expense or income)
  addTransaction: async (req, res) => {
    try {
      const user = await getUserFromToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { category_id, amount, date, description, type } = req.body;

      // Validate input
      if (!category_id || !amount || !date || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Insert transaction
      const { data, error } = await supabase
        .from('Transactions')
        .insert({
          user_id: user.id,
          category_id,
          amount: Number.parseFloat(amount),
          date,
          description,
          type
        })
        .select();

      if (error) throw error;

      res.status(201).json(data[0]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      res.status(500).json({ error: 'Error adding transaction' });
    }
  },

  // Update a transaction
  updateTransaction: async (req, res) => {
    try {
      const user = await getUserFromToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;
      const { category_id, amount, date, description } = req.body;

      // Validate input
      if (!id) return res.status(400).json({ error: 'Transaction ID is required' });

      // Verify user owns this transaction
      const { data: existingTx, error: fetchError } = await supabase
        .from('Transactions')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !existingTx) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Update transaction
      const { data, error } = await supabase
        .from('Transactions')
        .update({
          category_id,
          amount: Number.parseFloat(amount),
          date,
          description
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      res.status(200).json(data[0]);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Error updating transaction' });
    }
  },

  // Delete a transaction
  deleteTransaction: async (req, res) => {
    try {
      const user = await getUserFromToken(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.params;

      // Verify user owns this transaction
      const { data: existingTx, error: fetchError } = await supabase
        .from('Transactions')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !existingTx) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Delete transaction
      const { error } = await supabase
        .from('Transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Error deleting transaction' });
    }
  }
};

module.exports = ExpensesController;