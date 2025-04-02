const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/WishController");

// Wishlist routes
router.get("/", wishlistController.getWishlistItems);
router.post("/add", wishlistController.addWishlistItem);
router.put("/contribute", wishlistController.contributeToGoal);
router.delete("/delete/:itemId", wishlistController.deleteWishlistItem);

// Financial data route
router.get("/financial-data", wishlistController.fetchFinancialData);

module.exports = router;