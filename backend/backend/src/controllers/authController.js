/**
 * authController.js — signup and login handlers.
 *
 * Security rules enforced here:
 *  - Passwords are NEVER logged, returned, or stored in plaintext.
 *  - All DB lookups use the model layer (parameterized queries).
 *  - JWT is signed with process.env.JWT_SECRET (set in .env).
 *  - Both "user not found" and "wrong password" return the same 401
 *    message to prevent email enumeration.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/userModel");

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = "7d";

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@");
}

// ── handleSignup ─────────────────────────────────────────────────────────────
exports.handleSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email address is required" });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // ── Duplicate email check ─────────────────────────────────────────────
    const existing = await findUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // ── Hash + persist ────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await createUser(name.trim(), email.toLowerCase().trim(), hashedPassword);

    // ── Issue JWT ─────────────────────────────────────────────────────────
    const token = generateToken(user.id, user.email);

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};

// ── handleLogin ───────────────────────────────────────────────────────────────
exports.handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Validation ────────────────────────────────────────────────────────
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email address is required" });
    }
    if (!password || typeof password !== "string" || password.trim().length === 0) {
      return res.status(400).json({ error: "Password is required" });
    }

    // ── Lookup ────────────────────────────────────────────────────────────
    const user = await findUserByEmail(email.toLowerCase().trim());

    // Same error for "not found" and "wrong password" — prevents enumeration
    const INVALID_CREDS = { error: "Invalid email or password" };

    if (!user) {
      return res.status(401).json(INVALID_CREDS);
    }

    // ── Password verify ───────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json(INVALID_CREDS);
    }

    // ── Issue JWT ─────────────────────────────────────────────────────────
    const token = generateToken(user.id, user.email);

    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
};
