const express = require("express");
const {
  getFinancialData,
  getCategories,
  getTransactions,
  addExpense,
  addIncome,
} = require("../controllers/ExpensesController");

const router = express.Router();

router.get("/financial-data/:userId", getFinancialData);
router.get("/categories/:userId", getCategories);
router.get("/transactions/:userId", getTransactions);
router.post("/add-expense", addExpense);
router.post("/add-income", addIncome);

module.exports = router;
