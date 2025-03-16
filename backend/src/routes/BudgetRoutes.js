const express = require('express');
const router = express.Router();
const BudgetController = require('../controllers/BudgetController');

// User routes
router.get('/user', BudgetController.getCurrentUser);

// Budget routes
router.get('/budget/:userId', BudgetController.getBudgetData);
router.patch('/budget/:userId', BudgetController.updateBudgetData);
router.post('/budget', BudgetController.createBudget); // New POST route

// Category routes
router.get('/categories/:userId', BudgetController.getCategories);
router.post('/categories', BudgetController.addCategory);
router.patch('/category/:categoryId', BudgetController.updateCategory);
router.patch('/category/:categoryId/priority', BudgetController.updateCategoryPriority);
router.delete('/category/:categoryId/priority', BudgetController.removeCategoryPriority);

// Recurring expenses routes
router.get('/recurring-expenses/:userId', BudgetController.getRecurringExpenses);
router.post('/recurring-expenses', BudgetController.addRecurringExpense);
router.delete('/recurring-expenses/:expenseId', BudgetController.removeRecurringExpense);

module.exports = router;
