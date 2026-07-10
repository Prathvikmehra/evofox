"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const promptModule = require("../prompts/buildPrompt");
const ollamaModule = require("../response/callOllama");
const { generateReply } = require("../generate/generateReply");

test.describe("generateReply", () => {
  
  test.it("sorts pairs by keyword overlap descending and preserves chronological order on ties", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "zero", reply: "a" },
      { incoming: "apples bananas", reply: "b" }, // chronological #1, 2 hits
      { incoming: "bananas cherries", reply: "c" }, // chronological #2, 2 hits
      { incoming: "apples bananas cherries", reply: "d" }, // 3 hits (best)
      { incoming: "apples", reply: "e" } // 1 hit
    ];

    await generateReply({
      incomingMessage: "apples and bananas and cherries",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const top5 = buildPromptMock.mock.calls[0].arguments[2];
    
    // Exact expected order: 
    // 1. "apples bananas cherries" (3 hits)
    // 2. "apples bananas" (2 hits, chronological first)
    // 3. "bananas cherries" (2 hits, chronological second)
    // 4. "apples" (1 hit)
    // 5. "zero" (0 hit, because there are only 5 total, it fills the remaining slot)
    assert.equal(top5.length, 5);
    assert.equal(top5[0].incoming, "apples bananas cherries");
    assert.equal(top5[1].incoming, "apples bananas");
    assert.equal(top5[2].incoming, "bananas cherries");
    assert.equal(top5[3].incoming, "apples");
    assert.equal(top5[4].incoming, "zero");
  });

  test.it("caps length at exactly 5 pairs", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "apple 1", reply: "a" },
      { incoming: "apple 2", reply: "b" },
      { incoming: "apple 3", reply: "c" },
      { incoming: "apple 4", reply: "d" },
      { incoming: "apple 5", reply: "e" },
      { incoming: "apple 6", reply: "f" }
    ];

    await generateReply({
      incomingMessage: "apple",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const top5 = buildPromptMock.mock.calls[0].arguments[2];
    assert.equal(top5.length, 5);
  });

  test.it("excludes zero-hit pairs if better matches exist", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "apple 1", reply: "a" },
      { incoming: "zero 1", reply: "z1" },
      { incoming: "apple 2", reply: "b" },
      { incoming: "zero 2", reply: "z2" },
      { incoming: "apple 3", reply: "c" },
      { incoming: "apple 4", reply: "d" },
      { incoming: "apple 5", reply: "e" },
    ];

    await generateReply({
      incomingMessage: "apple",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const top5 = buildPromptMock.mock.calls[0].arguments[2];
    assert.equal(top5.length, 5);
    
    const hasZeroHit = top5.some(p => p.incoming.startsWith("zero"));
    assert.equal(hasZeroHit, false, "0-hit pairs should not be in the top 5 when enough better matches exist");
  });

  test.it("fallback: if all have zero overlap, passes the first 5 in chronological order", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "one", reply: "a" },
      { incoming: "two", reply: "b" },
      { incoming: "three", reply: "c" },
      { incoming: "four", reply: "d" },
      { incoming: "five", reply: "e" },
      { incoming: "six", reply: "f" },
      { incoming: "seven", reply: "g" },
    ];

    await generateReply({
      incomingMessage: "completely unrelated message",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const top5 = buildPromptMock.mock.calls[0].arguments[2];
    assert.equal(top5.length, 5);
    
    // Stable sort should leave 0-scored elements in their original order.
    assert.equal(top5[0].incoming, "one");
    assert.equal(top5[1].incoming, "two");
    assert.equal(top5[2].incoming, "three");
    assert.equal(top5[3].incoming, "four");
    assert.equal(top5[4].incoming, "five");
  });

  test.it("handles fewer than 5 sample pairs", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
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

    const top5 = buildPromptMock.mock.calls[0].arguments[2];
    assert.equal(top5.length, 1);
    assert.equal(top5[0].incoming, "hello");
  });

  test.it("handles empty or null samplePairs", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    await generateReply({
      incomingMessage: "hello there",
      styleProfile: {},
      samplePairs: null,
      myName: "Me"
    });

    const top5 = buildPromptMock.mock.calls[0].arguments[2];
    assert.equal(top5.length, 0);
  });
});
