const supabase = require("../supabaseClient");


// Calculate total contributions to wishlist items
const calculateTotalContributions = (items) => {
    return items.reduce((total, item) => total + (item.currently_saved || 0), 0);
};

// Utility function to calculate financial data
const calculateFinancialData = async (userId) => {
    try {
        const { data: budgetData, error: budgetError } = await supabase
            .from("Budget")
            .select("monthly_income")
            .eq("user_id", userId)
            .single();

        if (budgetError && budgetError.code !== 'PGRST116') {
            console.error("Budget fetch error:", budgetError);
            throw budgetError;
        }

        const monthlyIncome = budgetData?.monthly_income || 0;

        const { data: incomeData, error: incomeError } = await supabase
            .from("Transactions")
            .select("amount")
            .eq("user_id", userId)
            .eq("type", "income");

        if (incomeError) {
            console.error("Income fetch error:", incomeError);
            throw incomeError;
        }

        const totalIncome = incomeData?.reduce((acc, item) => acc + item.amount, 0) || 0;

        const { data: expenseData, error: expenseError } = await supabase
            .from("Transactions")
            .select("amount")
            .eq("user_id", userId)
            .eq("type", "expense");

        if (expenseError) {
            console.error("Expense fetch error:", expenseError);
            throw expenseError;
        }

        const totalExpenses = expenseData?.reduce((acc, item) => acc + item.amount, 0) || 0;
        const income = monthlyIncome + totalIncome;
        const savings = income - totalExpenses;

        const { data: wishlistData } = await supabase
            .from("Wishlist")
            .select("currently_saved")
            .eq("user_id", userId);

        const totalContributions = wishlistData?.reduce((total, item) => total + (item.currently_saved || 0), 0) || 0;
        const availableSavings = savings - totalContributions;

        return {
            income,
            savings,
            monthlyExpenses: totalExpenses,
            availableSavings
        };
    } catch (error) {
        console.error("Error fetching financial data:", error);
        throw new Error("Failed to load financial data.");
    }
};

// Express route handler for fetching financial data
const fetchFinancialData = async (req, res) => {
    const { userId } = req.query;
    try {
        const data = await calculateFinancialData(userId);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWishlistItems = async (req, res) => {
    const { userId } = req.query;
    try {
        const { data, error } = await supabase
            .from("Wishlist")
            .select("*")
            .eq("user_id", userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addWishlistItem = async (req, res) => {
    const { userId, item, expectedCost } = req.body;
    try {
        const newItem = {
            user_id: userId,
            item,
            expected_cost: expectedCost,
            currently_saved: 0
        };
        
        const { data, error } = await supabase
            .from("Wishlist")
            .insert([newItem])
            .select();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const contributeToGoal = async (req, res) => {
    const { itemId, amount } = req.body;
    try {
        const { data: currentGoal, error: goalFetchError } = await supabase
            .from("Wishlist")
            .select("*")
            .eq("id", itemId)
            .single();

        if (goalFetchError || !currentGoal) {
            throw new Error("Selected goal not found");
        }

        const newSavedAmount = (currentGoal.currently_saved || 0) + amount;

        const { error: updateError } = await supabase
            .from("Wishlist")
            .update({ currently_saved: newSavedAmount })
            .eq("id", itemId);

        if (updateError) throw updateError;

        res.status(200).json({ message: "Contribution added successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteWishlistItem = async (req, res) => {
    const { itemId } = req.params;
    try {
        const { error } = await supabase
            .from("Wishlist")
            .delete()
            .eq("id", itemId);

        if (error) throw error;

        res.status(200).json({ message: "Goal deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getWishlistItems,
    addWishlistItem,
    contributeToGoal,
    deleteWishlistItem,
    fetchFinancialData
};