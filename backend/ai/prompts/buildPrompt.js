/**
 * buildPrompt — assemble the style profile + few-shot examples + new message
 * into a single prompt string for the local Ollama LLM.
 *
 * Prompt structure (in order):
 *  1. Role framing — instructs model to respond as a real texter
 *  2. Style profile bullet list — concrete, measurable style attributes
 *  3. Labelled few-shot examples from the real chat history
 *  4. Hard constraint: output only the reply, nothing else
 *  5. The new message + "You:" completion cue
 *
 * @param {string} newMessage
 * @param {StyleProfile} styleProfile
 * @param {Array<{ incoming: string, reply: string }>} examples
 * @returns {string}
 */
function buildPrompt(newMessage, styleProfile, examples) {
  const {
    averageWordCount,
    emojiUsagePercent,
    topEmojis,
    commonPhrases,
    capitalizationStyle,
    punctuationStyle,
  } = styleProfile;

  // ── 1. Role framing ────────────────────────────────────────────────────
  const lines = [
    "You are texting as a real person. Respond EXACTLY as that person would — matching their vocabulary, tone, length, and texting habits.",
    "",
  ];

  // ── 2. Style profile ───────────────────────────────────────────────────
  lines.push("Their texting style:");
  lines.push(
    `- Message length: around ${averageWordCount} words on average`
  );

  if (emojiUsagePercent > 0) {
    const emojiDesc =
      topEmojis.length > 0
        ? `often uses ${topEmojis.join(" ")}`
        : "uses emojis sometimes";
    lines.push(
      `- Emojis: uses emojis in ${emojiUsagePercent}% of messages; ${emojiDesc}`
    );
  } else {
    lines.push("- Emojis: rarely or never uses emojis");
  }

  if (commonPhrases.length > 0) {
    lines.push(`- Favourite words: ${commonPhrases.join(", ")}`);
  }

  lines.push(`- Capitalisation: ${capitalizationStyle}`);
  lines.push(`- Punctuation style: ${punctuationStyle}`);
  lines.push("");

  // ── 3. Few-shot examples ───────────────────────────────────────────────
  if (examples.length > 0) {
    lines.push("Here are real examples of how they text:");
    lines.push("");
    for (const ex of examples) {
      lines.push(`Them: "${ex.incoming}"`);
      lines.push(`You: "${ex.reply}"`);
      lines.push("");
    }
  }

  // ── 4. Hard output constraint ──────────────────────────────────────────
  lines.push(
    "Now reply to the new message below. Output ONLY the reply text — no quotation marks, no 'Sure, here is a reply:', no explanation, no commentary. Just the raw reply as you would type it."
  );
  lines.push("");

  // ── 5. New message + completion cue ───────────────────────────────────
  lines.push(`Them: "${newMessage}"`);
  lines.push("You:");

  return lines.join("\n");
}

module.exports = { buildPrompt };
