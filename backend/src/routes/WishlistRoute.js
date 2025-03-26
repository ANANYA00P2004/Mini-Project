const express = require("express");
const router = express.Router();
const supabase = require("../../supabaseClient"); // Import Supabase client

// Get all wishlist items
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("wishlist").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new item to wishlist
router.post("/", async (req, res) => {
  const { name, budget } = req.body;
  try {
    const { data, error } = await supabase.from("wishlist").insert([{ name, budget }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an item from wishlist
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
