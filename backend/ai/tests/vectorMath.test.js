"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { dot, norm, cosineSimilarity } = require("../retriever/vectorMath");

test.describe("vectorMath", () => {
  test.it("dot: computes the dot product of equal-length vectors", () => {
    assert.equal(dot([1, 2, 3], [4, 5, 6]), 32);
  });

  test.it("dot: returns 0 on length mismatch or bad input", () => {
    assert.equal(dot([1, 2], [1, 2, 3]), 0);
    assert.equal(dot(null, [1]), 0);
    assert.equal(dot([1], "nope"), 0);
  });

  test.it("norm: computes the Euclidean length", () => {
    assert.equal(norm([3, 4]), 5);
    assert.equal(norm([0, 0, 0]), 0);
  });

  test.it("cosineSimilarity: identical direction → 1", () => {
    assert.ok(Math.abs(cosineSimilarity([1, 2, 3], [2, 4, 6]) - 1) < 1e-9);
  });

  test.it("cosineSimilarity: orthogonal → 0", () => {
    assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1])) < 1e-9);
  });

  test.it("cosineSimilarity: opposite direction → -1", () => {
    assert.ok(Math.abs(cosineSimilarity([1, 1], [-1, -1]) + 1) < 1e-9);
  });

  test.it("cosineSimilarity: never returns NaN for zero/empty/mismatched vectors", () => {
    assert.equal(cosineSimilarity([0, 0], [1, 1]), 0);
    assert.equal(cosineSimilarity([], []), 0);
    assert.equal(cosineSimilarity([1, 2, 3], [1, 2]), 0);
    assert.equal(cosineSimilarity(null, undefined), 0);
  });
});
