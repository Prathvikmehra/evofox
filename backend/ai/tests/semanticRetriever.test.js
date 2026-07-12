"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { 
  selectExamples, 
  keywordScore, 
  canRunSemantic, 
  tokenise,
  mmrSelect
} = require("../retriever/semanticRetriever");

test.describe("semanticRetriever", () => {
  test.describe("tokenise", () => {
    test.it("extracts unique lowercase words ignoring punctuation", () => {
      const tokens = tokenise("Hello, World! Hello there.");
      assert.deepEqual(Array.from(tokens).sort(), ["hello", "there", "world"]);
    });

    test.it("handles empty or invalid inputs", () => {
      assert.equal(tokenise("").size, 0);
      assert.equal(tokenise(null).size, 0);
    });
  });

  test.describe("keywordScore", () => {
    test.it("calculates exact intersection fraction", () => {
      const query = tokenise("I love pizza");
      // "i", "love" and "pizza" are ALL in doc -> 3/3 = 1.0
      const doc = "everyone loves to eat pizza and i love it";
      assert.ok(Math.abs(keywordScore(query, doc) - 1.0) < 1e-5);
    });
    
    test.it("returns 0 for empty query", () => {
      assert.equal(keywordScore(new Set(), "something"), 0);
    });
  });

  test.describe("canRunSemantic", () => {
    test.it("returns true only if query has embed and at least one pair has embed", () => {
      assert.equal(canRunSemantic([1], [{ embedding: [1] }]), true);
      assert.equal(canRunSemantic([1], [{ incoming: "no embed" }]), false);
      assert.equal(canRunSemantic(null, [{ embedding: [1] }]), false);
    });
  });

  test.describe("mmrSelect", () => {
    test.it("selects diverse items based on lambda", () => {
      const scored = [
        { pair: { id: 1 }, relevance: 0.9, embedding: [1, 0] },
        { pair: { id: 2 }, relevance: 0.8, embedding: [0.99, 0.1] }, // Highly similar to #1
        { pair: { id: 3 }, relevance: 0.7, embedding: [0, 1] }       // Completely diverse
      ];
      
      // With lambda=0.5, diversity is valued heavily. Item #3 should beat #2
      // because #2 is too similar to #1 (which gets selected first)
      const selected = mmrSelect(scored, 2, 0.5);
      
      assert.equal(selected.length, 2);
      assert.equal(selected[0].id, 1);
      assert.equal(selected[1].id, 3);
    });
  });

  test.describe("selectExamples", () => {
    test.it("falls back to keyword matching if embeddings are missing", () => {
      const pairs = [
        { incoming: "cat dog", reply: "animals" },
        { incoming: "car truck", reply: "vehicles" }
      ];
      
      // No query embedding, should fallback to keyword overlap
      const res = selectExamples("where is the cat", pairs, null, { topN: 1 });
      assert.equal(res.length, 1);
      assert.equal(res[0].reply, "animals");
    });
  });
});
