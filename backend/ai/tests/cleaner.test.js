"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { cleanMessages } = require("../cleaner/cleanMessages");

function msg(sender, text) {
  return { timestamp: "12/07/2025, 14:30", sender, text };
}

// ─── __SYSTEM__ structural filter ─────────────────────────────────────────────

test("Removes __SYSTEM__ tagged messages (first, before any text filters)", () => {
  const input = [
    msg("__SYSTEM__", "John left"),
    msg("Alice", "hey"),
    msg("__SYSTEM__", "Messages and calls are end-to-end encrypted"),
    msg("__SYSTEM__", "You added Priya"),
  ];
  const result = cleanMessages(input);
  assert.equal(result.length, 1);
  assert.equal(result[0].sender, "Alice");
  assert.equal(result[0].text, "hey");
});

// ─── Text-based noise filters ──────────────────────────────────────────────────

test("Removes <Media omitted>", () => {
  assert.equal(cleanMessages([msg("Alice", "<Media omitted>")]).length, 0);
});

test("Removes 'This message was deleted'", () => {
  assert.equal(cleanMessages([msg("Alice", "This message was deleted")]).length, 0);
});

test("Removes 'You deleted this message'", () => {
  assert.equal(cleanMessages([msg("Bob", "You deleted this message")]).length, 0);
});

test("Removes 'Missed voice call'", () => {
  assert.equal(cleanMessages([msg("Alice", "Missed voice call")]).length, 0);
});

test("Removes 'Missed video call'", () => {
  assert.equal(cleanMessages([msg("Alice", "Missed video call")]).length, 0);
});

test("Removes encryption banner when it has sender attribution", () => {
  assert.equal(
    cleanMessages([msg("Alice", "Messages and calls are end-to-end encrypted")]).length,
    0
  );
});

// ─── Empty message filter ──────────────────────────────────────────────────────

test("Removes empty string messages", () => {
  assert.equal(cleanMessages([msg("Alice", "")]).length, 0);
});

test("Removes whitespace-only messages", () => {
  assert.equal(cleanMessages([msg("Bob", "   ")]).length, 0);
});

// ─── REQUIRED NEGATIVE TESTS — "left" and "added" as ordinary vocabulary ──────

test("Keeps message with 'left' as ordinary vocabulary (must NOT be filtered)", () => {
  const input = [msg("Alice", "I left my phone at home")];
  const result = cleanMessages(input);
  assert.equal(
    result.length,
    1,
    '"I left my phone at home" was filtered — fragile substring match is back'
  );
  assert.equal(result[0].text, "I left my phone at home");
});

test("Keeps message with 'added' as ordinary vocabulary (must NOT be filtered)", () => {
  const input = [msg("Alice", "she added me to the trip")];
  const result = cleanMessages(input);
  assert.equal(
    result.length,
    1,
    '"she added me to the trip" was filtered — fragile substring match is back'
  );
  assert.equal(result[0].text, "she added me to the trip");
});

test("Keeps message with 'removed' as ordinary vocabulary", () => {
  const input = [msg("Bob", "they removed the feature yesterday")];
  const result = cleanMessages(input);
  assert.equal(result.length, 1);
});

// ─── Never deduplicate ─────────────────────────────────────────────────────────

test("Never deduplicates identical repeated messages", () => {
  const input = [msg("Alice", "haha"), msg("Alice", "haha"), msg("Alice", "haha")];
  const result = cleanMessages(input);
  assert.equal(result.length, 3);
});

// ─── Invalid input ─────────────────────────────────────────────────────────────

test("Returns empty array for non-array input", () => {
  assert.deepEqual(cleanMessages(null), []);
  assert.deepEqual(cleanMessages("string"), []);
  assert.deepEqual(cleanMessages(undefined), []);
});
