const express = require("express");
const cors = require("cors");
const config = require("./config");
const errorHandler = require("./middlewares/errorHandler");

const parseRoutes = require("./routes/parseRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");
const generateRoutes = require("./routes/generateRoutes");

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
app.use("/api", parseRoutes);
app.use("/api", analyzeRoutes);
app.use("/api", generateRoutes);

// ── Global error handler — MUST be last ─────────────────────────────────────
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
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

module.exports = app; // for testing convenience
