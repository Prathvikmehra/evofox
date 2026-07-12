"use strict";

const { pipeline, env } = require('@xenova/transformers');

// Prevent Xenova from polluting the console with warnings
env.allowLocalModels = true;
env.useBrowserCache = false;

class SemanticRetriever {
  constructor() {
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
    this.extractor = null;
    this.initPromise = null;
    // Simple memory cache: incoming text -> embedding array
    this.embeddingCache = new Map();
  }

  async init() {
    if (this.extractor) return;
    if (!this.initPromise) {
      console.log(`[Semantic RAG] Loading embedding model ${this.modelName}...`);
      this.initPromise = pipeline('feature-extraction', this.modelName);
    }
    this.extractor = await this.initPromise;
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
  }

  /**
   * Embeds a list of strings efficiently, using caching.
   * @param {string[]} texts 
   * @returns {Promise<number[][]>}
   */
  async embedBatch(texts) {
    await this.init();
    
    const results = new Array(texts.length);
    const toEmbedIdx = [];
    const toEmbedTexts = [];

    // Check cache
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (this.embeddingCache.has(text)) {
        results[i] = this.embeddingCache.get(text);
      } else {
        toEmbedIdx.push(i);
        toEmbedTexts.push(text);
      }
    }

    // Embed missing
    if (toEmbedTexts.length > 0) {
      // Process in batches of 100 to prevent memory spikes
      const batchSize = 100;
      for (let i = 0; i < toEmbedTexts.length; i += batchSize) {
        const batch = toEmbedTexts.slice(i, i + batchSize);
        const output = await this.extractor(batch, { pooling: 'mean', normalize: true });
        const arrays = output.tolist();
        
        for (let j = 0; j < batch.length; j++) {
          const originalIdx = toEmbedIdx[i + j];
          const emb = arrays[j];
          results[originalIdx] = emb;
          this.embeddingCache.set(batch[j], emb); // Cache it
        }
      }
    }

    return results;
  }

  /**
   * Keyword score: how many words from `query` appear in `document` (normalized).
   * @param {string} query
   * @param {string} document
   * @returns {number} 0–1
   */
  keywordScore(query, document) {
    const queryWords = new Set(
      query.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)
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
   * Find top N most semantically relevant examples for a new message.
   * Uses a Hybrid Search approach (70% Semantic + 30% Keyword).
   */
  async findSimilarExamples(newMessage, pairs, topN = 6) {
    if (!Array.isArray(pairs) || pairs.length === 0) return [];
    if (!newMessage || typeof newMessage !== 'string') return pairs.slice(0, topN);

    // 1. Embed query
    const [queryEmb] = await this.embedBatch([newMessage]);

    // 2. Embed all incoming messages from history
    const incomingTexts = pairs.map(p => p.incoming || "");
    const docEmbs = await this.embedBatch(incomingTexts);

    // 3. Score using Hybrid Search
    const alpha = 0.7; // Semantic weight
    
    const scoredPairs = pairs.map((pair, idx) => {
      const semanticScore = this.cosineSimilarity(queryEmb, docEmbs[idx]);
      const kwScore = this.keywordScore(newMessage, pair.incoming);
      const hybridScore = (alpha * semanticScore) + ((1 - alpha) * kwScore);
      
      return { pair, score: hybridScore };
    });

    // 4. Sort descending by score
    scoredPairs.sort((a, b) => b.score - a.score);

    // 5. Return top N
    return scoredPairs.slice(0, topN).map(s => s.pair);
  }
}

const retriever = new SemanticRetriever();

// We export an async function now, so consumers must await it!
async function findSimilarExamples(newMessage, pairs, topN = 6) {
  return retriever.findSimilarExamples(newMessage, pairs, topN);
}

module.exports = { findSimilarExamples, SemanticRetriever };
