/**
 * parseWhatsAppText — convert raw WhatsApp export text into structured messages.
 *
 * WhatsApp export format (12h and 24h clocks, DD/MM/YYYY and MM/DD/YYYY):
 *   DD/MM/YYYY, H:MM AM/PM - SenderName: message text
 *   MM/DD/YYYY, HH:MM - SenderName: message text
 *
 * Lines that don't match the pattern are treated as continuations of the
 * previous message (WhatsApp wraps multi-line messages this way).
 *
 * @param {string} rawText
 * @returns {Array<{ timestamp: string, sender: string, text: string }>}
 */
function parseWhatsAppText(rawText) {
  // Guard: non-string or empty input → return empty array, never throw
  if (!rawText || typeof rawText !== "string") return [];

  // Matches both date orderings (DD/MM or MM/DD) and both clock formats.
  // Groups: (1) date  (2) time with optional AM/PM  (3) sender  (4) message text
  const MESSAGE_PATTERN =
    /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s[-\u202f]\s([^:]+?):\s(.*)$/;

  const lines = rawText.split("\n");
  const messages = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, ""); // strip Windows CR if present
    const match = line.match(MESSAGE_PATTERN);

    if (match) {
      // Start of a new message
      const [, date, time, sender, text] = match;
      messages.push({
        timestamp: `${date}, ${time}`,
        sender: sender.trim(),
        text,
      });
    } else {
      // Continuation line — append to previous message's text
      if (messages.length > 0) {
        messages[messages.length - 1].text += "\n" + line;
      }
      // If no previous message yet, discard (malformed/preamble input)
    }
  }

  return messages;
}

module.exports = { parseWhatsAppText };
