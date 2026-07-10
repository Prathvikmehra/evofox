/**
 * buildReplyPairs — convert a cleaned message list into training-style
 * (incoming → reply) pairs for a specific target sender.
 *
 * Algorithm:
 *  1. Collapse consecutive messages from the same sender into one "turn"
 *     (people often send several short messages before the other responds).
 *  2. Walk turns: whenever a non-target turn is immediately followed by a
 *     target turn, emit a { incoming, reply } pair.
 *
 * Returns an empty array (never throws) when no pairs can be formed —
 * e.g. targetSender never replied to anyone in this excerpt.
 *
 * @param {Array<{ timestamp: string, sender: string, text: string }>} messages
 * @param {string} targetSender
 * @returns {Array<{ incoming: string, reply: string }>}
 */
function buildReplyPairs(messages, targetSender) {
  if (!Array.isArray(messages) || !targetSender) return [];

  // ── Step 1: collapse consecutive messages from the same sender ────────────
  const turns = [];
  for (const msg of messages) {
    const last = turns[turns.length - 1];
    if (last && last.sender === msg.sender) {
      // Append to current turn
      last.text += "\n" + msg.text;
    } else {
      // New turn
      turns.push({ sender: msg.sender, text: msg.text });
    }
  }

  // ── Step 2: extract (incoming, reply) pairs ───────────────────────────────
  const pairs = [];
  for (let i = 0; i < turns.length - 1; i++) {
    const current = turns[i];
    const next = turns[i + 1];

    if (current.sender !== targetSender && next.sender === targetSender) {
      pairs.push({
        incoming: current.text,
        reply: next.text,
      });
    }
  }

  return pairs;
}

module.exports = { buildReplyPairs };
