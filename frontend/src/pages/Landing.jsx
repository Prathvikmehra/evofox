import { Link } from "react-router-dom";

const pipeline = [
  { step: "Upload", detail: "Export your WhatsApp chat, no signup wall" },
  { step: "Clean & chunk", detail: "Real exchanges become learnable pairs" },
  { step: "Learn your style", detail: "Tone, pacing, phrases — not just words" },
  { step: "Talk to yourself", detail: "Chat with a version of you, grounded in real proof" },
];

export default function Landing() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-echo/80 mb-6">
          personal ai operating system
        </p>
        <h1
          className="echo-text font-heading text-6xl md:text-7xl leading-[1.05] text-parchment max-w-3xl"
          data-echo="Your Second Mind."
        >
          Your Second Mind.
        </h1>
        <p className="mt-8 max-w-xl text-parchment/70 text-lg leading-relaxed">
          Today's AI knows everything about the world. EchoMind learns you —
          your tone, your timing, the phrases only you use — from your own
          WhatsApp history, and lets you talk to it.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            to="/upload"
            className="bg-echo text-ink-950 font-text font-semibold px-6 py-3 rounded-md hover:bg-echo-bright transition-colors"
          >
            Create your clone
          </Link>
          <span className="font-mono text-xs text-parchment/40">
            <span className="inline-block w-2 h-2 rounded-full bg-echo pulse-dot mr-2" />
            .txt export in, live clone out
          </span>
        </div>
      </section>

      <section className="border-t border-ink-700/60">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-heading text-3xl text-parchment mb-10">
            Not a chatbot. A pipeline.
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {pipeline.map((p, i) => (
              <div key={p.step} className="border border-ink-700 rounded-lg p-5 bg-ink-900/60">
                <div className="font-mono text-xs text-signal mb-3">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-text font-semibold text-parchment mb-2">{p.step}</h3>
                <p className="text-sm text-parchment/60 leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-700/60">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="font-heading text-3xl text-parchment mb-4">Every reply, sourced.</h2>
            <p className="text-parchment/70 leading-relaxed">
              Every clone reply is grounded in real exchanges from your own
              history and comes with a confidence score — how much actual
              precedent backed that reply, not a made-up guess.
            </p>
          </div>
          <div className="border border-ink-700 rounded-lg p-6 bg-ink-900/60 font-mono text-sm">
            <div className="text-parchment/50 mb-2">them: "are we still on for saturday?"</div>
            <div className="text-echo mb-3">you: "yeah bro all good, 6pm?"</div>
            <div className="text-xs text-signal">78% grounded · 3 similar past replies found</div>
          </div>
        </div>
      </section>
    </div>
  );
}
