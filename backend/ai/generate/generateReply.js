"use strict";

const retrieverModule = require("../retriever/mmrRetriever");
const promptModule    = require("../prompts/buildPrompt");
const ollamaModule    = require("../response/provider");

/**
 * Orchestrates the generation of a reply.
 *
 * Delegates example selection to findSimilarExamples (tokenised word-overlap
 * scoring, random gap-fill, capped at topN=6), then builds the prompt and
 * calls the local Ollama model.
 *
 * This is the single source of truth for the generate pipeline.
 * generateController delegates here rather than reimplementing the steps.
 *
 * Module-object references (retrieverModule.findSimilarExamples etc.) are used
 * deliberately so that Node's test-runner mock.method() can intercept them
 * in the generate.test.js suite without needing to re-require the module.
 *
 * @param {Object} params
 * @param {string} params.incomingMessage - The new message to reply to.
 * @param {Object} params.styleProfile    - The parsed style profile.
 * @param {Array<{ incoming: string, reply: string }>} params.samplePairs
 *   All available (incoming → reply) pairs for this sender.
 * @param {string} [params.myName]        - Reserved for future prompt use.
 * @returns {Promise<string>}
 */
async function generateReply({ incomingMessage, styleProfile, samplePairs, myName }) {
  // 1. Select the best few-shot examples via shared retriever module
  const examples = await retrieverModule.findSimilarExamples(incomingMessage, samplePairs || []);

  // 2. Build the prompt
  const prompt = promptModule.buildPrompt(incomingMessage, styleProfile, examples);

  // 3. Call Ollama and return the trimmed reply string
  return ollamaModule.callOllama(prompt);
}

module.exports = { generateReply };
