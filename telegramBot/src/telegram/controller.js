const { processUpdate } = require("./handlers");
const config = require("../config");

/**
 * Controller to handle incoming Telegram Webhook updates.
 */
async function handleWebhookUpdate(req, res, next) {
  try {
    const update = req.body;
    if (!update) {
      return res.status(400).json({ error: "Empty request body" });
    }

    // Process update in background (non-blocking for Telegram server response)
    processUpdate(update).catch((err) => {
      console.error("[Telegram Controller] Error processing update:", err.message);
    });

    // Always respond 200 OK immediately to acknowledge receipt
    return res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller to check status of the bot registration and configuration.
 */
async function getStatus(req, res, next) {
  try {
    const isTokenSet = !!config.BOT_TOKEN;
    const isMongoConnected = require("mongoose").connection.readyState === 1;

    return res.status(200).json({
      status: "online",
      database: isMongoConnected ? "connected" : "disconnected",
      botTokenConfigured: isTokenSet,
      webhookConfigured: !!config.WEBHOOK_URL,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleWebhookUpdate,
  getStatus,
};
