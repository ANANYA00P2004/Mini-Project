// WishRoutes.js
const express = require("express")
const router = express.Router()
const WishController = require("../controllers/WishController")
const { authenticateUser } = require("../middleware/auth") // Adjust path as needed

// Apply authentication middleware to all routes
router.use(authenticateUser)

// Get all wishlist items for a user
router.get("/user/:userId", WishController.getWishlistItems)

// Add a new wishlist item
router.post("/", WishController.addWishlistItem)

// Update a wishlist item's saved amount
router.patch("/:itemId/contribute", WishController.updateSavedAmount)

// Delete a wishlist item
router.delete("/:itemId", WishController.deleteWishlistItem)

// Get financial summary for a user
router.get("/financial-summary/:userId", WishController.getFinancialSummary)

module.exports = router

