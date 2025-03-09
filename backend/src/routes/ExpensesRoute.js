// routes/ExpenseRoutes.js
const express = require("express");
const {
  addDefaultCategories,
  createCategory,
  addExpense,
  addPriority,
} = require("../controllers/ExpenseController");

const router = express.Router();

// Route to add default categories for a user
router.post("/categories/default", addDefaultCategories);

// Route to create a new category
router.post("/categories", createCategory);

// Route to add an expense
router.post("/expenses", addExpense);

// Route to assign a priority to a category
router.post("/priority", addPriority);

module.exports = router;
