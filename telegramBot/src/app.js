const express = require("express");
const cors = require("cors");
const config = require("./config");
const sender = require("./telegram/sender");
const { processUpdate } = require("./telegram/handlers");
const { BotService } = require("./telegram/service");

const telegramRoutes = require("./telegram/routes");

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/telegram", telegramRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

/**
 * Custom robust Telegram Bot Long Polling loop for local development.
 */
async function startLongPolling() {
  console.log("[Telegram Bot] Starting local Long Polling update loop...");
  let offset = 0;

  // Clear any existing webhooks before polling
  try {
    await sender.deleteWebhook();
  } catch (err) {
    console.warn("[Telegram Bot] Warning: failed to delete webhook:", err.message);
  }

  // Infinite poll loop
  while (true) {
    try {
      const response = await require("axios").get(
        `https://api.telegram.org/bot${config.BOT_TOKEN}/getUpdates`,
        {
          params: {
            offset: offset,
            timeout: 30, // 30 seconds long poll
          },
          timeout: 35000, // slightly larger than Telegram poll timeout
        }
      );

      const updates = response.data.result;
      if (Array.isArray(updates) && updates.length > 0) {
        for (const update of updates) {
          offset = update.update_id + 1;
          processUpdate(update).catch((err) => {
            console.error("[Telegram Bot] Handler error processing update:", err.message);
          });
        }
      }
    } catch (err) {
      // Handle standard polling timeouts/network disconnects gracefully
      if (err.code === "ECONNABORTED" || err.code === "ERR_BAD_RESPONSE") {
        // Just silent retry
      } else {
        console.error("[Telegram Bot] Polling error. Retrying in 5 seconds:", err.message);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
}

/**
 * Start Express webserver and configure Telegram connection mode.
 */
async function startServer() {
  const PORT = config.PORT;

  try {
    // 1. Establish MongoDB Connection
    console.log("[Telegram] Initializing database...");
    // Let's connect immediately so services are ready
    const mongoose = require("mongoose");
    await mongoose.connect(config.MONGODB_URI);
    console.log("[Telegram] Mongoose connected successfully.");

    // 2. Start listening
    app.listen(PORT, async () => {
      console.log(`
      ┌──────────────────────────────────────────┐
      │  EchoMind Telegram Bot Backend Active     │
      ├──────────────────────────────────────────┤
      │  Port: ${PORT}                               │
      │  Database: MongoDB (Mongoose)            │
      └──────────────────────────────────────────┘
      `);

      // 3. Configure bot connection mode
      if (!config.BOT_TOKEN) {
        console.error("❌ BOT_TOKEN is missing! Please configure it in your environment/variables.");
        return;
      }

      if (config.WEBHOOK_URL) {
        // Production Mode: Set webhook
        const webhookEndpoint = `${config.WEBHOOK_URL}/api/telegram/webhook`;
        console.log(`[Telegram Bot] Production mode: Setting webhook to ${webhookEndpoint}`);
        try {
          await sender.setWebhook(webhookEndpoint, config.WEBHOOK_SECRET);
        } catch (err) {
          console.error("❌ Failed to set webhook:", err.message);
        }
      } else {
        // Development Mode: Run long polling
        startLongPolling().catch((err) => {
          console.error("❌ Long polling failed crash:", err.message);
        });
      }
    });
  } catch (err) {
    console.error("❌ Server startup crashed:", err.message);
    process.exit(1);
  }
}

startServer();
