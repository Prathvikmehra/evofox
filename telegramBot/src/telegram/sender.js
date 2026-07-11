const axios = require("axios");
const config = require("../config");

class TelegramSender {
  constructor() {
    this.token = config.BOT_TOKEN;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  /**
   * Send a text message to a user.
   */
  async sendMessage(chatId, text, extra = {}) {
    if (!this.token) {
      console.error("[Telegram] BOT_TOKEN is missing");
      return null;
    }
    try {
      const res = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        ...extra,
      });
      return res.data;
    } catch (err) {
      console.error("[Telegram] sendMessage failed:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Send an answer to a callback query (for inline keyboard clicks).
   */
  async answerCallbackQuery(callbackQueryId, text = "", showAlert = false) {
    if (!this.token) return null;
    try {
      const res = await axios.post(`${this.baseUrl}/answerCallbackQuery`, {
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      });
      return res.data;
    } catch (err) {
      console.error("[Telegram] answerCallbackQuery failed:", err.response?.data || err.message);
    }
  }

  /**
   * Retrieve file metadata (including file_path) from Telegram.
   */
  async getFile(fileId) {
    if (!this.token) return null;
    try {
      const res = await axios.post(`${this.baseUrl}/getFile`, {
        file_id: fileId,
      });
      return res.data.result; // contains file_path, file_size
    } catch (err) {
      console.error("[Telegram] getFile failed:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Download a file's raw content from Telegram using its file_path.
   */
  async downloadFile(filePath) {
    if (!this.token) return null;
    try {
      const res = await axios.get(`https://api.telegram.org/file/bot${this.token}/${filePath}`, {
        responseType: "text",
      });
      return res.data;
    } catch (err) {
      console.error("[Telegram] downloadFile failed:", err.message);
      throw err;
    }
  }

  /**
   * Register webhook URL.
   */
  async setWebhook(url, secretToken) {
    if (!this.token) return null;
    try {
      const res = await axios.post(`${this.baseUrl}/setWebhook`, {
        url,
        secret_token: secretToken,
        allowed_updates: ["message", "callback_query"],
      });
      console.log("[Telegram] Webhook registered successfully:", res.data);
      return res.data;
    } catch (err) {
      console.error("[Telegram] setWebhook failed:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Delete webhook (useful when switching to polling).
   */
  async deleteWebhook() {
    if (!this.token) return null;
    try {
      const res = await axios.post(`${this.baseUrl}/deleteWebhook`);
      console.log("[Telegram] Webhook deleted successfully:", res.data);
      return res.data;
    } catch (err) {
      console.error("[Telegram] deleteWebhook failed:", err.response?.data || err.message);
      throw err;
    }
  }
}

module.exports = new TelegramSender();
