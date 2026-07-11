const sender = require("./sender");
const { BotService, parseTelegramJson, parseWhatsAppText, cleanMessages } = require("./service");
const commands = require("./commands");

// Simple state tracking for active document downloads
const pendingDelays = new Map();

/**
 * Handle normal incoming text messages.
 */
async function handleTextMessage(chatId, message, user) {
  const text = message.text ? message.text.trim() : "";
  if (!text) return;

  // Route commands
  if (text.startsWith("/")) {
    const cmd = text.split(" ")[0].toLowerCase();
    switch (cmd) {
      case "/start":
        return commands.handleStart(chatId, message.from);
      case "/help":
        return commands.handleHelp(chatId);
      case "/train":
        return commands.handleTrain(chatId, user);
      case "/retrain":
        return commands.handleRetrain(chatId);
      case "/profile":
        return commands.handleProfile(chatId, user);
      case "/history":
        return commands.handleHistory(chatId, user);
      case "/settings":
        return commands.handleSettings(chatId, user);
      case "/delete":
        return commands.handleDelete(chatId, user);
      default:
        return sender.sendMessage(chatId, `❌ Unknown command. Type /help to see available commands.`);
    }
  }

  // If user is not trained, advise them to train first
  if (!user || !user.trained) {
    return sender.sendMessage(chatId, `⚠️ <b>Personality Clone Not Found</b>\n\nI need to understand your texting patterns before I can converse. Please type /train and upload a chat export file.`);
  }

  // Skip group chat messages if disabled in settings
  const isGroup = message.chat.type === "group" || message.chat.type === "supergroup";
  if (isGroup && !user.settings.groupChatEnabled) {
    return;
  }

  try {
    const response = await BotService.generateResponse(user.telegramId, text);
    if (!response) return; // Silent skip (e.g. Quiet Hours active)

    const { reply, delay, manualApproval } = response;

    if (manualApproval) {
      // Manual approval flow — send reply to the user with approval buttons
      const keyboard = {
        inline_keyboard: [
          [
            { text: "✅ Approve & Send", callback_data: `approve_send:${chatId}` },
            { text: "❌ Discard", callback_data: "discard_reply" }
          ]
        ]
      };
      
      const approvalText = `🤖 <b>Generated Suggestion:</b>\n\n"${reply}"\n\n<i>Manual Approval is active. Do you want to approve this reply?</i>`;
      await sender.sendMessage(chatId, approvalText, { reply_markup: keyboard });
    } else {
      // Standard reply with optional simulated delay
      if (delay > 0) {
        console.log(`[Telegram Handler] Delaying response to ${chatId} by ${delay}s...`);
        const timer = setTimeout(async () => {
          await sender.sendMessage(chatId, reply);
          pendingDelays.delete(chatId);
        }, delay * 1000);
        pendingDelays.set(chatId, timer);
      } else {
        await sender.sendMessage(chatId, reply);
      }
    }
  } catch (err) {
    console.error("[Telegram Handler] Error generating reply:", err.message);
    await sender.sendMessage(chatId, `❌ <i>Error generating styled response. Please make sure your local Ollama model is active.</i>`);
  }
}

/**
 * Handle document attachments (.txt WhatsApp exports or .json Telegram exports).
 */
async function handleDocument(chatId, document, user) {
  const fileName = document.file_name || "";
  const ext = fileName.split(".").pop().toLowerCase();

  if (ext !== "txt" && ext !== "json") {
    return sender.sendMessage(chatId, `❌ <b>Unsupported file format.</b>\n\nPlease upload a WhatsApp export ending in <b>.txt</b> or a Telegram export ending in <b>.json</b>.`);
  }

  await sender.sendMessage(chatId, `⏳ <b>Downloading and parsing "${fileName}"...</b>`);

  try {
    // 1. Get file metadata & download content
    const fileMeta = await sender.getFile(document.file_id);
    const fileContent = await sender.downloadFile(fileMeta.file_path);

    let parsedMessages = [];

    // 2. Parse based on file type
    if (ext === "json") {
      parsedMessages = parseTelegramJson(fileContent);
    } else {
      const rawLines = parseWhatsAppText(fileContent);
      parsedMessages = cleanMessages(rawLines);
    }

    if (!parsedMessages || parsedMessages.length === 0) {
      return sender.sendMessage(chatId, `❌ <b>Parsing Error:</b> Could not extract any readable messages from this file. Ensure it is a valid, raw chat export.`);
    }

    // 3. Find unique senders (first 10 max to fit keyboard limits)
    const senders = [...new Set(parsedMessages.map((m) => m.sender))].filter(
      (s) => s && s !== "__SYSTEM__"
    );

    if (senders.length === 0) {
      return sender.sendMessage(chatId, `❌ <b>No senders detected:</b> Please verify your chat format.`);
    }

    // Save parsed messages to temp storage
    await BotService.saveTempMessages(user.telegramId, parsedMessages);

    // 4. Send interactive selection buttons
    const inlineKeyboard = {
      inline_keyboard: senders.slice(0, 10).map((senderName) => [
        {
          text: senderName,
          callback_data: `pick_sender:${senderName.substring(0, 30)}`, // limit key length
        }
      ]),
    };

    await sender.sendMessage(
      chatId,
      `🎯 <b>Who is the target personality?</b>\n\nI detected multiple senders. Please select the name you wish to clone below:`,
      { reply_markup: inlineKeyboard }
    );
  } catch (err) {
    console.error("[Telegram Handler] Document parsing error:", err.message);
    await sender.sendMessage(chatId, `❌ <b>Failed to process file:</b> ${err.message}`);
  }
}

/**
 * Handle callback queries (inline button clicks).
 */
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const tgUser = callbackQuery.from;

  const user = await BotService.registerOrGetUser(tgUser);

  // 1. Pick Sender Training Flow
  if (data.startsWith("pick_sender:")) {
    const targetSender = data.replace("pick_sender:", "");
    await sender.sendMessage(chatId, `⚙️ <b>Analyzing style patterns for "${targetSender}"...</b>`);

    try {
      const result = await BotService.trainUser(user.telegramId, targetSender);
      
      const successText = `✅ <b>Clone Training Complete!</b>\n\n` +
        `• <b>Target Profile:</b> "${targetSender}"\n` +
        `• <b>Reply Pairs Loaded:</b> ${result.pairsCount}\n` +
        `• <b>Capitalization style:</b> <code>${result.styleProfile.capitalizationStyle}</code>\n\n` +
        `Try typing a message here (e.g. "hey where are you?") and watch your clone reply!`;
      await sender.sendMessage(chatId, successText);
      await sender.answerCallbackQuery(callbackQuery.id, "Training Successful!");
    } catch (err) {
      await sender.sendMessage(chatId, `❌ <b>Training Failed:</b> ${err.message}`);
    }
    return;
  }

  // 2. Settings Toggle Button clicks
  if (data.startsWith("toggle:")) {
    const settingKey = data.replace("toggle:", "");
    const updatedSettings = { ...user.settings };

    if (settingKey === "quietHours") {
      updatedSettings.quietHours.enabled = !updatedSettings.quietHours.enabled;
    } else {
      updatedSettings[settingKey] = !updatedSettings[settingKey];
    }

    user.settings = updatedSettings;
    await user.save();
    
    // Refresh settings view
    await commands.handleSettings(chatId, user);
    await sender.answerCallbackQuery(callbackQuery.id, "Settings updated");
    return;
  }

  // 3. Settings Cycle Button clicks
  if (data.startsWith("cycle:")) {
    const settingKey = data.replace("cycle:", "");
    
    if (settingKey === "emojiLevel") {
      const levels = ["low", "normal", "high"];
      const idx = (levels.indexOf(user.settings.emojiLevel) + 1) % levels.length;
      user.settings.emojiLevel = levels[idx];
    } else if (settingKey === "tone") {
      user.settings.tone = user.settings.tone === "casual" ? "formal" : "casual";
    }

    await user.save();
    await commands.handleSettings(chatId, user);
    await sender.answerCallbackQuery(callbackQuery.id, "Setting updated");
    return;
  }

  // 4. Delay submenu
  if (data === "menu:delay") {
    const keyboard = {
      inline_keyboard: [
        [
          { text: "0s (No delay)", callback_data: "set_delay:0" },
          { text: "2s", callback_data: "set_delay:2" }
        ],
        [
          { text: "5s", callback_data: "set_delay:5" },
          { text: "10s", callback_data: "set_delay:10" }
        ],
        [
          { text: "🔙 Back to Settings", callback_data: "back_to_settings" }
        ]
      ]
    };
    await sender.sendMessage(chatId, `⏱️ <b>Select reply simulation delay:</b>\n\nAdding a delay makes interactions feel more human on group chats.`, {
      reply_markup: keyboard
    });
    await sender.answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data.startsWith("set_delay:")) {
    const delayVal = parseInt(data.replace("set_delay:", ""), 10);
    user.settings.replyDelay = delayVal;
    await user.save();
    
    await commands.handleSettings(chatId, user);
    await sender.answerCallbackQuery(callbackQuery.id, `Delay set to ${delayVal}s`);
    return;
  }

  if (data === "back_to_settings") {
    await commands.handleSettings(chatId, user);
    await sender.answerCallbackQuery(callbackQuery.id);
    return;
  }

  // 5. Manual Approval Action Click
  if (data.startsWith("approve_send:")) {
    const rawText = callbackQuery.message.text || "";
    // Pull the quote string inside the double quotes
    const match = rawText.match(/"([^"]+)"/);
    const replyText = match ? match[1] : "";
    
    if (replyText) {
      await sender.sendMessage(chatId, replyText);
      await sender.sendMessage(chatId, `✅ <i>Reply sent.</i>`);
    } else {
      await sender.sendMessage(chatId, `⚠️ <i>Failed to resend quote.</i>`);
    }
    await sender.answerCallbackQuery(callbackQuery.id, "Reply Sent");
    return;
  }

  if (data === "discard_reply") {
    await sender.sendMessage(chatId, `🗑️ <i>Suggestion discarded.</i>`);
    await sender.answerCallbackQuery(callbackQuery.id, "Discarded");
    return;
  }

  // 6. Delete User Profile Confirmation Flow
  if (data === "confirm_delete") {
    const deleted = await BotService.deleteUser(user.telegramId);
    if (deleted) {
      await sender.sendMessage(chatId, `🗑️ <b>Data Purged successfully.</b>\n\nYour profile clone and training metrics have been permanently erased from MongoDB.`);
    } else {
      await sender.sendMessage(chatId, `❌ Failed to delete data.`);
    }
    await sender.answerCallbackQuery(callbackQuery.id);
    return;
  }

  if (data === "cancel_delete") {
    await sender.sendMessage(chatId, `🟢 <i>Deletion cancelled. Your clone is safe!</i>`);
    await sender.answerCallbackQuery(callbackQuery.id);
    return;
  }
}

/**
 * Global router of updates.
 */
async function processUpdate(update) {
  // We can receive message updates, callback query updates, etc.
  if (update.message) {
    const message = update.message;
    const chatId = message.chat.id;

    // Load or register the Telegram user
    const user = await BotService.registerOrGetUser(message.from);

    // Handle files (documents)
    if (message.document) {
      return handleDocument(chatId, message.document, user);
    }

    // Handle standard text
    if (message.text) {
      return handleTextMessage(chatId, message, user);
    }
  }

  if (update.callback_query) {
    return handleCallbackQuery(update.callback_query);
  }
}

module.exports = {
  processUpdate,
};
