require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const authRoutes = require("./src/routes/AuthRoutes");
const futureEventRoutes = require("./src/routes/FutureEventRoute"); // Import future event routes
const homeRoutes = require("./src/routes/HomeRoute");
const BudgetPlan = require("./src/routes/BudgetRoutes")
//const Profile = require("./src/routes/ProfileRoutes")
//const Wishlist= require("./src/routes/WishRoutes")
//const Expenses = require("./src/routes/ExpensesRoute")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000",    // ✅ Allow frontend origin
  methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
}));


// Middleware
app.use(express.json());


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
//app.use("/api/profile",Profile)
//app.use("api/wishlist",Wishlist)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});