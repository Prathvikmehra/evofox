/**
 * cleanMessages — filter out noise from a parsed WhatsApp message list.
 *
 * Removes system notifications, media placeholders, deleted messages, and
 * anything else that isn't real conversational text. Also trims whitespace
 * and discards messages that are empty after trimming.
 *
 * @param {Array<{ timestamp: string, sender: string, text: string }>} messages
 * @returns {Array<{ timestamp: string, sender: string, text: string }>}
 */

// Patterns that definitively identify non-conversational system messages
const NOISE_PATTERNS = [
  /<Media omitted>/i,
  /Missed voice call/i,
  /Missed video call/i,
  /Messages and calls are end-to-end encrypted/i,
  /This message was deleted/i,
  /You deleted this message/i,
  // Group-management system messages
  / added /i,
  / left$/i,
  / removed /i,
  / changed the subject/i,
  /changed this group's icon/i,
  /changed this group's description/i,
  // Security / disappearing-messages notices
  /Your security code with/i,
  /turned on disappearing messages/i,
  /turned off disappearing messages/i,
];

function isNoise(text) {
  return NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .map((msg) => ({ ...msg, text: msg.text.trim() }))   // trim whitespace
    .filter((msg) => msg.text.length > 0)                  // drop empty after trim
    .filter((msg) => !isNoise(msg.text));                  // drop system noise
}

module.exports = { cleanMessages };
