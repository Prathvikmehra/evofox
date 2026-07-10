/**
 * authMiddleware.js — JWT verification middleware.
 *
 * Usage on any protected route:
 *   const { verifyToken } = require("../middlewares/authMiddleware");
 *   router.get("/protected", verifyToken, handler);
 *
 * On success, attaches the decoded JWT payload to req.user:
 *   { userId, email, iat, exp }
 */
const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Expect: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email, iat, exp }
    return next();
  } catch {
    // Covers TokenExpiredError, JsonWebTokenError, NotBeforeError
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
