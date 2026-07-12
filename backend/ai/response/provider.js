"use strict";

const config = require("../../backend/src/config");

const TIMEOUT_MS = 60_000; // 60 seconds (increased to prevent local timeouts)

/**
 * 1. Groq Cloud Fallback
 * Requires GROQ_API_KEY in .env
 */
async function generateGroq(prompt) {
  if (!process.env.GROQ_API_KEY) throw new Error("No Groq API Key");
  
  // We use the same prompt we built for Ollama, but passed as 'user' for Groq
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 150
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API Error: ${text}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * 2. Local Ollama (The existing system)
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
        prompt: prompt,
        stream: false,
        options: { temperature: 0.7 },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Ollama HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (fetchErr) {
    const errMessage = fetchErr.name === "AbortError" 
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
 * 3. Rule-based Safe Fallback
 * Extremely fast, 100% reliable fallback when everything else is down.
 */
function getFallbackReply() {
  const fallbacks = [
    "I'll get back to you soon!",
    "Hey, busy right now — will reply later!",
    "Can we talk about this later?"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Hybrid LLM Provider
 * Priority: Groq (if key exists) -> Local Ollama -> Safe Fallback Text
 */
async function callLLM(prompt) {
  try {
    // 1. Try Groq Cloud if available
    if (process.env.GROQ_API_KEY) {
      try {
        let reply = await generateGroq(prompt);
        return reply.replace(/^["']|["']$/g, "").trim();
      } catch (err) {
        console.warn(`[LLM Provider] Groq failed: ${err.message}. Falling back to Ollama...`);
      }
    }

    // 2. Try Local Ollama
    try {
      let reply = await generateOllama(prompt);
      return reply.replace(/^["']|["']$/g, "").trim();
    } catch (err) {
      console.warn(`[LLM Provider] Ollama failed: ${err.message}. Falling back to Safe Text...`);
    }

    // 3. Complete failure - Safe Fallback
    return getFallbackReply();

  } catch (err) {
    // Should never reach here due to fallback, but just in case
    return getFallbackReply();
  }
}

// Keep the same export name as `callOllama` so existing code doesn't break,
// but we route to the new Hybrid Provider
module.exports = { callOllama: callLLM };
