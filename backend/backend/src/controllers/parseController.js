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

    // DEBUG: log first line chars to identify format
    const firstLine = rawText.split("\n")[0];
    const charCodes = [...firstLine].map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4,'0')}(${c})`).join(' ');
    console.log("[DEBUG] First line:", JSON.stringify(firstLine));
    console.log("[DEBUG] Char codes:", charCodes);

    // Parse then clean
    const parsed = parseWhatsAppText(rawText);
    console.log("[DEBUG] Parsed count:", parsed.length, "first:", JSON.stringify(parsed[0]));
    const messages = cleanMessages(parsed);
    console.log("[DEBUG] After clean count:", messages.length);

    if (messages.length === 0) {
      return res.status(400).json({
        error: "Couldn't parse any messages — check the format",
        debug_firstLine: firstLine,
        debug_charCodes: charCodes,
      });
    }

    // Unique senders, preserving first-seen order
    const senders = [...new Set(messages.map((m) => m.sender))];

    return res.status(200).json({ messages, senders });
  } catch (err) {
    next(err);
  }
};
