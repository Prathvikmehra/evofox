/**
 * Central configuration — reads from environment variables with
 * sensible defaults for local development.
 */
module.exports = {
  PORT: process.env.PORT || 3000,
  OLLAMA_URL: process.env.OLLAMA_URL || "http://localhost:11434",

  // Generation model. llama3.1:8b is noticeably better at holding a specific
  // texting voice than the 3b default; override via env if RAM is tight.
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2:3b",

  // Embedding model for semantic retrieval. Pull once with:
  //   ollama pull nomic-embed-text
  // Small (~275MB), fast, 768-dim. `all-minilm` is an even lighter alternative.
  OLLAMA_EMBED_MODEL: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",

  // Generation sampling + length controls (previously hard-coded in callOllama).
  GEN_TEMPERATURE: parseFloat(process.env.GEN_TEMPERATURE || "0.7"),
  GEN_NUM_PREDICT: parseInt(process.env.GEN_NUM_PREDICT || "100", 10),

  // Retrieval knobs.
  //  RETRIEVAL_TOP_N : how many few-shot examples to feed the model.
  //  RETRIEVAL_ALPHA : weight of semantic score vs keyword score [0..1].
  //  RETRIEVAL_MMR_LAMBDA : relevance-vs-diversity tradeoff for MMR [0..1].
  RETRIEVAL_TOP_N: parseInt(process.env.RETRIEVAL_TOP_N || "6", 10),
  RETRIEVAL_ALPHA: parseFloat(process.env.RETRIEVAL_ALPHA || "0.7"),
  RETRIEVAL_MMR_LAMBDA: parseFloat(process.env.RETRIEVAL_MMR_LAMBDA || "0.7"),
};
