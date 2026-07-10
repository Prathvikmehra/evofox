const { parseWhatsAppText } = require("../../../ai/parser/parseWhatsAppText");
const { cleanMessages } = require("../../../ai/cleaner/cleanMessages");

/**
 * POST /api/parse
 *
 * Body: { rawText: string }
 *
 * Returns: {
 *   messages: Array<{ timestamp, sender, text }>,
 *   senders: string[]   — unique sender names found in the chat
 * }
 */
exports.handleParse = async (req, res, next) => {
  try {
    const { rawText } = req.body;

    // Input validation
    if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
      return res.status(400).json({ error: "No chat text provided" });
    }

    // Parse then clean
    const parsed = parseWhatsAppText(rawText);
    const messages = cleanMessages(parsed);

    if (messages.length === 0) {
      return res.status(400).json({
        error: "Couldn't parse any messages — check the format",
      });
    }

    // Unique senders, preserving first-seen order
    const senders = [...new Set(messages.map((m) => m.sender))];

    return res.status(200).json({ messages, senders });
  } catch (err) {
    next(err);
  }
};
