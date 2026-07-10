// TODO: implement handleParse
// - read rawText from req.body
// - call parseWhatsAppText() + cleanMessages() from ai/parser and ai/cleaner
// - return { messages, senders }
exports.handleParse = async (req, res, next) => {
  try {
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
};
