const supabase = require("../src/supabaseClient");

let lastReportData=null;
console.log("Right now lastReportData is:", lastReportData);

exports.generateReport = async (req, res) => {
    console.log("Received Query Params:", req.query);

    const { user_id, duration, start_date, end_date, category_id, type } = req.query;

  if (!user_id ) {
    return res.status(400).json({ error: "User ID is  required." });
  }
//   if ( !start_date ) {
//     return res.status(400).json({ error: "Start date is required." });
//   }
//   if  (!end_date) {
//     return res.status(400).json({ error: "End date is required." });
//   }

    let startDate = start_date;
    let endDate = end_date;

    if (duration && duration !== "custom") {
        // Calculate dates based on duration (e.g., "7" for last 7 days)
        const daysToLookBack = parseInt(duration);
        const today = new Date();
        endDate = today.toISOString().split('T')[0]; 

        const pastDate = new Date();
        pastDate.setDate(today.getDate() - daysToLookBack);
        startDate = pastDate.toISOString().split('T')[0]; 
    }

    if (!startDate || !endDate) {
        return res.status(400).json({ 
            success: false,
            message: "Start date and end date are required." 
        });
    }

  try {
    // 1️⃣ Fetch transactions within the given date range
    let query = supabase
      .from("Transactions")
      .select("amount, type, category_id, date, Categories(label)")//category_id = 8(shopping), type =income/expense, label=food
      .eq("user_id", user_id)
      .gte("date", startDate)
      .lte("date", endDate);
      console.log(`Fetching transactions between ${startDate} and ${endDate}`);

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

    // Get Budget data
    const { data: budget, error: budgetError } = await supabase
    .from("Budget")
    .select("id, monthly_income, expected_savings")
    .eq("user_id", user_id)
    .single(); // Assuming one budget record per user

    if (budgetError) throw budgetError;

    console.log("Fetched Budget:", budget);
    // Get Categories data
    const { data: categories, error: categoriesError } = await supabase
    .from("Categories")
    .select("id, label")
    .eq("user_id", user_id);

    if (categoriesError) throw categoriesError;
    console.log("Fetched Categories:", categories);

    // Get User data
    const { data: user, error: userError } = await supabase
    .from("Users")
    .select("name")
    .eq("id", user_id)
    .single(); // Getting a single user record

    if (userError) throw userError;

    // Calculate financial summary
    const totalIncome = reportData
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        
    const totalExpenses = reportData
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        
    const netSavings = totalIncome - totalExpenses;

    lastReportData = {
        user: user || null,
        budget: budget || null,
        transactions: reportData,
        summary: {
          totalIncome,
          totalExpenses,
          netSavings
        },
        dateRange: {
          startDate,
          endDate
        }
      };
      console.log("Stored report data for chat:", JSON.stringify(lastReportData, null, 2))
    // 4️⃣ Return report data to frontend
    res.json({
      success: true,
      report: groupedData,
      user: user || null,
      budget: budget || null,
      categories: categories || [],
      transactions: reportData,
      groupedTransactions: Object.entries(groupedData).map(([date, items]) => ({ date, items })),
      summary: {
          totalIncome,
          totalExpenses,
          netSavings
      }
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Error generating report." });
  }
};

// exports.getLastReportData = () => lastReportData;

exports.getLastReportData = () => {
    console.log("Retrieving report data for chat:", lastReportData ? "Data available" : "No data");
    return lastReportData;
  };