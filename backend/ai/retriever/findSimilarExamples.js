/**
 * findSimilarExamples — retrieve the most relevant past (incoming, reply)
 * pairs to use as few-shot examples when generating a new reply.
 *
 * Uses word-overlap scoring (intersection of token sets) — fast, zero
 * dependencies, and debuggable by eye for hackathon-scale datasets.
 *
 * If fewer than topN pairs have any word overlap with the new message,
 * random pairs from the full set are used to fill the gap so the LLM
 * always has at least some style examples to anchor on.
 *
 * @param {string} newMessage
 * @param {Array<{ incoming: string, reply: string }>} pairs
 * @param {number} [topN=6]
 * @returns {Array<{ incoming: string, reply: string }>}
 */

/**
 * Tokenise a string: lowercase, strip punctuation, split on whitespace.
 * Returns a Set of unique words.
 *
 * @param {string} text
 * @returns {Set<string>}
 */
function tokenise(text) {
  if (!text || typeof text !== "string") return new Set();
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0)
  );
}

function findSimilarExamples(newMessage, pairs, topN = 6) {
  if (!Array.isArray(pairs) || pairs.length === 0) return [];
  if (!newMessage || typeof newMessage !== "string") return pairs.slice(0, topN);

  const queryTokens = tokenise(newMessage);

  // Score every pair by word-overlap count
  const scored = pairs.map((pair) => {
    const pairTokens = tokenise(pair.incoming);
    let overlap = 0;
    for (const token of queryTokens) {
      if (pairTokens.has(token)) overlap++;
    }
    return { pair, overlap };
  });

  // Sort descending by overlap score
  scored.sort((a, b) => b.overlap - a.overlap);

  // Take pairs that actually share at least one word
  const relevant = scored
    .filter((s) => s.overlap > 0)
    .slice(0, topN)
    .map((s) => s.pair);

  // If we don't have enough, fill with random pairs from the full set
  if (relevant.length < topN) {
    // Exclude pairs already selected
    const selectedSet = new Set(relevant);
    const remaining = pairs.filter((p) => !selectedSet.has(p));

    // Fisher-Yates shuffle of remaining for randomness
    const shuffled = [...remaining];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const needed = topN - relevant.length;
    relevant.push(...shuffled.slice(0, needed));
  }

  return relevant;
}

module.exports = { findSimilarExamples };
