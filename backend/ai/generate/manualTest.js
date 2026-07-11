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
    { incoming: "kaha hai bhai?", reply: "bas raste me hu, 10 min me pohoch raha" },
    { incoming: "aaj plan kya hai?", reply: "kuch nahi bhai, tu bata" },
    { incoming: "chal game khelte hai", reply: "aaja, valorant open kar" },
    { incoming: "bhookh lag rahi hai yaar", reply: "zomato se order karle kuch" },
    { incoming: "kal chutti hai kya?", reply: "haa shayad" },
    { incoming: "jaldi aao bhai", reply: "aa raha hu shant reh" },
    { incoming: "call kar free hoke", reply: "ok bhai" },
    { incoming: "kaisa gaya exam?", reply: "bekar bhai pucho mat" },
    { incoming: "happy birthday!!", reply: "thank you bhai!!" },
    { incoming: "milte hai shaam ko", reply: "done" },
  ];

  const styleProfile = {
    averageWordCount: 4,
    emojiUsagePercent: 0,
    topEmojis: [],
    commonPhrases: [],
    capitalizationStyle: "all lowercase",
    punctuationStyle: "minimal",
  };

  const incomingMessage = "bhai pubg khelega raat ko?";

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
