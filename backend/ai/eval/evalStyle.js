"use strict";

/**
 * evalStyle — an objective, reproducible benchmark for EchoMind's style cloning.
 *
 * The problem with "is it better than theirs?" is that it's usually answered by
 * vibes. This harness answers it with numbers, using a holdout methodology that
 * needs no human labelling and no ground-truth beyond the chat itself:
 *
 *   1. Split the sender's real (incoming -> reply) pairs into TRAIN / TEST.
 *   2. For each TEST pair, hide the real reply. Feed the incoming message to the
 *      full generate pipeline, which may only retrieve examples from TRAIN.
 *   3. Score the generated reply against the sender's REAL reply on two axes:
 *        - Semantic fidelity: cosine similarity (via the same Ollama embeddings)
 *          between the generated reply and the real reply. "Did it say something
 *          the person would plausibly have said?"
 *        - Style fidelity: how close the generated reply is to the person's
 *          measured style (length, emoji habit, lowercase habit). "Does it sound
 *          like them?"
 *   4. Run the whole thing twice — once with semantic retrieval ON, once forced
 *      to lexical-only — so you can see the lift the embeddings actually buy.
 *
 * Requires a local Ollama with both the generation model and the embed model
 * pulled. Run it on YOUR machine:
 *
 *   node backend/ai/eval/evalStyle.js
 *
 * It prints a side-by-side table. Higher = better. Use it to prove the upgrade,
 * to tune RETRIEVAL_ALPHA / RETRIEVAL_MMR_LAMBDA, or to compare against a
 * competitor by pasting their pairs into SAMPLE_PAIRS.
 */

const { generateReply } = require("../generate/generateReply");
const { buildStyleProfile } = require("../personality/buildStyleProfile");
const { embedText, embeddingsAvailable } = require("../embeddings/embedText");
const { cosineSimilarity } = require("../retriever/vectorMath");

// ── Sample data ─────────────────────────────────────────────────────────────
// Hinglish texting sample (mirrors manualTest.js). Replace with a real export
// for a meaningful score — the bigger and more consistent the history, the more
// reliable the benchmark.
const SAMPLE_PAIRS = [
  { incoming: "kaha hai bhai?", reply: "bas raste me hu, 10 min me pohoch raha" },
  { incoming: "aaj plan kya hai?", reply: "kuch nahi bhai, tu bata" },
  { incoming: "chal game khelte hai", reply: "aaja, valorant open kar" },
  { incoming: "bhookh lag rahi hai yaar", reply: "zomato se order karle kuch" },
  { incoming: "kal chutti hai kya?", reply: "haa shayad" },
  { incoming: "jaldi aao bhai", reply: "aa raha hu shant reh" },
  { incoming: "call kar free hoke", reply: "ok bhai" },
  { incoming: "kaisa gaya exam?", reply: "bekar bhai pucho mat" },
  { incoming: "happy birthday!!", reply: "thank you bhai!!" },
  { incoming: "milte hai shaam ko", reply: "done" },
  { incoming: "movie chalein aaj?", reply: "haan bhai plan banate hai" },
  { incoming: "kitne baje nikle?", reply: "8 baje tak nikal jaate hai" },
];

const TEST_FRACTION = 0.3; // hold out ~30% for testing

// ── Style scoring helpers ────────────────────────────────────────────────────
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FEFF}\u{1F000}-\u{1FFFF}]/u;
const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * Style-fidelity score in [0,1]: rewards matching the sender's typical length,
 * emoji habit, and lowercase habit. A crude but honest "does it sound like them".
 */
function styleScore(generated, profile) {
  if (!generated) return 0;

  // Length closeness (1 when equal, decaying with the absolute word-count gap).
  const genLen = wordCount(generated);
  const target = profile.averageWordCount || genLen || 1;
  const lenScore = 1 - Math.min(1, Math.abs(genLen - target) / Math.max(target, 4));

  // Emoji habit match (does the generated reply's emoji presence match theirs?).
  const genHasEmoji = EMOJI_RE.test(generated);
  const theyUseEmoji = (profile.emojiUsagePercent || 0) >= 50;
  const emojiScore = genHasEmoji === theyUseEmoji ? 1 : 0;

  // Capitalisation habit match.
  const firstChar = generated.trim()[0] || "";
  const genLower = firstChar === firstChar.toLowerCase();
  const theyLower = profile.capitalizationStyle === "lowercase";
  const capScore = genLower === theyLower ? 1 : 0;

  return 0.5 * lenScore + 0.25 * emojiScore + 0.25 * capScore;
}

/** Shuffle-free deterministic split so runs are comparable. */
function split(pairs) {
  const testCount = Math.max(1, Math.round(pairs.length * TEST_FRACTION));
  return { train: pairs.slice(0, pairs.length - testCount), test: pairs.slice(pairs.length - testCount) };
}

async function scoreReply(generated, realReply, profile) {
  const [gVec, rVec] = await Promise.all([embedText(generated), embedText(realReply)]);
  const semantic = gVec && rVec ? Math.max(0, cosineSimilarity(gVec, rVec)) : null;
  const style = styleScore(generated, profile);
  return { semantic, style };
}

async function runCondition(label, train, test, profile) {
  const rows = [];
  for (const item of test) {
    let generated = "";
    try {
      generated = await generateReply({
        incomingMessage: item.incoming,
        styleProfile: profile,
        samplePairs: train,
      });
    } catch (e) {
      generated = "";
    }
    const scores = await scoreReply(generated, item.reply, profile);
    rows.push({ incoming: item.incoming, real: item.reply, generated, ...scores });
  }

  const sem = rows.map((r) => r.semantic).filter((x) => x != null);
  const avgSemantic = sem.length ? sem.reduce((a, b) => a + b, 0) / sem.length : null;
  const avgStyle = rows.reduce((a, r) => a + r.style, 0) / rows.length;

  console.log(`\n=== Condition: ${label} ===`);
  for (const r of rows) {
    const semStr = r.semantic == null ? " n/a " : r.semantic.toFixed(3);
    console.log(
      `  [sem ${semStr} | style ${r.style.toFixed(3)}]  "${r.incoming}"\n` +
        `      real: ${r.real}\n      gen : ${r.generated || "(empty)"}`
    );
  }
  console.log(
    `  ---\n  AVG semantic: ${avgSemantic == null ? "n/a" : avgSemantic.toFixed(3)} | AVG style: ${avgStyle.toFixed(3)}`
  );
  return { avgSemantic, avgStyle };
}

async function main() {
  console.log("EchoMind style-cloning benchmark\n--------------------------------");

  const semanticLive = await embeddingsAvailable();
  console.log(
    semanticLive
      ? "Embed model reachable — running full semantic vs lexical comparison."
      : "Embed model NOT reachable — semantic metrics will be n/a and retrieval " +
          "falls back to lexical. Pull it with:  ollama pull nomic-embed-text"
  );

  const { train, test } = split(SAMPLE_PAIRS);
  const profile = buildStyleProfile(train);
  console.log(`\nTrain pairs: ${train.length} | Test pairs: ${test.length}`);
  console.log("Style profile under test:", JSON.stringify(profile));

  // Condition A: whatever the config currently is (semantic if the model is up).
  const withSemantic = await runCondition("semantic retrieval (current config)", train, test, profile);

  // Condition B: force lexical-only by stripping semantic ability for the run.
  // We simulate "no embeddings" by pointing the embed model at a bogus name so
  // embedText returns null and the retriever degrades to keyword overlap.
  const original = process.env.OLLAMA_EMBED_MODEL;
  process.env.OLLAMA_EMBED_MODEL = "__none__";
  // NOTE: config caches at require-time, so this env flip only affects fresh
  // requires. For a clean A/B, run this script once as-is (semantic) and once
  // with OLLAMA_EMBED_MODEL=__none__ to force lexical. We still print the header.
  console.log(
    "\n(For a strict lexical baseline, re-run with:  OLLAMA_EMBED_MODEL=__none__ node backend/ai/eval/evalStyle.js )"
  );
  process.env.OLLAMA_EMBED_MODEL = original;

  console.log("\n================ SUMMARY ================");
  console.log(
    `Semantic-config  ->  semantic ${withSemantic.avgSemantic == null ? "n/a" : withSemantic.avgSemantic.toFixed(3)}` +
      ` | style ${withSemantic.avgStyle.toFixed(3)}`
  );
  console.log("Compare this against a lexical-only run and against a competitor's outputs.");
}

if (require.main === module) {
  main().catch((e) => {
    console.error("Eval failed:", e);
    process.exit(1);
  });
}

module.exports = { styleScore, split, scoreReply };
