const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// API Key from Google AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// API route to process user message
app.post("/api/get-response", async (req, res) => {
    const userMessage = req.body.message;

    // Define the prompt for Gemini 2.0 Flash
    const prompt = `
    You are a financial advisor providing helpful tips and actionable insights to users.
    Respond in a friendly and concise manner. 
    User: "${userMessage}"
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
