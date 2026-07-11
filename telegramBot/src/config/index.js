require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 4000,
  BOT_TOKEN: process.env.BOT_TOKEN,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/echomind_telegram",
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2:3b",
  WEBHOOK_URL: process.env.WEBHOOK_URL, // e.g. https://yourdomain.com
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "echomind_secret_123"
};
