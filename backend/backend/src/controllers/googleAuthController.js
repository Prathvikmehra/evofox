/**
 * googleAuthController.js — handles Auth0 Google login sync.
 *
 * After the frontend completes an Auth0 Google login, it calls
 * POST /api/auth/google-sync with { name, email, auth0Id }.
 * This handler creates a new Postgres row (or returns the existing one)
 * and issues a JWT in the same shape as the email/password endpoints,
 * so the frontend can treat all three auth paths identically.
 */
const jwt = require("jsonwebtoken");
const { findUserByEmail, createGoogleUser } = require("../models/userModel");

const JWT_EXPIRES_IN = "7d";

// ── Reuse the same signing pattern as authController.js ──────────────────────
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── handleGoogleSync ──────────────────────────────────────────────────────────
exports.handleGoogleSync = async (req, res, next) => {
  try {
    const { name, email, auth0Id } = req.body;

    // ── Basic validation ──────────────────────────────────────────────────
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required" });
    }
    if (!auth0Id || typeof auth0Id !== "string") {
      return res.status(400).json({ error: "auth0Id is required" });
    }

    // ── Lookup or create ──────────────────────────────────────────────────
    let user = await findUserByEmail(email.toLowerCase().trim());

    if (!user) {
      // New Google user — persist with NULL password
      user = await createGoogleUser(
        (name || email).trim(),
        email.toLowerCase().trim(),
        auth0Id
      );
    }

    // ── Issue JWT (same shape as email/password responses) ────────────────
    const token = generateToken(user.id, user.email);

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};
