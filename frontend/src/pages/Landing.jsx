import { Link } from "react-router-dom";

const pipeline = [
  { step: "Upload", detail: "Export your WhatsApp chat, no signup wall" },
  { step: "Clean & chunk", detail: "Real exchanges become learnable pairs" },
  { step: "Learn your style", detail: "Tone, pacing, phrases — not just words" },
  { step: "Talk to yourself", detail: "Chat with a version of you, grounded in real proof" },
];

export default function Landing() {
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--primary)] mb-6 drop-shadow-[0_0_6px_rgba(80,227,194,0.2)]">
          personal ai operating system
        </p>
        <h1
          className="echo-text font-heading text-6xl md:text-7xl leading-[1.05] text-[var(--foreground)] max-w-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          data-echo="Your Second Mind."
        >
          Your Second Mind.
        </h1>
        <p className="mt-8 max-w-xl text-[var(--foreground-muted)] text-lg leading-relaxed">
          Today's AI knows everything about the world. EchoMind learns you —
          your tone, your timing, the phrases only you use — from your own
          WhatsApp history, and lets you talk to it.
        </p>
        <div className="mt-10 flex items-center gap-6 flex-wrap">
          <Link
            to="/upload"
            className="skeu-btn-accent font-text text-sm font-semibold px-8 py-3.5"
          >
            Create your clone
          </Link>
          <span className="font-mono text-xs text-[var(--foreground-muted)] flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--background-subtle)] border border-[var(--input-border)] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_6px_var(--primary)]" />
            .txt export in, live clone out
          </span>
        </div>
      </section>

      {/* Pipeline Section */}
      <section className="border-t border-[var(--input-border)] bg-[var(--background-subtle)]/40 py-16 shadow-[inset_0_10px_20px_-10px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_10px_20px_-10px_rgba(0,0,0,0.3)]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-heading text-4xl text-[var(--foreground)] mb-12 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            Not a chatbot. A pipeline.
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {pipeline.map((p, i) => (
              <div key={p.step} className="skeu-raised p-6 flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="font-mono text-xs text-[var(--gold)] font-bold mb-4 drop-shadow-[0_0_2px_rgba(245,166,35,0.2)]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-text font-semibold text-[var(--foreground)] mb-2">{p.step}</h3>
                </div>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sourced Section */}
      <section className="border-t border-[var(--input-border)] py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading text-4xl text-[var(--foreground)] mb-6 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              Every reply, sourced.
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed text-base">
              Every clone reply is grounded in real exchanges from your own
              history and comes with a confidence score — how much actual
              precedent backed that reply, not a made-up guess.
            </p>
          </div>
          {/* CRT display screen mockup */}
          <div className="skeu-display-panel p-6 font-mono text-sm text-[var(--primary-light)]">
            <div className="text-slate-400 mb-2 drop-shadow-[0_0_2px_rgba(148,163,184,0.3)]">them: "are we still on for saturday?"</div>
            <div className="text-[var(--primary)] mb-3 font-semibold drop-shadow-[0_0_5px_var(--primary)]">you: "yeah bro all good, 6pm?"</div>
            <div className="text-xs text-[var(--gold)] drop-shadow-[0_0_3px_var(--gold)] flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_8px_var(--primary)]" />
              78% grounded · 3 similar past replies found
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
