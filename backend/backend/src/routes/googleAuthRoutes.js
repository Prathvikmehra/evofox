const express = require("express");
const router = express.Router();
const { handleGoogleSync } = require("../controllers/googleAuthController");

// POST /api/auth/google-sync
router.post("/auth/google-sync", handleGoogleSync);

module.exports = router;
