const express = require("express");
const router = express.Router();
const { handleSignup, handleLogin } = require("../controllers/authController");

// POST /api/auth/signup
router.post("/auth/signup", handleSignup);

// POST /api/auth/login
router.post("/auth/login", handleLogin);

module.exports = router;
