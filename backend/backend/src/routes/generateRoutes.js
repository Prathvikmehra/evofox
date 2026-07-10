const express = require("express");
const router = express.Router();
const { handleGenerateReply } = require("../controllers/generateController");

router.post("/generate-reply", handleGenerateReply);

module.exports = router;
