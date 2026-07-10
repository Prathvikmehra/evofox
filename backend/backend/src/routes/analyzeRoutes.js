const express = require("express");
const router = express.Router();
const { handleAnalyze } = require("../controllers/analyzeController");

router.post("/analyze", handleAnalyze);

module.exports = router;
