"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const promptModule = require("../prompts/buildPrompt");
const ollamaModule = require("../response/callOllama");
const { generateReply } = require("../generate/generateReply");

test.describe("generateReply", () => {
  test.it("passes top 5 selected pairs to buildPrompt", async (t) => {
    // Mock the dependencies
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", (incoming, style, top5) => "MOCKED_PROMPT");
    const callOllamaMock = t.mock.method(ollamaModule, "callOllama", async (prompt) => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "zero overlap here", reply: "a" },
      { incoming: "apples bananas", reply: "b" },
      { incoming: "bananas cherries", reply: "c" }, // 2 hits
      { incoming: "apples", reply: "d" }, // 1 hit
      { incoming: "cherries", reply: "e" }, // 1 hit
      { incoming: "dates", reply: "f" },
      { incoming: "apples bananas cherries", reply: "g" }, // 3 hits
    ];

    const incomingMessage = "I like apples and bananas and cherries";
    const styleProfile = { averageWordCount: 10 };

    const result = await generateReply({
      incomingMessage,
      styleProfile,
      samplePairs,
      myName: "Me"
    });

    assert.equal(result, "MOCKED_REPLY");
    assert.equal(buildPromptMock.mock.calls.length, 1);
    assert.equal(callOllamaMock.mock.calls.length, 1);

    const callArgs = buildPromptMock.mock.calls[0].arguments;
    assert.equal(callArgs[0], incomingMessage);
    assert.deepEqual(callArgs[1], styleProfile);
    
    // Top 5 should be sorted by overlap descending:
    // 1. "apples bananas cherries" (3 hits)
    // 2. "bananas cherries" (2 hits)
    // 3. "apples bananas" (2 hits)
    // 4. "apples" (1 hit)
    // 5. "cherries" (1 hit)
    // The exact tie-breaking order for the 2-hit and 1-hit depends on stable sort,
    // but the set of 5 should not include "zero overlap here" or "dates" (0 hits).
    const top5 = callArgs[2];
    assert.equal(top5.length, 5);
    
    // Verify the best match is first
    assert.equal(top5[0].incoming, "apples bananas cherries");

    // Verify 0-hit pairs are NOT in the top 5 (since we had 5 pairs with >0 hits)
    const hasZeroHit = top5.some(p => p.incoming === "zero overlap here" || p.incoming === "dates");
    assert.equal(hasZeroHit, false, "0-hit pairs should not be in the top 5 when better matches exist");
  });

  test.it("handles fewer than 5 sample pairs", async (t) => {
    t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "hello", reply: "hey" },
    ];

    await generateReply({
      incomingMessage: "hello there",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const callArgs = promptModule.buildPrompt.mock.calls[0].arguments;
    assert.equal(callArgs[2].length, 1);
    assert.equal(callArgs[2][0].incoming, "hello");
  });

  test.it("handles empty or null samplePairs", async (t) => {
    t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    await generateReply({
      incomingMessage: "hello there",
      styleProfile: {},
      samplePairs: null,
      myName: "Me"
    });

    const callArgs = promptModule.buildPrompt.mock.calls[0].arguments;
    assert.equal(callArgs[2].length, 0);
  });
});
