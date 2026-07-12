"use strict";

const config = require("../../backend/src/config");
const { embedBatch } = require("../embeddings/embedText");
const { cosineSimilarity } = require("./vectorMath");

/**
 * Keyword score: how many words from `query` appear in `document` (normalized).
 * @param {string} query
 * @param {string} document
 * @returns {number} 0–1
 */
function keywordScore(query, document) {
  const queryWords = new Set(
    query
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
  );
  if (queryWords.size === 0) return 0;

  const docWords = document.toLowerCase();
  let hits = 0;
  for (const word of queryWords) {
    if (docWords.includes(word)) hits++;
  }
  return hits / queryWords.size;
}

/**
 * Find similar examples using Maximal Marginal Relevance (MMR).
 * If Ollama embeddings fail/are offline, degrades gracefully to pure keyword overlap.
 * 
 * @param {string} newMessage 
 * @param {Array<{ incoming: string, reply: string }>} pairs 
 * @param {number} topN 
 */
async function findSimilarExamples(newMessage, pairs, topN = config.RETRIEVAL_TOP_N) {
  if (!Array.isArray(pairs) || pairs.length === 0) return [];
  if (!newMessage || typeof newMessage !== "string") return pairs.slice(0, topN);

  const lambda = config.RETRIEVAL_MMR_LAMBDA;
  const alpha = config.RETRIEVAL_ALPHA;
  
  // 1. Get query embedding
  const [queryEmb] = await embedBatch([newMessage]);

  // 2. Get history embeddings (nulls if Ollama is down)
  const docEmbs = await embedBatch(pairs.map((p) => p.incoming || ""));

  // 3. Pre-compute hybrid relevance scores for all pairs
  const candidates = pairs.map((pair, idx) => {
    const kwScore = keywordScore(newMessage, pair.incoming);
    
    // If embedding failed, fallback to 100% keyword score
    let semanticScore = 0;
    let hybridScore = kwScore;
    
    if (queryEmb && docEmbs[idx]) {
      semanticScore = cosineSimilarity(queryEmb, docEmbs[idx]);
      hybridScore = alpha * semanticScore + (1 - alpha) * kwScore;
    }

    return {
      pair,
      idx,
      emb: docEmbs[idx],
      relevance: hybridScore,
    };
  });

  // Sort initially by relevance
  candidates.sort((a, b) => b.relevance - a.relevance);

  // 4. Select topN using MMR
  const selected = [];
  const unselected = [...candidates];

  while (selected.length < topN && unselected.length > 0) {
    // If it's the first selection, just take the most relevant one
    if (selected.length === 0) {
      selected.push(unselected.shift());
      continue;
    }

    // Otherwise, find the unselected candidate that maximizes the MMR score
    let bestMMR = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < unselected.length; i++) {
      const candidate = unselected[i];
      
      // Calculate max similarity to any already selected candidate
      let maxSimToSelected = 0;
      if (candidate.emb) { // Only calculate diversity if embeddings exist
        for (const sel of selected) {
          if (sel.emb) {
            const sim = cosineSimilarity(candidate.emb, sel.emb);
            if (sim > maxSimToSelected) maxSimToSelected = sim;
          }
        }
      }

      // MMR Formula: λ * Relevance - (1 - λ) * DiversityPenalty
      const mmrScore = (lambda * candidate.relevance) - ((1 - lambda) * maxSimToSelected);

      if (mmrScore > bestMMR) {
        bestMMR = mmrScore;
        bestIndex = i;
      }
    }

    // Push the best candidate and remove from unselected
    selected.push(unselected[bestIndex]);
    unselected.splice(bestIndex, 1);
  }

  // 5. Fill remaining gaps with random pairs (if not enough pairs matched anything)
  // MMR guarantees we take topN if available, but if relevance was 0 for many,
  // we might want them anyway. The while loop above actually selects `topN` items 
  // regardless of score, so gap filling is only needed if `pairs.length < topN`.
  
  return selected.map((s) => s.pair);
}

module.exports = { findSimilarExamples };
