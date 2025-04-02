require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const authRoutes = require("./src/routes/AuthRoutes");
const futureEventRoutes = require("./src/routes/FutureEventRoute"); // Import future event routes
const homeRoutes = require("./src/routes/HomeRoute");
const BudgetPlan = require("./src/routes/BudgetRoutes")
//const Expenses = require("./src/routes/ExpensesRoute")
const Wishlist = require("./src/routes/WishlistRoute")

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Connection Pool (for direct PostgreSQL usage, though Supabase is preferred)
const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// API Routes
app.get("/", (req, res) => {
  res.json({ message: "Wyzo Backend Running..." });
});

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/futureevents", futureEventRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/BudgetPlan",BudgetPlan)
app.use("/api/wishlist",Wishlist);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});