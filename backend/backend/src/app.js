// Load .env variables FIRST — before any other require reads process.env
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const config = require("./config");
const errorHandler = require("./middlewares/errorHandler");
const { ensureUsersTable } = require("./models/userModel");

const parseRoutes    = require("./routes/parseRoutes");
const analyzeRoutes  = require("./routes/analyzeRoutes");
const generateRoutes = require("./routes/generateRoutes");
const authRoutes     = require("./routes/authRoutes");

const app = express();

// Allow all origins — unrestricted for local hackathon dev
app.use(cors());

// 5 MB limit — WhatsApp chat exports can be substantial
app.use(express.json({ limit: "5mb" }));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── API routes ───────────────────────────────────────────────────────────────
app.use("/api", authRoutes);      // /api/auth/signup  /api/auth/login
app.use("/api", parseRoutes);
app.use("/api", analyzeRoutes);
app.use("/api", generateRoutes);

// ── Global error handler — MUST be last ─────────────────────────────────────
app.use(errorHandler);

// ── Start server (ensure DB table exists first) ───────────────────────────────
async function startServer() {
  try {
    await ensureUsersTable();
    console.log("[DB] users table ready");
  } catch (err) {
    // Surface a clear message — missing DATABASE_URL is the #1 startup failure
    console.error("[DB] Could not connect to PostgreSQL:", err.message);
    console.error("     Check that DATABASE_URL is set in your .env file and PostgreSQL is running.");
    process.exit(1);
  }

  app.listen(config.PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║          EchoMind Backend — Running          ║
  ╠══════════════════════════════════════════════╣
  ║  Port  : ${config.PORT}                              ║
  ║  Ollama: ${config.OLLAMA_URL}     ║
  ║  Model : ${config.OLLAMA_MODEL}                  ║
  ╚══════════════════════════════════════════════╝
    `);
  });
}

startServer();

module.exports = app; // for testing convenience
