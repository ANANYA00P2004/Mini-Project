require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const http = require("http"); // Required for Socket.io
const notificationService = require("./src/services/notificationService"); // ✅ Import modified notification service
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const axios = require("axios");

const reportController = require("./chatbot-server/reportController");
const authRoutes = require("./src/routes/AuthRoutes");
const futureEventRoutes = require("./src/routes/FutureEventRoute"); // Import future event routes
const homeRoutes = require("./src/routes/HomeRoute");
const BudgetPlan = require("./src/routes/BudgetRoutes");

const app = express();
const server = http.createServer(app); // Create server for Socket.io
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.json());
// app.use(  //not required
//   cors({
//     origin: "http://localhost:3000", // Frontend origin
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// ✅ API Routes
// PostgreSQL Connection Pool (for direct PostgreSQL usage, though Supabase is preferred)
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});
app.use(cors());
// API Routes
app.get("/", (req, res) => {
  console.log("✅ GET / - Wyzo Backend Running..."); // Debug log
  res.json({ message: "Wyzo Backend Running..." });
});

// ✅ Register Routes
console.log("✅ Registering API routes..."); // Debug log
app.use("/api/auth", authRoutes);
app.use("/api/futureevents", futureEventRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/BudgetPlan", BudgetPlan);

// ✅ Initialize Socket.io and Listen for Supabase Notifications
console.log("✅ Initializing WebSocket and notification listeners..."); // Debug log
notificationService.initSocketIo(server);

// Debug Supabase connection and notification listener
console.log("✅ Setting up Supabase notifications listener...");
notificationService.listenToSupabaseNotifications()
  .then(() => console.log("✅ Supabase notifications listener initialized successfully."))
  .catch((err) => console.error("❌ Error initializing Supabase notifications listener:", err));

// ✅ Start the server with Socket.io support
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ✅ Report Generation Route
const { generateReport } = require("./chatbot-server/reportController");
app.get("/api/generate-report", generateReport);


// ✅ Chatbot API route to process user messages
app.post("/api/get-response", async (req, res) => {
  const userMessage = req.body.message;

  const reportData = reportController.getLastReportData();
  console.log("In chat endpoint - Report data available:", !!reportData);
  let userData = null;
  let budgetData = null;
  let summaryData = null;
  let startDate = null;
  let endDate = null;

  if (reportData) {
    userData = reportData.user;
    budgetData = reportData.budget;
    summaryData = reportData.summary;
    startDate = reportData.dateRange.startDate;
    endDate = reportData.dateRange.endDate;
  }
  console.log("Chat prompt will include user data:", userData ? userData.name : "No name");
  console.log("Chat prompt will include budget data:", budgetData ? "Yes" : "No");

  // ✅ Define the prompt for Gemini 2.0 Flash
  const prompt = `
    You are a highly intelligent and expert financial assistant named FinBot. You specialize in providing concise and actionable insights about:
    - Budget planning and saving strategies
    - Investment opportunities and risk management
    - Expense tracking and analysis
    - Debt management and credit improvement
    - Financial literacy for beginners and experts

    ${userData ? `User information:
    - Name: ${userData.name || "Unknown"}
    ` : ""}

    ${budgetData ? `Budget information:
    - Monthly income: $${budgetData.monthly_income || 0}
    - Expected savings: $${budgetData.expected_savings || 0}
    ` : ""}

    ${summaryData ? `Financial summary (${startDate} to ${endDate}):
    - Total income: $${summaryData.totalIncome.toFixed(2)}
    - Total expenses: $${summaryData.totalExpenses.toFixed(2)}
    - Net savings: $${summaryData.netSavings.toFixed(2)}
    ` : ""}
    Your task is to provide clear, concise, and context-aware responses to user queries. 
    If possible, relate your responses to the user's financial situation, including income, expenses, budget, and transaction patterns. 
    - If the user asks a general question, tie your answer back to their financial context with personalized insights.  
    - Offer helpful tips, budget recommendations, and expense management suggestions where possible.  

    If the question is outside the scope of financial advice, answer briefly and politely redirect the conversation.

    Here is the user's question:
    "${userMessage}"
  `;

  try {
    // ✅ Make request to Gemini API
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    const botResponse =
      response.data.candidates[0]?.content?.parts[0]?.text ||
      "I couldn't fetch insights right now.";
    res.json({ response: botResponse });
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    res.json({ response: "Error generating response. Please try again later." });
  }
});
// ✅ API Key from Google AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ 404 Handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost: ${PORT}`);
});
