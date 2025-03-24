const express = require('express');
const router = express.Router();
const ExpensesController = require('../controllers/ExpensesController');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }
  
  // Token validation is handled in the controller
  next();
};

// Budget routes
router.get('/budget', authenticateToken, ExpensesController.getBudgetData);

// Categories routes
router.get('/categories', authenticateToken, ExpensesController.getCategories);

// Transactions routes
router.get('/transactions', authenticateToken, ExpensesController.getTransactions);
router.post('/transactions', authenticateToken, ExpensesController.addTransaction);
router.put('/transactions/:id', authenticateToken, ExpensesController.updateTransaction);
router.delete('/transactions/:id', authenticateToken, ExpensesController.deleteTransaction);

module.exports = router;