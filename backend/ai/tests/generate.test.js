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

  // findSimilarExamples defaults to topN=6, so 6 matching pairs → 6 examples.
  test.it("caps length at topN=6 pairs", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "apple 1", reply: "a" },
      { incoming: "apple 2", reply: "b" },
      { incoming: "apple 3", reply: "c" },
      { incoming: "apple 4", reply: "d" },
      { incoming: "apple 5", reply: "e" },
      { incoming: "apple 6", reply: "f" },
      { incoming: "apple 7", reply: "g" } // 7 matching; only topN=6 should be selected
    ];

    await generateReply({
      incomingMessage: "apple",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const examples = buildPromptMock.mock.calls[0].arguments[2];
    assert.equal(examples.length, 6);
  });

  // findSimilarExamples fills up to topN=6. To ensure zero-hit pairs are truly
  // excluded (not used as fill-ins), we need at least 6 pairs with real overlap.
  test.it("excludes zero-hit pairs if enough better matches exist to fill topN=6", async (t) => {
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
      { incoming: "apple 6", reply: "f" }, // 6 apple pairs → fills topN without needing zeros
      { incoming: "apple 7", reply: "g" },
    ];

    await generateReply({
      incomingMessage: "apple",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const examples = buildPromptMock.mock.calls[0].arguments[2];
    assert.equal(examples.length, 6);

    const hasZeroHit = examples.some(p => p.incoming.startsWith("zero"));
    assert.equal(hasZeroHit, false, "0-hit pairs should not appear when >= topN relevant pairs exist");
  });

  // findSimilarExamples fills gaps with a Fisher-Yates-shuffled slice, so when
  // ALL pairs score zero the returned order is non-deterministic. We only assert
  // that the correct count is returned and every entry comes from the input set.
  test.it("fallback: if all have zero overlap, returns up to topN=6 pairs from the input set", async (t) => {
    const buildPromptMock = t.mock.method(promptModule, "buildPrompt", () => "MOCKED_PROMPT");
    t.mock.method(ollamaModule, "callOllama", async () => "MOCKED_REPLY");

    const samplePairs = [
      { incoming: "one",   reply: "a" },
      { incoming: "two",   reply: "b" },
      { incoming: "three", reply: "c" },
      { incoming: "four",  reply: "d" },
      { incoming: "five",  reply: "e" },
      { incoming: "six",   reply: "f" },
      { incoming: "seven", reply: "g" },
    ];

    await generateReply({
      incomingMessage: "completely unrelated message",
      styleProfile: {},
      samplePairs,
      myName: "Me"
    });

    const examples = buildPromptMock.mock.calls[0].arguments[2];
    // 7 pairs, topN=6 → exactly 6 returned
    assert.equal(examples.length, 6);

    // Every returned pair must be a member of the original input
    const inputSet = new Set(samplePairs.map(p => p.incoming));
    for (const ex of examples) {
      assert.ok(inputSet.has(ex.incoming), `Unexpected pair in fallback: "${ex.incoming}"`);
    }
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
