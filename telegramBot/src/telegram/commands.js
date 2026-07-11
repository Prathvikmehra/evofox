const sender = require("./sender");
const { BotService } = require("./service");

/**
   * Escape special HTML characters so Telegram parses correctly.
   */
function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function handleStart(chatId, tgUser) {
  const user = await BotService.registerOrGetUser(tgUser);
  const welcomeText = `👋 <b>Welcome to EchoMind, ${escapeHtml(user.firstName || "there")}!</b>\n\nI am your personal AI clone coordinator. I learn your text messaging patterns (emoji usage, pacing, vocabulary) and replicate your writing style offline.\n\n${
    user.trained
      ? "✅ Your personality clone is trained and active! Send me any text message to test replies."
      : "⚠️ You haven't trained a personality clone yet. Send /train to get started!"
  }\n\nUse /help to see all available commands.`;
  await sender.sendMessage(chatId, welcomeText);
}

async function handleHelp(chatId) {
  const helpText = `💬 <b>EchoMind Bot Help Menu</b>\n\nHere are the commands you can use:\n\n` +
    `/start - Initialize/Welcome back\n` +
    `/help - Show this guide\n` +
    `/train - Start style personality training\n` +
    `/profile - View your current personality profile stats\n` +
    `/retrain - Discard current style profile and start fresh\n` +
    `/history - View recent conversation logs\n` +
    `/settings - Configure auto-replies, tone, emoji usage & quiet hours\n` +
    `/delete - Permanently wipe your profile and memory records\n\n` +
    `💡 <i>To begin clone training, type /train and follow the instructions.</i>`;
  await sender.sendMessage(chatId, helpText);
}

async function handleTrain(chatId, user) {
  if (user && user.trained) {
    const text = `ℹ️ <b>Your personality clone is already trained!</b>\nIf you want to reload your history, type /retrain to overwrite it.`;
    return sender.sendMessage(chatId, text);
  }

  const instructions = `📤 <b>Cloning Setup instructions:</b>\n\nPlease export a conversation history file and send it directly to me here.\n\n` +
    `<b>Supported Formats:</b>\n` +
    `• <b>WhatsApp:</b> Export a chat (without media) as a <b>.txt</b> file.\n` +
    `• <b>Telegram:</b> Export chat history using Telegram Desktop client as a <b>JSON</b> document.\n\n` +
    `👇 <i>Simply attach and send the .txt or .json file below to start.</i>`;
  await sender.sendMessage(chatId, instructions);
}

async function handleRetrain(chatId) {
  const retrainText = `🔄 <b>Retraining Request:</b>\n\nPlease upload a new WhatsApp <b>.txt</b> export or Telegram <b>.json</b> export file. This will overwrite your existing personality clone.`;
  await sender.sendMessage(chatId, retrainText);
}

async function handleProfile(chatId, user) {
  if (!user || !user.trained) {
    const text = `⚠️ <b>No profile found!</b>\nPlease upload a chat history export using /train first.`;
    return sender.sendMessage(chatId, text);
  }

  const profile = await BotService.getStyleProfile(user.telegramId);
  if (!profile) {
    const text = `⚠️ <b>Personality profile data not found!</b>\nTry retraining using /retrain.`;
    return sender.sendMessage(chatId, text);
  }

  const profileText = `🧠 <b>EchoMind Clone Style Profile</b>\n\n` +
    `• <b>Average Words per Msg:</b> ${profile.averageWordCount.toFixed(1)}\n` +
    `• <b>Emoji Frequency:</b> ${profile.emojiUsage.toFixed(1)}%\n` +
    `• <b>Top Emojis:</b> ${profile.topEmojis.join(" ") || "None detected"}\n` +
    `• <b>Capitalization Style:</b> <code>${profile.capitalizationStyle}</code>\n` +
    `• <b>Punctuation Style:</b> <code>${profile.punctuationStyle}</code>\n` +
    `• <b>Preferred Phrases:</b> ${profile.commonPhrases.map(p => `"${escapeHtml(p)}"`).join(", ") || "None"}`;

  await sender.sendMessage(chatId, profileText);
}

async function handleHistory(chatId, user) {
  if (!user || !user.trained) {
    return sender.sendMessage(chatId, `⚠️ Please train your clone first using /train.`);
  }

  const history = await BotService.getRecentConversations(user.telegramId);
  if (history.length === 0) {
    return sender.sendMessage(chatId, `📜 No conversations logged yet. Send me some text messages to start chatting!`);
  }

  let historyText = `📜 <b>Recent Conversation Logs (Last ${history.length}):</b>\n\n`;
  history.forEach((conv, idx) => {
    historyText += `<b>#${idx + 1} Log:</b>\n` +
      `📥 <i>User:</i> "${escapeHtml(conv.incomingMessage)}"\n` +
      `🤖 <i>Clone:</i> "${escapeHtml(conv.generatedReply)}"\n` +
      `📅 <i>Date:</i> ${conv.createdAt.toLocaleString()}\n\n`;
  });

  await sender.sendMessage(chatId, historyText);
}

async function handleSettings(chatId, user) {
  if (!user) return;
  const s = user.settings;

  const settingsText = `⚙️ <b>EchoMind Clone Settings:</b>\n\n` +
    `• <b>Auto Reply:</b> ${s.autoReply ? "🟢 Enabled" : "🔴 Disabled"}\n` +
    `• <b>Manual Approval:</b> ${s.manualApproval ? "🟢 Enabled" : "🔴 Disabled"}\n` +
    `• <b>Reply Delay:</b> ${s.replyDelay} seconds\n` +
    `• <b>Quiet Hours:</b> ${s.quietHours.enabled ? `🟢 Active (${s.quietHours.start} - ${s.quietHours.end})` : "🔴 Disabled"}\n` +
    `• <b>Group Chats:</b> ${s.groupChatEnabled ? "🟢 Allowed" : "🔴 Blocked"}\n` +
    `• <b>Emoji Level:</b> <code>${s.emojiLevel}</code>\n` +
    `• <b>Preferred Tone:</b> <code>${s.tone}</code>\n\n` +
    `👇 Click the inline buttons below to modify settings.`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: `Auto-Reply: ${s.autoReply ? "ON" : "OFF"}`, callback_data: "toggle:autoReply" },
        { text: `Manual Appr: ${s.manualApproval ? "ON" : "OFF"}`, callback_data: "toggle:manualApproval" }
      ],
      [
        { text: "Set Delay ⏱️", callback_data: "menu:delay" },
        { text: `Quiet Hours: ${s.quietHours.enabled ? "ON" : "OFF"}`, callback_data: "toggle:quietHours" }
      ],
      [
        { text: `Emoji Level: ${s.emojiLevel.toUpperCase()}`, callback_data: "cycle:emojiLevel" },
        { text: `Tone: ${s.tone.toUpperCase()}`, callback_data: "cycle:tone" }
      ],
      [
        { text: `Groups: ${s.groupChatEnabled ? "ON" : "OFF"}`, callback_data: "toggle:groupChatEnabled" }
      ]
    ]
  };

  await sender.sendMessage(chatId, settingsText, { reply_markup: inlineKeyboard });
}

async function handleDelete(chatId, user) {
  if (!user) return;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔴 Yes, delete everything", callback_data: "confirm_delete" },
        { text: "🟢 Cancel", callback_data: "cancel_delete" }
      ]
    ]
  };

  await sender.sendMessage(chatId, `⚠️ <b>WARNING:</b> This will permanently wipe your personality style profiles, reply pairs, and logged conversation history from our offline databases.\n\nAre you sure you want to proceed?`, {
    reply_markup: keyboard
  });
}

module.exports = {
  handleStart,
  handleHelp,
  handleTrain,
  handleRetrain,
  handleProfile,
  handleHistory,
  handleSettings,
  handleDelete,
};
