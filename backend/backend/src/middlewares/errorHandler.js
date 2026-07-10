/**
 * Global error handler — must be registered LAST in Express middleware chain.
 * All 4 params are required for Express to recognise this as an error handler.
 * Never leaks a raw stack trace; client only ever sees { error: "..." }.
 */
// eslint-disable-next-line no-unused-vars
module.exports = function errorHandler(err, req, res, next) {
  console.error("[EchoMind] Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
};
