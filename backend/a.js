/**
 * setup-backend.js
 * Run with: node setup-backend.js
 * Scaffolds the EchoMind backend folder structure with placeholder files.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "backend", "src");

// ---- Folder structure ----
const folders = [
  "config",
  "controllers",
  "routes",
  "middlewares",
  "services",
  "utils",
];

// ---- Files with starter boilerplate content ----
const files = {
  "app.js": `const express = require("express");
const cors = require("cors");
const config = require("./config");
const errorHandler = require("./middlewares/errorHandler");

const parseRoutes = require("./routes/parseRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");
const generateRoutes = require("./routes/generateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", parseRoutes);
app.use("/api", analyzeRoutes);
app.use("/api", generateRoutes);

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(\`EchoMind backend running on port \${config.PORT}\`);
});
`,

  "config/index.js": `module.exports = {
  PORT: process.env.PORT || 3000,
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2:3b",
};
`,

  "middlewares/errorHandler.js": `// Global error handler - keep this last in the middleware chain
module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Something went wrong" });
};
`,

  "controllers/parseController.js": `// TODO: implement handleParse
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
`,

  "controllers/analyzeController.js": `// TODO: implement handleAnalyze
// - read { messages, targetSender } from req.body
// - call buildReplyPairs() from ai/parser
// - call buildStyleProfile() from ai/personality
// - return { pairs, styleProfile }
exports.handleAnalyze = async (req, res, next) => {
  try {
    res.status(501).json({ error: "Not implemented yet" });
  } catch (err) {
    next(err);
  }
};
`,

  "controllers/generateController.js": `// TODO: implement handleGenerateReply
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
`,

  "routes/parseRoutes.js": `const express = require("express");
const router = express.Router();
const { handleParse } = require("../controllers/parseController");

router.post("/parse", handleParse);

module.exports = router;
`,

  "routes/analyzeRoutes.js": `const express = require("express");
const router = express.Router();
const { handleAnalyze } = require("../controllers/analyzeController");

router.post("/analyze", handleAnalyze);

module.exports = router;
`,

  "routes/generateRoutes.js": `const express = require("express");
const router = express.Router();
const { handleGenerateReply } = require("../controllers/generateController");

router.post("/generate-reply", handleGenerateReply);

module.exports = router;
`,

  "services/.gitkeep": "",
  "utils/.gitkeep": "",
};

// ---- AI module structure (sits alongside backend/src) ----
const aiFolders = ["parser", "cleaner", "personality", "retriever", "prompts", "response"];
const aiRoot = path.join(__dirname, "ai");

const aiFiles = {
  "parser/parseWhatsAppText.js": `// TODO: export parseWhatsAppText(rawText) -> array of { timestamp, sender, text }
module.exports = function parseWhatsAppText(rawText) {
  throw new Error("Not implemented");
};
`,
  "parser/buildReplyPairs.js": `// TODO: export buildReplyPairs(messages, targetSender) -> array of { incoming, reply }
module.exports = function buildReplyPairs(messages, targetSender) {
  throw new Error("Not implemented");
};
`,
  "cleaner/cleanMessages.js": `// TODO: export cleanMessages(messages) -> filtered array
module.exports = function cleanMessages(messages) {
  throw new Error("Not implemented");
};
`,
  "personality/buildStyleProfile.js": `// TODO: export buildStyleProfile(pairs) -> style profile object
module.exports = function buildStyleProfile(pairs) {
  throw new Error("Not implemented");
};
`,
  "retriever/findSimilarExamples.js": `// TODO: export findSimilarExamples(newMessage, pairs, topN = 6) -> array of pairs
module.exports = function findSimilarExamples(newMessage, pairs, topN = 6) {
  throw new Error("Not implemented");
};
`,
  "prompts/buildPrompt.js": `// TODO: export buildPrompt(newMessage, styleProfile, examples) -> prompt string
module.exports = function buildPrompt(newMessage, styleProfile, examples) {
  throw new Error("Not implemented");
};
`,
  "response/callOllama.js": `// TODO: export async callOllama(prompt) -> generated reply string
module.exports = async function callOllama(prompt) {
  throw new Error("Not implemented");
};
`,
};

// ---- Helpers ----
function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFileIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`Skipped (already exists): ${filePath}`);
    return;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Created: ${filePath}`);
}

// ---- Run ----
function scaffold() {
  folders.forEach((folder) => ensureDir(path.join(ROOT, folder)));
  Object.entries(files).forEach(([relPath, content]) => {
    writeFileIfMissing(path.join(ROOT, relPath), content);
  });

  aiFolders.forEach((folder) => ensureDir(path.join(aiRoot, folder)));
  Object.entries(aiFiles).forEach(([relPath, content]) => {
    writeFileIfMissing(path.join(aiRoot, relPath), content);
  });

  console.log("\\nEchoMind backend + ai folder structure ready.");
  console.log("Next: cd backend && npm init -y && npm install express cors");
}

scaffold();