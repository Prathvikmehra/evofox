const mongoose = require("mongoose");
const config = require("../config");

// Import existing AI modules from evofox/backend/ai
const { parseWhatsAppText } = require("../../../backend/ai/parser/parseWhatsAppText");
const { cleanMessages } = require("../../../backend/ai/cleaner/cleanMessages");
const { buildReplyPairs } = require("../../../backend/ai/parser/buildReplyPairs");
const { buildStyleProfile } = require("../../../backend/ai/personality/buildStyleProfile");
const { generateReply } = require("../../../backend/ai/generate/generateReply");

// ─── MONGOOSE DATABASE CONNECTION ──────────────────────────────────────────
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(config.MONGODB_URI);
      console.log("[Telegram DB] Connected to MongoDB via Mongoose");
    } catch (err) {
      console.error("[Telegram DB] MongoDB connection failed:", err.message);
      throw err;
    }
  }
}

// ─── MONGOOSE SCHEMAS & MODELS ──────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true, index: true },
  username: { type: String },
  firstName: { type: String },
  trained: { type: Boolean, default: false },
  settings: {
    autoReply: { type: Boolean, default: true },
    manualApproval: { type: Boolean, default: false },
    replyDelay: { type: Number, default: 0 }, // delay in seconds
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" },
      end: { type: String, default: "08:00" },
    },
    groupChatEnabled: { type: Boolean, default: false },
    emojiLevel: { type: String, default: "normal" }, // low, normal, high
    tone: { type: String, default: "casual" }, // formal, casual
  },
  // Temporary storage to hold parsed messages before user picks who is "You"
  tempMessages: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const StyleProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  averageWordCount: { type: Number, default: 0 },
  emojiUsage: { type: Number, default: 0 },
  topEmojis: { type: [String], default: [] },
  capitalizationStyle: { type: String, default: "normal" },
  punctuationStyle: { type: String, default: "normal" },
  commonPhrases: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

const ReplyPairSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  incoming: { type: String, required: true },
  reply: { type: String, required: true },
  keywords: { type: [String], default: [] },
});

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  incomingMessage: { type: String, required: true },
  generatedReply: { type: String, required: true },
  platform: { type: String, default: "telegram" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const StyleProfile = mongoose.model("StyleProfile", StyleProfileSchema);
const ReplyPair = mongoose.model("ReplyPair", ReplyPairSchema);
const Conversation = mongoose.model("Conversation", ConversationSchema);

// ─── TELEGRAM PARSING HELPER ────────────────────────────────────────────────
function parseTelegramJson(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.messages)) {
      return [];
    }

    const messages = [];
    for (const msg of data.messages) {
      if (msg.type !== "message" || !msg.from) continue;

      let textStr = "";
      if (typeof msg.text === "string") {
        textStr = msg.text;
      } else if (Array.isArray(msg.text)) {
        textStr = msg.text
          .map((t) => (typeof t === "string" ? t : t.text || ""))
          .join("");
      }

      if (!textStr.trim()) continue;

      // Map ISO date format to readable timestamp string
      const dateObj = new Date(msg.date);
      const timestamp = isNaN(dateObj.getTime()) ? msg.date : dateObj.toLocaleString("en-US");

      messages.push({
        timestamp,
        sender: msg.from,
        text: textStr,
      });
    }
    return messages;
  } catch (err) {
    console.error("[Telegram Service] Failed to parse Telegram JSON:", err.message);
    return [];
  }
}

// ─── BOT SERVICE METHODS ──────────────────────────────────────────────────
class BotService {
  async registerOrGetUser(tgUser) {
    await connectDB();
    let user = await User.findOne({ telegramId: tgUser.id.toString() });
    if (!user) {
      user = new User({
        telegramId: tgUser.id.toString(),
        username: tgUser.username || "",
        firstName: tgUser.first_name || "",
      });
      await user.save();
      console.log(`[Telegram Service] Registered new user: ${user.firstName} (@${user.username})`);
    }
    return user;
  }

  async getUser(telegramId) {
    await connectDB();
    return User.findOne({ telegramId: telegramId.toString() });
  }

  async saveTempMessages(telegramId, messages) {
    await connectDB();
    return User.findOneAndUpdate(
      { telegramId: telegramId.toString() },
      { tempMessages: messages },
      { new: true }
    );
  }

  /**
   * Train user using a previously parsed set of messages stored in tempMessages.
   */
  async trainUser(telegramId, targetSender) {
    await connectDB();
    const user = await User.findOne({ telegramId: telegramId.toString() });
    if (!user || !user.tempMessages || user.tempMessages.length === 0) {
      throw new Error("No chat data found. Please upload a history file first using /train.");
    }

    // 1. Build Reply Pairs from temp messages
    const pairs = buildReplyPairs(user.tempMessages, targetSender);
    if (pairs.length === 0) {
      throw new Error(`No reply pairs found for sender "${targetSender}". Try uploading a different chat.`);
    }

    // 2. Build Style Profile
    const profile = buildStyleProfile(pairs);

    // 3. Clear existing training data for this user
    await StyleProfile.deleteMany({ userId: user._id });
    await ReplyPair.deleteMany({ userId: user._id });

    // 4. Save Style Profile
    const styleProfileDoc = new StyleProfile({
      userId: user._id,
      averageWordCount: profile.averageWordCount || 0,
      emojiUsage: profile.emojiUsagePercent || 0,
      topEmojis: profile.topEmojis || [],
      capitalizationStyle: profile.capitalizationStyle || "normal",
      punctuationStyle: profile.punctuationStyle || "normal",
      commonPhrases: profile.commonPhrases || [],
    });
    await styleProfileDoc.save();

    // 5. Save Reply Pairs
    const replyPairsToInsert = pairs.map((p) => ({
      userId: user._id,
      incoming: p.incoming,
      reply: p.reply,
      keywords: p.incoming.split(" ").filter((w) => w.length > 3),
    }));
    await ReplyPair.insertMany(replyPairsToInsert);

    // 6. Update user training status & clear temp messages
    user.trained = true;
    user.tempMessages = [];
    await user.save();

    return {
      styleProfile: styleProfileDoc,
      pairsCount: pairs.length,
    };
  }

  async deleteUser(telegramId) {
    await connectDB();
    const user = await User.findOne({ telegramId: telegramId.toString() });
    if (!user) return false;

    // Delete style profile, reply pairs, conversation history
    await StyleProfile.deleteMany({ userId: user._id });
    await ReplyPair.deleteMany({ userId: user._id });
    await Conversation.deleteMany({ userId: user._id });

    user.trained = false;
    user.tempMessages = [];
    await user.save();
    return true;
  }

  async getStyleProfile(telegramId) {
    await connectDB();
    const user = await User.findOne({ telegramId: telegramId.toString() });
    if (!user) return null;
    return StyleProfile.findOne({ userId: user._id });
  }

  async getRecentConversations(telegramId, limit = 5) {
    await connectDB();
    const user = await User.findOne({ telegramId: telegramId.toString() });
    if (!user) return [];
    return Conversation.find({ userId: user._id }).sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Helper to evaluate if current local time is in Quiet Hours.
   */
  isQuietHours(settings) {
    if (!settings || !settings.quietHours || !settings.quietHours.enabled) {
      return false;
    }
    const { start, end } = settings.quietHours;
    if (!start || !end) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = start.split(":").map(Number);
    const startMinutes = startH * 60 + startM;

    const [endH, endM] = end.split(":").map(Number);
    const endMinutes = endH * 60 + endM;

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  /**
   * Core generator: takes incoming message and calls generateReply.
   */
  async generateResponse(telegramId, incomingText) {
    await connectDB();
    const user = await User.findOne({ telegramId: telegramId.toString() });
    if (!user || !user.trained) {
      return null; // Not registered or trained
    }

    // 1. Verify quiet hours
    if (this.isQuietHours(user.settings)) {
      console.log(`[Telegram Service] Skipping reply for User ${telegramId} — Quiet Hours Active.`);
      return null;
    }

    // 2. Fetch profile & pairs
    const profileDoc = await StyleProfile.findOne({ userId: user._id });
    const pairsDocs = await ReplyPair.find({ userId: user._id });

    if (!profileDoc || pairsDocs.length === 0) {
      return null;
    }

    // 3. Format inputs for existing generateReply
    const styleProfile = {
      averageWordCount: profileDoc.averageWordCount,
      emojiUsagePercent: profileDoc.emojiUsage,
      topEmojis: profileDoc.topEmojis,
      capitalizationStyle: profileDoc.capitalizationStyle,
      punctuationStyle: profileDoc.punctuationStyle,
      commonPhrases: profileDoc.commonPhrases,
    };

    // Override settings parameters to LLM system context if applicable
    if (user.settings.emojiLevel === "low") {
      styleProfile.emojiUsagePercent = 5;
    } else if (user.settings.emojiLevel === "high") {
      styleProfile.emojiUsagePercent = 80;
    }

    if (user.settings.tone === "formal") {
      styleProfile.capitalizationStyle = "capitalized";
      styleProfile.punctuationStyle = "standard";
    }

    const samplePairs = pairsDocs.map((p) => ({
      incoming: p.incoming,
      reply: p.reply,
    }));

    // 4. Generate the reply
    console.log(`[Telegram Service] Requesting LLM generation for user: ${user.firstName}`);
    const generatedReply = await generateReply({
      incomingMessage: incomingText,
      styleProfile,
      samplePairs,
    });

    // 5. Store conversation log
    const conversation = new Conversation({
      userId: user._id,
      incomingMessage: incomingText,
      generatedReply,
    });
    await conversation.save();

    return {
      reply: generatedReply,
      delay: user.settings.replyDelay || 0,
      manualApproval: user.settings.manualApproval || false,
    };
  }
}

module.exports = {
  BotService: new BotService(),
  parseTelegramJson,
  parseWhatsAppText,
  cleanMessages,
  User,
  StyleProfile,
  ReplyPair,
  Conversation,
};
