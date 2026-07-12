"use strict";

/**
 * DEPRECATED shim — kept only so any stray import doesn't break.
 *
 * This module originally held a standalone semantic+MMR retriever. The wired
 * implementation now lives in ./mmrRetriever.js (which builds on ./vectorMath.js
 * and ../embeddings/embedText.js). To avoid two divergent copies of the same
 * algorithm, this file just re-exports the canonical one.
 *
 * Prefer requiring ./mmrRetriever directly.
 */
module.exports = require("./mmrRetriever");
