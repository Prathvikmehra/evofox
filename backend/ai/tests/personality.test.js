"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { buildStyleProfile } = require("../personality/buildStyleProfile");

function pair(incoming, reply) {
  return { incoming, reply };
}

// ─── emojiUsagePercent: presence-ratio not count-ratio ────────────────────────

test("emojiUsagePercent: 1 of 2 replies has emoji → 50.0, not 150.0 (catches count-ratio regression)", () => {
  const pairs = [
    pair("hello", "hey there 😊😊😊"), // 3 emojis — count-ratio would give 150%
    pair("what up", "not much"),         // 0 emojis
  ];
  const profile = buildStyleProfile(pairs);
  assert.equal(
    profile.emojiUsagePercent,
    50.0,
    `Expected 50.0 (presence-ratio), got ${profile.emojiUsagePercent} — count-ratio regression`
  );
});

// ─── greetingPatterns: first-word-only, fixed list, no "haha" ─────────────────

test("greetingPatterns: 'hey' as first word is detected", () => {
  const pairs = [pair("sup", "hey are we still on")];
  const profile = buildStyleProfile(pairs);
  assert.ok(
    profile.greetingPatterns.includes("hey"),
    `"hey" as first word not detected; got: ${JSON.stringify(profile.greetingPatterns)}`
  );
});

test("greetingPatterns: mid-sentence 'hi' must NOT match (first-word-only rule)", () => {
  const pairs = [pair("who is she?", "I said hi to him yesterday")];
  const profile = buildStyleProfile(pairs);
  assert.ok(
    !profile.greetingPatterns.includes("hi"),
    'mid-sentence "hi" was detected as a greeting — first-word-only logic is broken'
  );
});

test("greetingPatterns: 'haha' must NOT appear (not in the greeting list)", () => {
  const pairs = [pair("that was funny", "haha yeah totally")];
  const profile = buildStyleProfile(pairs);
  assert.ok(
    !profile.greetingPatterns.includes("haha"),
    '"haha" must not be treated as a greeting — it belongs to bigram/trigram extraction'
  );
});

test("greetingPatterns: returns at most 5 entries", () => {
  const pairs = [
    pair("a", "hey how are you"),
    pair("b", "hey what time"),
    pair("c", "hi there"),
    pair("d", "yo whats up"),
    pair("e", "sup dude"),
    pair("f", "morning!"),
    pair("g", "heyy you free"),
  ];
  const profile = buildStyleProfile(pairs);
  assert.ok(
    profile.greetingPatterns.length <= 5,
    `greetingPatterns returned ${profile.greetingPatterns.length} entries, max is 5`
  );
});

test("greetingPatterns: ranked by frequency (most-used first)", () => {
  const pairs = [
    pair("x", "hey there"),
    pair("x", "hey what"),
    pair("x", "hey again"),
    pair("x", "hi there"),
  ];
  const profile = buildStyleProfile(pairs);
  assert.equal(
    profile.greetingPatterns[0],
    "hey",
    `"hey" used 3x should rank first; got: ${profile.greetingPatterns[0]}`
  );
});

// ─── All expected keys present ─────────────────────────────────────────────────

test("Returns all expected keys including greetingPatterns", () => {
  const profile = buildStyleProfile([pair("hello", "hey!")]);
  const REQUIRED = [
    "averageWordCount",
    "emojiUsagePercent",
    "topEmojis",
    "greetingPatterns",
    "commonPhrases",
    "capitalizationStyle",
    "punctuationStyle",
  ];
  for (const key of REQUIRED) {
    assert.ok(key in profile, `Missing key: ${key}`);
  }
});

// ─── Empty input ───────────────────────────────────────────────────────────────

test("Empty pairs → zeroed profile with greetingPatterns as empty array", () => {
  const profile = buildStyleProfile([]);
  assert.equal(profile.emojiUsagePercent, 0);
  assert.deepEqual(profile.greetingPatterns, []);
});
