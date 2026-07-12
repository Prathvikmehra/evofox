/**
 * semanticRetriever — pick the best few-shot examples to show the model.
 *
 * This is the core upgrade that puts EchoMind ahead of a plain keyword system:
 * it combines TRUE semantic similarity (embedding cosine) with lexical overlap,
 * then applies MMR (Maximal Marginal Relevance) so the chosen examples are both
 * relevant AND diverse — no feeding the model six near-identical messages.
 *
 * It is deliberately SYNCHRONOUS: the caller embeds the incoming message once
 * (async) and passes the vector in here. That keeps all the ranking math pure
 * and unit-testable with zero network/Ollama dependency.
 *
 * Graceful degradation: if there is no query embedding, or none of the pairs
 * carry embeddings, it transparently falls back to the original lexical
 * retriever (findSimilarExamples) — so the app still works with the embed model
 * uninstalled, just less accurately.
 */

const config = require("../../backend/src/config");
const { cosineSimilarity } = require("./vectorMath");
const { findSimilarExamples } = require("./findSimilarExamples");

/**
 * Tokenise into a Set of lowercased word tokens (punctuation stripped).
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
      .filter(Boolean)
  );
}

/**
 * Lexical score in [0,1]: fraction of the query's words that appear in `doc`.
 * @param {Set<string>} queryTokens
 * @param {string} doc
 * @returns {number}
 */
function keywordScore(queryTokens, doc) {
  if (queryTokens.size === 0) return 0;
  const docTokens = tokenise(doc);
  let hits = 0;
  for (const t of queryTokens) if (docTokens.has(t)) hits++;
  return hits / queryTokens.size;
}

/**
 * Whether we can run in semantic mode: we have a query vector AND at least one
 * pair carries an embedding to compare against.
 * @param {number[]|null|undefined} queryEmbedding
 * @param {Array<{embedding?: number[]}>} pairs
 * @returns {boolean}
 */
function canRunSemantic(queryEmbedding, pairs) {
  return (
    Array.isArray(queryEmbedding) &&
    queryEmbedding.length > 0 &&
    Array.isArray(pairs) &&
    pairs.some((p) => Array.isArray(p && p.embedding) && p.embedding.length > 0)
  );
}

/**
 * MMR selection: greedily pick items that are relevant to the query but also
 * dissimilar to what's already been picked.
 *
 *   score(candidate) = lambda * relevance
 *                    - (1 - lambda) * max_sim(candidate, already-selected)
 *
 * Similarity between candidates uses their embeddings (0 when either lacks one,
 * so embedding-less pairs are always treated as "diverse").
 *
 * @param {Array<{ pair: object, relevance: number, embedding: number[]|null }>} scored
 * @param {number} topN
 * @param {number} lambda
 * @returns {object[]} selected pairs, best-first
 */
function mmrSelect(scored, topN, lambda) {
  const selected = [];
  const remaining = [...scored];

  while (selected.length < topN && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i];

      // Redundancy: highest similarity to anything already chosen.
      let maxSim = 0;
      for (const sel of selected) {
        if (cand.embedding && sel.embedding) {
          const sim = cosineSimilarity(cand.embedding, sel.embedding);
          if (sim > maxSim) maxSim = sim;
        }
      }

      const mmr = lambda * cand.relevance - (1 - lambda) * maxSim;
      if (mmr > bestScore) {
        bestScore = mmr;
        bestIdx = i;
      }
    }

    const [chosen] = remaining.splice(bestIdx, 1);
    selected.push(chosen);
  }

  return selected.map((s) => s.pair);
}

/**
 * Select few-shot examples for a new incoming message.
 *
 * @param {string} newMessage
 * @param {Array<{ incoming: string, reply: string, embedding?: number[] }>} pairs
 * @param {number[]|null} [queryEmbedding]  Embedding of `newMessage` (may be null).
 * @param {object} [opts]
 * @param {number} [opts.topN]
 * @param {number} [opts.alpha]        semantic weight [0..1]
 * @param {number} [opts.mmrLambda]    relevance-vs-diversity [0..1]
 * @returns {Array<{ incoming: string, reply: string }>}
 */
function selectExamples(newMessage, pairs, queryEmbedding = null, opts = {}) {
  const topN = opts.topN ?? config.RETRIEVAL_TOP_N;
  const alpha = opts.alpha ?? config.RETRIEVAL_ALPHA;
  const mmrLambda = opts.mmrLambda ?? config.RETRIEVAL_MMR_LAMBDA;

  if (!Array.isArray(pairs) || pairs.length === 0) return [];

  // ── Fallback: no semantic signal available → original lexical retriever ────
  if (!canRunSemantic(queryEmbedding, pairs)) {
    return findSimilarExamples(newMessage, pairs, topN).map(({ incoming, reply }) => ({
      incoming,
      reply,
    }));
  }

  // ── Hybrid scoring: semantic cosine blended with keyword overlap ───────────
  const queryTokens = tokenise(newMessage);
  const scored = pairs.map((pair) => {
    const emb = Array.isArray(pair.embedding) ? pair.embedding : null;
    const semantic = emb ? Math.max(0, cosineSimilarity(queryEmbedding, emb)) : 0;
    const lexical = keywordScore(queryTokens, pair.incoming);
    const relevance = alpha * semantic + (1 - alpha) * lexical;
    return { pair: { incoming: pair.incoming, reply: pair.reply }, relevance, embedding: emb };
  });

  // Pre-sort by relevance so MMR starts from the strongest candidate.
  scored.sort((a, b) => b.relevance - a.relevance);

  // ── Diversify with MMR and return the final example set ────────────────────
  return mmrSelect(scored, topN, mmrLambda);
}

module.exports = { selectExamples, keywordScore, mmrSelect, canRunSemantic, tokenise };
