/**
 * vectorMath — tiny, dependency-free linear-algebra helpers used by the
 * semantic retriever. Kept separate so they can be unit-tested without any
 * network or Ollama dependency.
 *
 * All functions are pure and defensive: malformed input (non-arrays, length
 * mismatches, zero-vectors) returns 0 rather than throwing, so a bad embedding
 * can never crash the generate pipeline — it just scores as "not similar".
 */

/**
 * Dot product of two equal-length numeric vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function dot(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/**
 * Euclidean (L2) norm of a vector.
 * @param {number[]} a
 * @returns {number}
 */
function norm(a) {
  if (!Array.isArray(a)) return 0;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * a[i];
  return Math.sqrt(sum);
}

/**
 * Cosine similarity in [-1, 1]. Returns 0 for empty / mismatched / zero
 * vectors so callers never divide by zero or propagate NaN.
 *
 * Note: nomic-embed-text / all-minilm return normalized vectors, so this is
 * effectively a dot product — but we normalise anyway to stay correct for any
 * embedding model the user swaps in.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number}
 */
function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
    return 0;
  }
  const denom = norm(a) * norm(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}

module.exports = { dot, norm, cosineSimilarity };
