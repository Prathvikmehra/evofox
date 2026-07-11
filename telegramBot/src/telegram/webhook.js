const config = require("../config");

/**
 * Middleware to validate that the request contains the correct Telegram webhook secret token.
 * Prevents unauthorized requests from spamming the webhook endpoint.
 */
function validateWebhookSecret(req, res, next) {
  // If WEBHOOK_SECRET is not configured, skip verification for easier local testing
  if (!config.WEBHOOK_SECRET) {
    return next();
  }

  const secretHeader = req.headers["x-telegram-bot-api-secret-token"];
  if (secretHeader !== config.WEBHOOK_SECRET) {
    console.warn("[Telegram Webhook] Unauthorized request received. Invalid secret token.");
    return res.status(403).json({ error: "Forbidden: Invalid secret token" });
  }

  next();
}

module.exports = {
  validateWebhookSecret,
};
