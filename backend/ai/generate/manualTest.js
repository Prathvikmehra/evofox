"use strict";

const { generateReply } = require("./generateReply");

/**
 * Manual test script to verify end-to-end reply generation.
 * Requires a local Ollama instance running llama3.2:3b.
 * 
 * Usage: node backend/ai/generate/manualTest.js
 */
async function run() {
  const samplePairs = [
    { incoming: "hey are we still on for tonight?", reply: "yes! around 8?" },
    { incoming: "can you bring some chips?", reply: "sure thing. what kind?" },
    { incoming: "did you see the game?", reply: "no i missed it, was it good?" },
    { incoming: "i am so tired today", reply: "same here, long week." },
    { incoming: "what time is the meeting?", reply: "i think 2pm" },
    { incoming: "lunch tomorrow?", reply: "sounds good to me" },
    { incoming: "do you have the presentation?", reply: "sending it now" },
    { incoming: "can we reschedule?", reply: "no worries, when works for you?" },
    { incoming: "happy birthday!!", reply: "thank you!!" },
    { incoming: "see you soon", reply: "see ya" },
  ];

  const styleProfile = {
    averageWordCount: 4,
    emojiUsagePercent: 0,
    topEmojis: [],
    commonPhrases: [],
    capitalizationStyle: "all lowercase",
    punctuationStyle: "minimal",
  };

  const incomingMessage = "hey do you want to grab lunch and talk about the presentation?";

  console.log("--- Generating Reply ---");
  console.log("Incoming Message:", incomingMessage);
  console.log("Style Profile:", styleProfile);
  console.log("\nCalling Ollama (ensure it is running)...");

  try {
    const reply = await generateReply({
      incomingMessage,
      styleProfile,
      samplePairs,
      myName: "Me"
    });
    console.log("\n=== GENERATED REPLY ===");
    console.log(reply);
    console.log("=======================\n");
  } catch (err) {
    console.error("\n[ERROR] Generation failed:", err.message);
    console.error("If 'Local model unavailable', please ensure Ollama is installed, running, and the model is pulled.");
  }
}

run();
