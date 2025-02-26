require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Wyzo Backend Running..." });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
