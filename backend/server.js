require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const http = require("http"); // Required for Socket.io
const notificationService = require("./src/services/notificationService"); // ✅ Import modified notification service

const authRoutes = require("./src/routes/AuthRoutes");
const futureEventRoutes = require("./src/routes/FutureEventRoute"); // Import future event routes
const homeRoutes = require("./src/routes/HomeRoute");
const BudgetPlan = require("./src/routes/BudgetRoutes");

const app = express();
const server = http.createServer(app); // Create server for Socket.io
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ API Routes
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
