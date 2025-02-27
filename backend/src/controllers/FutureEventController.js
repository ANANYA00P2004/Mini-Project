const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);


// Get all future events for a user
exports.getEvents = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const { data, error } = await supabase
            .from("Future_Expenses")
            .select("*")
            .eq("user_id", userId);

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("❌ Error fetching future events:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Add a new future event
exports.addEvent = async (req, res) => {
    try {
        // Assuming user_id is determined in the backend (e.g., from authentication)
        const user_id = "12345"; // Replace with actual logic to fetch user_id

        const { title, date, expected_amount, description } = req.body;

        // Validate required fields
        if (!title || !date || !expected_amount || !description) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from("Future_Expenses")
            .insert([{ user_id, title, date, expected_amount, description }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]); // Return saved event
    } catch (err) {
        console.error("❌ Error inserting future event:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Delete a past event
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: "Event ID is required" });
        }

        const { error } = await supabase.from("Future_Expenses").delete().eq("id", id);

        if (error) throw error;

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting event:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
