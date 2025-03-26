const express = require("express");
const router = express.Router();
const supabase = require("../../supabaseClient");

// Get all wishlist items for a specific user
router.get("/", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    const { data, error } = await supabase.from("wishlist").select("*").eq("user_id", userId);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new wishlist item
router.post("/", async (req, res) => {
  const { user_id, name, budget } = req.body;
  if (!user_id || !name || !budget) {
    return res.status(400).json({ error: "User ID, name, and budget are required" });
  }

  try {
    const { data, error } = await supabase.from("wishlist").insert([{ user_id, name, budget }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a wishlist item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error: fetchError } = await supabase.from("wishlist").select("*").eq("id", id);
    if (fetchError) throw fetchError;
    if (!data.length) return res.status(404).json({ error: "Item not found" });

    const { error: deleteError } = await supabase.from("wishlist").delete().eq("id", id);
    if (deleteError) throw deleteError;

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
