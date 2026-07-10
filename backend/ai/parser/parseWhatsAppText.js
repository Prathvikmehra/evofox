/**
 * parseWhatsAppText — convert raw WhatsApp export text into structured messages.
 *
 * WhatsApp export format (12h and 24h clocks, DD/MM/YYYY and MM/DD/YYYY):
 *   DD/MM/YYYY, H:MM AM/PM - SenderName: message text
 *   MM/DD/YYYY, HH:MM - SenderName: message text
 *
 * Two categories of lines:
 *
 *  1. Regular messages — timestamp prefix + "Sender: text"
 *     Matched by MESSAGE_PATTERN (has colon-delimited sender segment).
 *
 *  2. No-colon system lines — timestamp prefix but NO "Sender: text" structure
 *     e.g. "John left", "You added Priya", "Messages and calls are end-to-end encrypted"
 *     Matched by SYSTEM_PATTERN. Tagged sender: "__SYSTEM__" so the cleaner can
 *     remove them structurally instead of via fragile substring matching.
 *     Never appended to the previous message as a continuation.
 *
 *  3. Continuation lines — no timestamp prefix at all
 *     Appended to the previous message's text with "\n".
 *
 * @param {string} rawText
 * @returns {Array<{ timestamp: string, sender: string, text: string }>}
 */

// Matches both date orderings and both clock formats.
// Groups: (1) date  (2) time with optional AM/PM  (3) sender  (4) message text
const MESSAGE_PATTERN =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s[-\u202f]\s([^:]+?):\s(.*)$/;

// Matches timestamp prefix + " - " but captures everything after as plain text
// (no colon-delimited sender segment). Used to detect system notifications.
// Groups: (1) date  (2) time  (3) full text after " - "
const SYSTEM_PATTERN =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s[-\u202f]\s(.+)$/;

function parseWhatsAppText(rawText) {
  // Guard: non-string or empty input → return empty array, never throw
  if (!rawText || typeof rawText !== "string") return [];

  const lines = rawText.split("\n");
  const messages = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, ""); // strip Windows CR if present

    const msgMatch = line.match(MESSAGE_PATTERN);
    if (msgMatch) {
      // Regular message with "Sender: text" structure
      const [, date, time, sender, text] = msgMatch;
      messages.push({
        timestamp: `${date}, ${time}`,
        sender: sender.trim(),
        text,
      });
      continue;
    }

    const sysMatch = line.match(SYSTEM_PATTERN);
    if (sysMatch) {
      // No-colon system line — isolate as its own message, never merge into previous
      const [, date, time, text] = sysMatch;
      messages.push({
        timestamp: `${date}, ${time}`,
        sender: "__SYSTEM__",
        text,
      });
      continue;
    }

    // Genuine continuation line (no timestamp prefix)
    if (messages.length > 0) {
      messages[messages.length - 1].text += "\n" + line;
    }
    // If no previous message yet, discard (malformed/preamble input)
  }

  return messages;
}

module.exports = { parseWhatsAppText };
