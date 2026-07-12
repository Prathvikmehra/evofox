/**
 * buildStyleProfile — derive quantified writing-style attributes from
 * a set of { incoming, reply } pairs.
 *
 * All analysis is performed on the `reply` field only (the target sender's
 * own words), never on the incoming messages.
 *
 * Returns sensible defaults when pairs is empty so callers don't have to
 * guard against null/undefined fields.
 *
 * @param {Array<{ incoming: string, reply: string }>} pairs
 * @returns {StyleProfile}
 */

// ── Emoji detection ────────────────────────────────────────────────────────
// Unicode ranges that cover the vast majority of emoji characters.
// EMOJI_REGEX_GLOBAL: used with matchAll() to enumerate individual emoji chars.
// EMOJI_TEST_RE: no 'g' flag — safe to use with .test() inside .filter() because
// a global regex's lastIndex carries over between .test() calls on different
// strings, causing missed matches when the previous string's lastIndex is beyond
// the length of the next string.
const EMOJI_REGEX_GLOBAL =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F000}-\u{1FFFF}]/gu;
const EMOJI_TEST_RE =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F000}-\u{1FFFF}]/u;

// ── Stopwords ──────────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "the", "is", "a", "to", "and", "of", "in", "it", "i", "you", "we",
  "he", "she", "they", "me", "my", "your", "his", "her", "its", "our",
  "their", "this", "that", "these", "those", "be", "are", "was", "were",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "can", "shall", "but",
  "or", "so", "if", "on", "at", "by", "for", "with", "about", "from",
  "up", "out", "as", "just", "not", "no", "yes", "ok", "okay", "yeah",
  "oh", "ah", "im", "ive", "its", "dont", "cant", "wont", "isnt",
]);

// ── Greeting word list ────────────────────────────────────────────────────────
// Check ONLY the first word of each reply (case-insensitive).
// "haha" is intentionally excluded — it belongs to bigram/trigram extraction.
const GREETING_WORDS = new Set(["hi", "hey", "hello", "yo", "sup", "morning", "heyy"]);

// ── Default profile returned on empty input ────────────────────────────────
const EMPTY_PROFILE = {
  averageWordCount: 0,
  emojiUsagePercent: 0,
  topEmojis: [],
  greetingPatterns: [],
  commonPhrases: [],
  capitalizationStyle: "mixed",
  punctuationStyle: "standard",
  commonFillers: [],
};

function buildStyleProfile(pairs) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    return { ...EMPTY_PROFILE };
  }

  const replies = pairs.map((p) => p.reply).filter(Boolean);
  if (replies.length === 0) return { ...EMPTY_PROFILE };

  // ── averageWordCount ─────────────────────────────────────────────────────
  const totalWords = replies.reduce(
    (sum, r) => sum + r.trim().split(/\s+/).filter(Boolean).length,
    0
  );
  const averageWordCount = parseFloat((totalWords / replies.length).toFixed(1));

  // ── emojiUsagePercent ───────────────────────────────────────────────────
  // Presence-ratio: (replies containing >=1 emoji) / total replies * 100.
  // Uses EMOJI_TEST_RE (no 'g' flag) — safe to call .test() repeatedly in filter.
  const repliesWithEmoji = replies.filter((r) => EMOJI_TEST_RE.test(r));
  const emojiUsagePercent = parseFloat(
    ((repliesWithEmoji.length / replies.length) * 100).toFixed(1)
  );

  // ── topEmojis ───────────────────────────────────────────────────────────
  const emojiFreq = {};
  for (const reply of replies) {
    const matches = [...reply.matchAll(EMOJI_REGEX_GLOBAL)];
    for (const [emoji] of matches) {
      emojiFreq[emoji] = (emojiFreq[emoji] || 0) + 1;
    }
  }
  const topEmojis = Object.entries(emojiFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji]) => emoji);

  // ── greetingPatterns ────────────────────────────────────────────────────
  // First word of each reply only. Case-insensitive. Punctuation stripped.
  // Returns top 5 by frequency.
  const greetingFreq = {};
  for (const reply of replies) {
    const firstWord = reply
      .trim()
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, "");
    if (firstWord && GREETING_WORDS.has(firstWord)) {
      greetingFreq[firstWord] = (greetingFreq[firstWord] || 0) + 1;
    }
  }
  const greetingPatterns = Object.entries(greetingFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  // ── commonPhrases (significant words) ───────────────────────────────────
  const wordFreq = {};
  for (const reply of replies) {
    // Normalise: lowercase, strip punctuation, split
    const words = reply
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOPWORDS.has(w));

    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  }
  const commonPhrases = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  // ── capitalizationStyle ──────────────────────────────────────────────────
  // Look at the first non-whitespace character of each reply
  let lowerCount = 0;
  let upperCount = 0;
  for (const reply of replies) {
    const firstChar = reply.trim()[0];
    if (!firstChar) continue;
    if (firstChar === firstChar.toLowerCase() && firstChar.match(/[a-z]/)) {
      lowerCount++;
    } else if (firstChar === firstChar.toUpperCase() && firstChar.match(/[A-Z]/)) {
      upperCount++;
    }
  }
  let capitalizationStyle;
  const totalCased = lowerCount + upperCount;
  if (totalCased === 0) {
    capitalizationStyle = "mixed";
  } else if (lowerCount / totalCased > 0.6) {
    capitalizationStyle = "lowercase";
  } else if (upperCount / totalCased > 0.6) {
    capitalizationStyle = "proper case";
  } else {
    capitalizationStyle = "mixed";
  }

  // ── punctuationStyle ─────────────────────────────────────────────────────
  // "minimal" if majority of replies DON'T end with . ! ?
  const terminalPunctuation = /[.!?]$/;
  const withTerminal = replies.filter((r) =>
    terminalPunctuation.test(r.trim())
  ).length;
  const punctuationStyle =
    withTerminal / replies.length < 0.5 ? "minimal" : "standard";

  // ── commonFillers ────────────────────────────────────────────────────────
  const fillerFreq = {};
  for (const reply of replies) {
    const lowerReply = reply.toLowerCase();
    for (const filler of FILLER_VOCAB) {
      // Basic boundary check
      const regex = new RegExp(`\\b${filler}\\b`);
      if (regex.test(lowerReply)) {
        fillerFreq[filler] = (fillerFreq[filler] || 0) + 1;
      }
    }
  }
  const commonFillers = Object.entries(fillerFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  return {
    averageWordCount,
    emojiUsagePercent,
    topEmojis,
    greetingPatterns,
    commonPhrases,
    capitalizationStyle,
    punctuationStyle,
    commonFillers,
  };
}

module.exports = { buildStyleProfile };
