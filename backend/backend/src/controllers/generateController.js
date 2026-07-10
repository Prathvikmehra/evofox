const { findSimilarExamples } = require("../../../ai/retriever/findSimilarExamples");
const { buildPrompt } = require("../../../ai/prompts/buildPrompt");
const { callOllama } = require("../../../ai/response/callOllama");

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

    // Input validation
    if (!newMessage || typeof newMessage !== "string" || newMessage.trim().length === 0) {
      return res.status(400).json({ error: "newMessage is required" });
    }
    if (!Array.isArray(pairs) || pairs.length === 0) {
      return res.status(400).json({ error: "pairs array is required" });
    }
    if (!styleProfile || typeof styleProfile !== "object") {
      return res.status(400).json({ error: "styleProfile object is required" });
    }

    // Retrieve relevant examples, build prompt, call local model
    const examples = findSimilarExamples(newMessage, pairs);
    const prompt = buildPrompt(newMessage, styleProfile, examples);
    const reply = await callOllama(prompt);

    return res.status(200).json({ reply });
  } catch (err) {
    // All errors (including Ollama failures) flow through the shared error handler
    next(err);
  }
};
