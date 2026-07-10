const { buildReplyPairs } = require("../../../ai/parser/buildReplyPairs");
const { buildStyleProfile } = require("../../../ai/personality/buildStyleProfile");

/**
 * POST /api/analyze
 *
 * Body: {
 *   messages: Array<{ timestamp, sender, text }>,
 *   targetSender: string
 * }
 *
 * Returns: {
 *   pairs: Array<{ incoming, reply }>,
 *   styleProfile: StyleProfile
 * }
 */
exports.handleAnalyze = async (req, res, next) => {
  try {
    const { messages, targetSender } = req.body;

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }
    if (!targetSender || typeof targetSender !== "string") {
      return res.status(400).json({ error: "targetSender is required" });
    }

    // Build reply pairs
    const pairs = buildReplyPairs(messages, targetSender);

    if (pairs.length === 0) {
      return res.status(400).json({
        error:
          "No reply pairs found for this sender — try a different chat or sender",
      });
    }

    // Build style profile from those pairs
    const styleProfile = buildStyleProfile(pairs);

    return res.status(200).json({ pairs, styleProfile });
  } catch (err) {
    next(err);
  }
};
