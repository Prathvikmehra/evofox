// TODO: implement handleGenerateReply
// - read { newMessage, pairs, styleProfile } from req.body
// - call findSimilarExamples() from ai/retriever
// - call buildPrompt() from ai/prompts
// - call callOllama() from ai/response
// - return { reply }
exports.handleGenerateReply = async (req, res, next) => {
  try {
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
};
