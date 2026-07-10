/**
 * callOllama — send a prompt to a locally running Ollama instance and
 * return the generated text.
 *
 * This is the ONLY network call in the entire backend. Everything else is
 * pure in-memory computation.
 *
 * Key design decisions:
 *  - stream: false — waits for the full response in one HTTP response body
 *  - num_predict: 60 — texting replies are short; caps latency for live demo
 *  - 20-second AbortController timeout — a hung Ollama must not freeze the demo
 *  - Clear, user-facing error on any failure (connection refused, timeout, etc.)
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */

const config = require("../src/config");

const TIMEOUT_MS = 20_000; // 20 seconds

async function callOllama(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${config.OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 60,
        },
      }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    // Connection refused, network error, or AbortError (timeout)
    const isTimeout =
      fetchErr.name === "AbortError" || fetchErr.code === "ECONNREFUSED";
    const err = new Error(
      "Local model unavailable — is Ollama running?"
    );
    err.status = 503;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const err = new Error(
      `Local model unavailable — is Ollama running? (HTTP ${response.status})`
    );
    err.status = 503;
    throw err;
  }

  let data;
  try {
    data = await response.json();
  } catch {
    const err = new Error("Unexpected response from local model");
    err.status = 502;
    throw err;
  }

  if (!data || typeof data.response !== "string") {
    const err = new Error("Local model returned an unexpected response shape");
    err.status = 502;
    throw err;
  }

  // Trim whitespace and strip any wrapping quotation marks the model may add
  const raw = data.response.trim();
  const stripped = raw.replace(/^["']|["']$/g, "").trim();

  return stripped;
}

module.exports = { callOllama };
