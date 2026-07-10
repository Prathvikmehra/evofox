"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { parseWhatsAppText } = require("../parser/parseWhatsAppText");

// ─── Happy paths ───────────────────────────────────────────────────────────────

test("Android 24h: parses sender, text, timestamp as raw string", () => {
  const raw = "12/07/2025, 14:30 - Alice: Hey there!";
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].sender, "Alice");
  assert.equal(msgs[0].text, "Hey there!");
  assert.equal(typeof msgs[0].timestamp, "string");
});

test("Android 12h: parses sender and text with AM/PM clock", () => {
  const raw = "12/07/2025, 2:30 PM - Bob: Hi there!";
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].sender, "Bob");
  assert.equal(msgs[0].text, "Hi there!");
  assert.equal(typeof msgs[0].timestamp, "string");
});

test("Multiple messages: order preserved", () => {
  const raw = [
    "12/07/2025, 09:00 - Alice: first",
    "12/07/2025, 09:01 - Bob: second",
    "12/07/2025, 09:02 - Alice: third",
  ].join("\n");
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 3);
  assert.equal(msgs[0].text, "first");
  assert.equal(msgs[1].text, "second");
  assert.equal(msgs[2].text, "third");
});

// ─── Multiline ─────────────────────────────────────────────────────────────────

test("Multiline message: continuation appended with \\n not space", () => {
  const raw = "12/07/2025, 14:30 - Alice: omw\n5 min\ntraffic is bad";
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].text, "omw\n5 min\ntraffic is bad");
});

// ─── __SYSTEM__ tagging ────────────────────────────────────────────────────────

test("No-colon system line: 'John left' tagged __SYSTEM__, NOT merged into previous message", () => {
  const raw = [
    "12/07/2025, 9:14 PM - Alice: hey",
    "12/07/2025, 9:15 PM - John left",
  ].join("\n");
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].sender, "Alice");
  assert.equal(msgs[0].text, "hey", "Alice message must not have system line appended");
  assert.equal(msgs[1].sender, "__SYSTEM__");
  assert.ok(msgs[1].text.includes("John left"));
});

test("No-colon system line: 'You added Priya' tagged __SYSTEM__", () => {
  const raw = "12/07/2025, 9:14 PM - You added Priya";
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].sender, "__SYSTEM__");
});

test("No-colon system line: encryption banner tagged __SYSTEM__", () => {
  const raw =
    "12/07/2025, 9:14 PM - Messages and calls are end-to-end encrypted. Tap for more info.";
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].sender, "__SYSTEM__");
});

test("No-colon system line: subject change tagged __SYSTEM__", () => {
  const raw = '12/07/2025, 9:14 PM - John changed the subject to "Trip planning"';
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].sender, "__SYSTEM__");
});

test("No-colon system line: group icon change tagged __SYSTEM__", () => {
  const raw = "12/07/2025, 9:14 PM - John changed this group's icon";
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 1);
  assert.equal(msgs[0].sender, "__SYSTEM__");
});

test("System line between two real messages: neither real message is corrupted", () => {
  const raw = [
    "12/07/2025, 9:00 AM - Alice: before",
    "12/07/2025, 9:01 AM - Bob left",
    "12/07/2025, 9:02 AM - Bob: after",
  ].join("\n");
  const msgs = parseWhatsAppText(raw);
  assert.equal(msgs.length, 3);
  assert.equal(msgs[0].text, "before");
  assert.equal(msgs[1].sender, "__SYSTEM__");
  assert.equal(msgs[2].text, "after");
});

// ─── Edge cases ────────────────────────────────────────────────────────────────

test("Empty string returns empty array", () => {
  assert.deepEqual(parseWhatsAppText(""), []);
});

test("null/undefined input returns empty array", () => {
  assert.deepEqual(parseWhatsAppText(null), []);
  assert.deepEqual(parseWhatsAppText(undefined), []);
});
