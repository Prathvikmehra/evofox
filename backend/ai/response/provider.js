"use strict";

const config = require("../../backend/src/config");

const TIMEOUT_MS = 60_000; // 60 seconds (prevents local timeouts on slower machines)

/**
 * Local Ollama generation.
 *
 * EchoMind is deliberately 100% local — no cloud LLM, no API keys (see README).
 * A previous iteration added a Groq cloud fallback; it was removed to keep that
 * promise true. The only network hop is to the local Ollama instance.
 */
async function generateOllama(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${config.OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        model: config.OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: config.GEN_TEMPERATURE,
          num_predict: config.GEN_NUM_PREDICT,
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data || typeof data.response !== "string") {
      throw new Error("Local model returned an unexpected response shape");
    }
    return data.response.trim();
  } catch (fetchErr) {
    const errMessage =
      fetchErr.name === "AbortError"
        ? "Local model timed out (took longer than 60s). Is your machine overloaded?"
        : "Local model unavailable — is Ollama running?";
    const err = new Error(errMessage);
    err.status = 503;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Rule-based safe fallback — instant, 100% reliable, used only when the local
 * model is completely unavailable so a demo never hard-crashes.
 */
function getFallbackReply() {
  const fallbacks = [
    "I'll get back to you soon!",
    "Hey, busy right now — will reply later!",
    "Can we talk about this later?",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Local-first LLM provider.
 * Priority: local Ollama → safe rule-based text. No cloud, no API keys.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callLLM(prompt) {
  try {
    const reply = await generateOllama(prompt);
    // Strip any wrapping quotes the model may add.
    return reply.replace(/^["']|["']$/g, "").trim();
  } catch (err) {
    console.warn(`[LLM Provider] Ollama failed: ${err.message}. Using safe fallback text.`);
    return getFallbackReply();
  }
}

// `callOllama` is kept as an alias so existing callers/tests keep working.
module.exports = { callLLM, callOllama: callLLM };
