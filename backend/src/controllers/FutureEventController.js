const supabase = require("../supabaseClient");

// Fetch Future Events
const getEvents = async (req, res) => {
  try {
    const userId = req.query.userId; // Get userId from request query
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const { data, error } = await supabase
      .from("Future_Expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a Future Event
const addEvent = async (req, res) => {
  try {
    const { user_id, title, date, expected_amount, description } = req.body;
    if (!user_id || !title || !date || !expected_amount || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const { data, error } = await supabase.from("Future_Expenses").insert([
      { user_id, title, date, expected_amount, description },
    ]);

    if (error) throw error;
    res.json({ message: "Event added successfully", event: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a Future Event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Event ID is required" });

    const { error } = await supabase.from("Future_Expenses").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEvents, addEvent, deleteEvent };
