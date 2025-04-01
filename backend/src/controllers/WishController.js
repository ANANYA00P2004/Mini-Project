// WishController.js
const { createClient } = require("@supabase/supabase-js")

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

class WishController {
  // Get all wishlist items for a user
  async getWishlistItems(req, res) {
    try {
      const { userId } = req.params

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" })
      }

      const { data, error } = await supabase.from("Wishlist").select("*").eq("user_id", userId)

      if (error) throw error

      return res.status(200).json(data)
    } catch (error) {
      console.error("Error fetching wishlist items:", error.message)
      return res.status(500).json({ error: error.message })
    }
  }

  // Add a new wishlist item
  async addWishlistItem(req, res) {
    try {
      const { userId, item, expectedCost } = req.body

      if (!userId || !item || !expectedCost) {
        return res.status(400).json({ error: "User ID, item name, and expected cost are required" })
      }

      const { data, error } = await supabase
        .from("Wishlist")
        .insert([
          {
            user_id: userId,
            item: item,
            expected_cost: Number.parseFloat(expectedCost),
            currently_saved: 0,
          },
        ])
        .select()

      if (error) throw error

      return res.status(201).json(data[0])
    } catch (error) {
      console.error("Error adding wishlist item:", error.message)
      return res.status(500).json({ error: error.message })
    }
  }

  // Update a wishlist item's saved amount
  async updateSavedAmount(req, res) {
    try {
      const { itemId } = req.params
      const { amount } = req.body

      if (!itemId || amount === undefined) {
        return res.status(400).json({ error: "Item ID and amount are required" })
      }

      // First get the current item
      const { data: currentItem, error: fetchError } = await supabase
        .from("Wishlist")
        .select("currently_saved")
        .eq("id", itemId)
        .single()

      if (fetchError) throw fetchError
      if (!currentItem) {
        return res.status(404).json({ error: "Wishlist item not found" })
      }

      // Calculate new saved amount
      const newSavedAmount = (currentItem.currently_saved || 0) + Number.parseFloat(amount)

      // Update the item
      const { data, error } = await supabase
        .from("Wishlist")
        .update({ currently_saved: newSavedAmount })
        .eq("id", itemId)
        .select()

      if (error) throw error

      return res.status(200).json(data[0])
    } catch (error) {
      console.error("Error updating saved amount:", error.message)
      return res.status(500).json({ error: error.message })
    }
  }

  // Delete a wishlist item
  async deleteWishlistItem(req, res) {
    try {
      const { itemId } = req.params

      if (!itemId) {
        return res.status(400).json({ error: "Item ID is required" })
      }

      const { error } = await supabase.from("Wishlist").delete().eq("id", itemId)

      if (error) throw error

      return res.status(200).json({ message: "Wishlist item deleted successfully" })
    } catch (error) {
      console.error("Error deleting wishlist item:", error.message)
      return res.status(500).json({ error: error.message })
    }
  }

  // Get financial summary for a user
  async getFinancialSummary(req, res) {
    try {
      const { userId } = req.params

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" })
      }

      // Fetch monthly income from Budget table
      const { data: budgetData, error: budgetError } = await supabase
        .from("Budget")
        .select("monthly_income")
        .eq("user_id", userId)
        .single()

      if (budgetError) throw budgetError

      const monthlyIncome = budgetData?.monthly_income || 0

      // Aggregate total income from Transactions table
      const { data: incomeData, error: incomeError } = await supabase
        .from("Transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "income")

      if (incomeError) throw incomeError

      const totalIncome = incomeData?.reduce((acc, item) => acc + item.amount, 0) || 0

      // Aggregate total expenses from Transactions table
      const { data: expenseData, error: expenseError } = await supabase
        .from("Transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "expense")

      if (expenseError) throw expenseError

      const totalExpenses = expenseData?.reduce((acc, item) => acc + item.amount, 0) || 0

      // Calculate financial values
      const income = monthlyIncome + totalIncome
      const savings = income - totalExpenses
      const monthlyExpenses = totalExpenses

      return res.status(200).json({
        income,
        savings,
        monthlyExpenses,
      })
    } catch (error) {
      console.error("Error fetching financial summary:", error.message)
      return res.status(500).json({ error: error.message })
    }
  }
}

module.exports = new WishController()

