/**
 * embedText — turn text into a semantic vector using a locally-running Ollama
 * embedding model (default: nomic-embed-text). This is what upgrades EchoMind
 * from brittle keyword matching to real semantic retrieval — WITHOUT adding a
 * vector database, an npm dependency, or any cloud call. The only network hop
 * is to the same local Ollama that already generates replies.
 *
 * Design contract: embeddings are a BEST-EFFORT enhancement, never a hard
 * dependency. Every function here fails soft — on any error (model not pulled,
 * Ollama down, timeout) it returns null / nulls, and the retriever silently
 * degrades to lexical keyword overlap. The app must never break just because
 * the embed model isn't installed.
 *
 * Ollama endpoint: POST /api/embeddings  { model, prompt } -> { embedding }
 */

const config = require("../../backend/src/config");
const fs = require("fs/promises");
const path = require("path");

const EMBED_TIMEOUT_MS = 20_000;

// Process-lifetime cache: text -> vector. 
// We now persist this to disk so server restarts don't lose embeddings!
const _cache = new Map();
const _CACHE_MAX = 5000;
const CACHE_FILE = path.join(__dirname, "cache.json");

let cacheLoaded = false;

async function loadCache() {
  if (cacheLoaded) return;
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(data);
    for (const [k, v] of Object.entries(parsed)) {
      _cache.set(k, v);
    }
  } catch (err) {
    // Ignore if file doesn't exist or is invalid
  }
  cacheLoaded = true;
}

// Fire-and-forget save
function saveCache() {
  const obj = Object.fromEntries(_cache);
  fs.writeFile(CACHE_FILE, JSON.stringify(obj)).catch(() => {});
}

/**
 * Embed a single string. Returns a number[] on success, or null on any failure.
 * Results are memoised by exact text.
 * @param {string} text
 * @returns {Promise<number[]|null>}
 */
async function embedText(text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) return null;

  await loadCache();
  if (_cache.has(text)) return _cache.get(text);

  // Guard against pathologically long inputs blowing up the embedder's context.
  const safeText = text.length > 2000 ? text.slice(0, 2000) : text;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.OLLAMA_URL}/api/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        model: config.OLLAMA_EMBED_MODEL,
        prompt: safeText,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    const vec = data && data.embedding;
    // Validate shape: a non-empty array of finite numbers.
    if (!Array.isArray(vec) || vec.length === 0 || !vec.every(Number.isFinite)) {
      return null;
    }
    // Memoise (simple FIFO eviction when the cache is full).
    if (_cache.size >= _CACHE_MAX) _cache.delete(_cache.keys().next().value);
    _cache.set(text, vec);
    saveCache(); // Persist to disk
    return vec;
  } catch {
    // ECONNREFUSED, AbortError (timeout), JSON parse error — all degrade to null.
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Embed many strings, preserving order. Runs in small concurrent batches so a
 * few hundred chat pairs embed quickly without opening hundreds of sockets at
 * once. Any individual failure lands as null in that slot (retriever skips it).
 *
 * @param {string[]} texts
 * @param {number} [batchSize=8]
 * @returns {Promise<Array<number[]|null>>}
 */
async function embedBatch(texts, batchSize = 8) {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const out = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const chunk = texts.slice(i, i + batchSize);
    const embedded = await Promise.all(chunk.map((t) => embedText(t)));
    out.push(...embedded);
  }
  return out;
}

/**
 * Quick liveness probe: is the configured embedding model reachable?
 * Used by the eval harness and (optionally) a health check to decide whether
 * semantic mode is available before doing bulk work.
 * @returns {Promise<boolean>}
 */
async function embeddingsAvailable() {
  const v = await embedText("ping");
  return Array.isArray(v) && v.length > 0;
}

module.exports = { embedText, embedBatch, embeddingsAvailable };
