const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");

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

    // Define the prompt for Gemini 2.0 Flash
    const prompt = `
    You are a highly intelligent and expert financial assistant named FinBot. You specialize in providing concise and actionable insights about:
    - Budget planning and saving strategies
    - Investment opportunities and risk management
    - Expense tracking and analysis
    - Debt management and credit improvement
    - Financial literacy for beginners and experts

    Your task is to provide short, clear, and relevant responses to user queries. Limit responses to **100 words max** while ensuring that the information is useful and accurate.

    If the question is outside the scope of financial advice, politely redirect the conversation.

    Here is the user's question:
    "${userMessage}"
    `;

    try {
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
