const { generateReply } = require("../../../ai/generate/generateReply");

/**
 * POST /api/generate-reply
 *
 * Body: {
 *   newMessage: string,
 *   pairs: Array<{ incoming, reply }>,
 *   styleProfile: StyleProfile
 * }
 *
 * Returns: { reply: string }
 */
exports.handleGenerateReply = async (req, res, next) => {
  try {
    const { newMessage, pairs, styleProfile } = req.body;

    // Input validation — unchanged from before
    if (!newMessage || typeof newMessage !== "string" || newMessage.trim().length === 0) {
      return res.status(400).json({ error: "newMessage is required" });
    }
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return res.status(400).json({ error: "pairs array is required" });
    }
    if (!styleProfile || typeof styleProfile !== "object") {
      return res.status(400).json({ error: "styleProfile object is required" });
    }

    // Delegate the entire pipeline (example retrieval → prompt → Ollama) to
    // the ai/ module rather than reimplementing the steps here.
    const reply = await generateReply({
      incomingMessage: newMessage,
      styleProfile,
      samplePairs: pairs,
    });

    return res.status(200).json({ reply });
  } catch (err) {
    // All errors (including Ollama failures) flow through the shared error handler
    next(err);
  }
};
