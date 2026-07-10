"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildReplyPairs } = require("../parser/buildReplyPairs");

// Helper to quickly build messages
function msg(sender, text) {
  return { timestamp: "12:00 PM", sender, text };
}

test("Simple alternating conversation -> correct pairs", () => {
  const messages = [
    msg("Alice", "hey"),
    msg("Bob", "hello"),
    msg("Alice", "how are you"),
    msg("Bob", "good and you?"),
  ];
  const pairs = buildReplyPairs(messages, "Bob");
  assert.deepEqual(pairs, [
    { incoming: "hey", reply: "hello" },
    { incoming: "how are you", reply: "good and you?" },
  ]);
});

test("Consecutive same-sender messages merged with \\n before pairing", () => {
  const messages = [
    msg("Alice", "hey"),
    msg("Alice", "are you there?"),
    msg("Bob", "yes"),
    msg("Bob", "what's up?"),
  ];
  const pairs = buildReplyPairs(messages, "Bob");
  assert.deepEqual(pairs, [
    { incoming: "hey\nare you there?", reply: "yes\nwhat's up?" },
  ]);
});

test("Trailing unanswered incoming -> no dangling pair", () => {
  const messages = [
    msg("Alice", "hey"),
    msg("Bob", "hello"),
    msg("Alice", "left you on read"),
  ];
  const pairs = buildReplyPairs(messages, "Bob");
  assert.deepEqual(pairs, [
    { incoming: "hey", reply: "hello" },
  ]);
});

test("Leading reply with no prior incoming -> no pair emitted", () => {
  const messages = [
    msg("Bob", "starting the chat"),
    msg("Alice", "oh hey"),
    msg("Bob", "hi again"),
  ];
  const pairs = buildReplyPairs(messages, "Bob");
  assert.deepEqual(pairs, [
    { incoming: "oh hey", reply: "hi again" },
  ]);
});

test("Group chat (multiple other senders) -> pairs correctly", () => {
  const messages = [
    msg("Alice", "who's bringing food?"),
    msg("Charlie", "i can bring chips"),
    msg("Bob", "i will bring drinks"), // Bob is target. Incoming is Charlie's message? Wait, previous turn was Charlie.
  ];
  const pairs = buildReplyPairs(messages, "Bob");
  assert.deepEqual(pairs, [
    { incoming: "i can bring chips", reply: "i will bring drinks" },
  ]);
});

test("Empty input -> empty array", () => {
  assert.deepEqual(buildReplyPairs([], "Bob"), []);
  assert.deepEqual(buildReplyPairs(null, "Bob"), []);
});
