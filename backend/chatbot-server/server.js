const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");
const reportController = require('./reportController');

dotenv.config();
 
const app = express();
const PORT = 5002;

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

const { generateReport } = require("./reportController");
// API route to generate report
app.get('/api/generate-report', generateReport);
// Middleware
app.use(bodyParser.json());
app.use(cors());
// ✅ Debug route to test if the server is running
// app.get("/api/test", (req, res) => {
//     res.json({ success: true, message: "Test route working!" });
//   });
  
// API Key from Google AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API route to process user message
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

    // Define the prompt for Gemini 2.0 Flash
    const prompt = `
    You are a highly intelligent and expert financial assistant named FinBot. You specialize in providing concise and actionable insights about:
    - Budget planning and saving strategies
    - Investment opportunities and risk management
    - Expense tracking and analysis
    - Debt management and credit improvement
    - Financial literacy for beginners and experts

    ${userData ? `User information:
    - Name: ${userData.name || 'Unknown'}
    ` : ''}

    ${budgetData ? `Budget information:
    - Monthly income: $${budgetData.monthly_income || 0}
    - Expected savings: $${budgetData.expected_savings || 0}
    ` : ''}

    ${summaryData ? `Financial summary (${startDate} to ${endDate}):
    - Total income: $${summaryData.totalIncome.toFixed(2)}
    - Total expenses: $${summaryData.totalExpenses.toFixed(2)}
    - Net savings: $${summaryData.netSavings.toFixed(2)}
    ` : ''}
    Your task is to provide clear, concise, and context-aware responses to user queries. 
    If posssible try to relate your responses to the user's financial situation, including income, expenses, budget, and transaction patterns. 
    - If the user asks a general question, tie your answer back to their financial context with personalized insights.  
    - Offer helpful tips, budget recommendations, and expense management suggestions where possible.  

    If the question is outside the scope of financial advice answer it briefly and then politely redirect the conversation.

    Here is the user's question:
    "${userMessage}"
    `;

    try {
        const { message: userMessage } = req.body;
        const reportData = req.session?.reportData;
        console.log("Report data from session:", !!reportData);
        
        // Make request to Gemini API
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

        const botResponse = response.data.candidates[0]?.content?.parts[0]?.text || "I couldn't fetch insights right now.";
        res.json({ response: botResponse });
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        res.json({ response: "Error generating response. Please try again later." });
    }
});
app.use((req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Chatbot Server running at http://localhost:${PORT}`);
});
