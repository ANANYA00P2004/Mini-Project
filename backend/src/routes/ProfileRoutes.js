const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/ProfileController");

// ✅ Route to fetch profile data
router.get("/", getProfile);

module.exports = router;
