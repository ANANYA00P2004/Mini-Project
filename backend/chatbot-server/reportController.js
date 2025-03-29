const supabase = require("../src/supabaseClient");

exports.generateReport = async (req, res) => {
    console.log("Received Query Params:", req.query);

    const { user_id, start_date, end_date, category_id, type } = req.query;

  if (!user_id ) {
    return res.status(400).json({ error: "User ID is  required." });
  }
  if ( !start_date ) {
    return res.status(400).json({ error: "Start date is required." });
  }
  if  (!end_date) {
    return res.status(400).json({ error: "End date is required." });
  }
  try {
    // 1️⃣ Fetch transactions within the given date range
    let query = supabase
      .from("Transactions")
      .select("amount, type, category_id, date, Categories(label)")//category_id = 8(shopping), type =income/expense, label=food
      .eq("user_id", user_id)
      .gte("date", start_date)
      .lte("date", end_date);

    // 2️⃣ Apply optional filters (if provided)
    if (category_id) {
      query = query.eq("category_id", category_id);
    }
    if (type) {
      query = query.eq("type", type);
    }

    const { data: transactions, error: transactionsError } = await query;

    if (transactionsError) throw transactionsError;

    console.log("Fetched Transactions:", transactions);

    // 3️⃣ Process and structure data for the report
    const reportData = transactions.map((t) => ({
      date: t.date,
      category: t.Categories?.label || "Uncategorized",
      amount: t.amount,
      type: t.type,
      category_id: t.category_id,
    }));

    // ✅ Group transactions by date or category if needed
    const groupedData = reportData.reduce((acc, curr) => {
      const key = curr.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
    }, {});

    console.log("Grouped Data:", groupedData);

    // 4️⃣ Return report data to frontend
    res.json({
      success: true,
      report: groupedData,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Error generating report." });
  }
};
