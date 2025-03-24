const express = require("express");
const { getDashboardData } = require("../controllers/HomeController");

const router = express.Router();

router.get("/", getDashboardData);

module.exports = router;
