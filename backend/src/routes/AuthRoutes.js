const express = require("express");
const { signUp, signIn, googleAuth  } = require("../controllers/AuthController");
const router = express.Router();
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/google-auth", googleAuth);
module.exports = router;