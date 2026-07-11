const express = require("express");
const controller = require("./controller");
const { validateWebhookSecret } = require("./webhook");

const router = express.Router();

// Webhook endpoint to receive messages
router.post("/webhook", validateWebhookSecret, controller.handleWebhookUpdate);

// Health/Status check endpoint
router.get("/status", controller.getStatus);

module.exports = router;
