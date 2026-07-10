"use strict";

const promptModule = require("../prompts/buildPrompt");
const ollamaModule = require("../response/callOllama");

/**
 * Orchestrates the generation of a reply.
 * Selects the top 5 few-shot examples based on keyword overlap,
 * builds the prompt, and calls the local Ollama model.
 * 
 * @param {Object} params
 * @param {string} params.incomingMessage - The new message to reply to.
 * @param {Object} params.styleProfile - The parsed style profile.
 * @param {Array<{ incoming: string, reply: string }>} params.samplePairs - All available message pairs.
 * @param {string} params.myName - Target sender name (not strictly needed here but matching the prompt's signature).
 * @returns {Promise<string>}
 */
async function generateReply({ incomingMessage, styleProfile, samplePairs, myName }) {
  // 1. Select top 5 examples by keyword overlap
  const tokens = new Set(
    incomingMessage
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 0)
  );

  const scored = (samplePairs || []).map((pair) => {
    let score = 0;
    const incomingTokens = pair.incoming.toLowerCase().split(/\W+/);
    for (const token of incomingTokens) {
      if (token && tokens.has(token)) {
        score++;
      }
    }
    return { pair, score };
  });

  // Sort by score descending. If scores are equal, chronological order is roughly preserved by stable sort (in Node 12+, V8 sort is stable).
  scored.sort((a, b) => b.score - a.score);
  
  const top5 = scored.slice(0, 5).map(s => s.pair);

  // 2. Build Prompt
  const prompt = promptModule.buildPrompt(incomingMessage, styleProfile, top5);

  // 3. Call Ollama
  return await ollamaModule.callOllama(prompt);
}

module.exports = { generateReply };
