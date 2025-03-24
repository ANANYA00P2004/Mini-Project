const express = require("express");
const HomeController = require("../controllers/HomeController");

const router = express.Router();

router.get("/:userId", HomeController.getDashboardData);

module.exports = router;
