/**
 * cleanMessages — filter out noise from a parsed WhatsApp message list.
 *
 * Filter order (matters):
 *  1. sender === "__SYSTEM__" — structural tag applied by the parser for
 *     no-colon system lines (group events, encryption banner, subject changes,
 *     icon changes, etc.). Handled structurally; never via substring matching.
 *
 *  2. Text-based noise patterns — for sender-attributed messages whose text
 *     is still non-conversational (media placeholders, deleted messages,
 *     missed calls). These DO have a real sender colon, so parser gives them
 *     a real sender, and we filter by text content.
 *
 *  3. Empty text — after trimming.
 *
 * What is NOT filtered by text:
 *  - Words like "left", "added", "removed" are NOT checked as substrings.
 *    A message "I left my phone at home" or "she added me to the trip"
 *    must survive cleaning unchanged. Group-event lines containing these
 *    words are already handled by __SYSTEM__ tagging in the parser.
 *
 * Never deduplicates repeated messages.
 *
 * @param {Array<{ timestamp: string, sender: string, text: string }>} messages
 * @returns {Array<{ timestamp: string, sender: string, text: string }>}
 */

// Text-based patterns for sender-attributed noise only.
// Do NOT add broad word matches here — use parser __SYSTEM__ tagging instead.
const NOISE_PATTERNS = [
  /<Media omitted>/i,
  /Missed voice call/i,
  /Missed video call/i,
  /Messages and calls are end-to-end encrypted/i,
  /This message was deleted/i,
  /You deleted this message/i,
];

function isNoise(text) {
  return NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((msg) => msg.sender !== "__SYSTEM__")        // 1. drop system-tagged lines first
    .map((msg) => ({ ...msg, text: msg.text.trim() }))  // trim whitespace
    .filter((msg) => msg.text.length > 0)                // 2. drop empty after trim
    .filter((msg) => !isNoise(msg.text));                // 3. drop remaining text-based noise
}

module.exports = { cleanMessages };
