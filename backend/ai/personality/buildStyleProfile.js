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
// Unicode ranges that cover the vast majority of emoji characters
const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F000}-\u{1FFFF}]/gu;

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

// ── Default profile returned on empty input ────────────────────────────────
const EMPTY_PROFILE = {
  averageWordCount: 0,
  emojiUsagePercent: 0,
  topEmojis: [],
  commonPhrases: [],
  capitalizationStyle: "mixed",
  punctuationStyle: "standard",
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
  const repliesWithEmoji = replies.filter((r) => EMOJI_REGEX.test(r));
  // Reset lastIndex since the regex has global flag
  EMOJI_REGEX.lastIndex = 0;
  const emojiUsagePercent = parseFloat(
    ((repliesWithEmoji.length / replies.length) * 100).toFixed(1)
  );

  // ── topEmojis ───────────────────────────────────────────────────────────
  const emojiFreq = {};
  for (const reply of replies) {
    const matches = [...reply.matchAll(EMOJI_REGEX)];
    for (const [emoji] of matches) {
      emojiFreq[emoji] = (emojiFreq[emoji] || 0) + 1;
    }
  }
  const topEmojis = Object.entries(emojiFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emoji]) => emoji);

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

  return {
    averageWordCount,
    emojiUsagePercent,
    topEmojis,
    commonPhrases,
    capitalizationStyle,
    punctuationStyle,
  };
}

module.exports = { buildStyleProfile };
