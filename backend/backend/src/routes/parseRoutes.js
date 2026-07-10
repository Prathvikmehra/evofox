const express = require("express");
const router = express.Router();
const { handleParse } = require("../controllers/parseController");

router.post("/parse", handleParse);

module.exports = router;
