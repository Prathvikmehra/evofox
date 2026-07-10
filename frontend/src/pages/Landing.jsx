import { Link } from "react-router-dom";

const steps = [
  { num: "01", step: "Preserve", detail: "Export your chat history, privately and without signup walls." },
  { num: "02", step: "Clean & Reflect", detail: "Real exchanges are organized into meaningful memory pairs." },
  { num: "03", step: "Understand Style", detail: "Learn your pacing, unique phrases, and emotional tone." },
  { num: "04", step: "Talk & Grow", detail: "Interact with a grounded, authentic version of yourself." },
];

export default function Landing() {
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary)] mb-6 drop-shadow-sm">
          A space for your memories and growth
        </p>
        <h1 className="echo-title text-5xl md:text-7xl text-[var(--foreground)] tracking-tight mb-8">
          Your second mind.
        </h1>
        <p className="max-w-2xl mx-auto text-[var(--foreground-muted)] text-base md:text-lg leading-relaxed font-sans">
          Today's AI is built to know everything about the world. EchoMind is built to understand you —
          learning your unique way of speaking, your experiences, and your thoughts from your chat exports, 
          so you can revisit, reflect, and talk to your past self.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            to="/upload"
            className="echo-btn-primary px-8 py-4 text-sm font-semibold inline-block"
          >
            Create your clone
          </Link>
          <span className="font-heading text-xs text-[var(--foreground-muted)] flex items-center gap-2 px-4 py-2.5 rounded-[20px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_6px_var(--primary)]" />
            .txt export in, live clone out
          </span>
        </div>
      </section>

      {/* Steps Widget Grid */}
      <section className="py-20 border-t border-[var(--card-border)] bg-[var(--background-subtle)]/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="echo-title text-3xl md:text-4xl text-[var(--foreground)] text-center mb-16">
            A quiet, personal workflow
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((p) => (
              <div key={p.step} className="echo-card p-8 bg-[var(--surface)] flex flex-col justify-between min-h-[220px] hover:translate-y-[-4px] transition-all duration-300">
                <div>
                  <div className="font-heading text-xs font-bold text-[var(--primary)] mb-4 uppercase tracking-wider">
                    {p.num}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-[var(--foreground)] mb-3">{p.step}</h3>
                </div>
                <p className="text-[13px] text-[var(--foreground-muted)] leading-relaxed font-sans">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sourced Section */}
      <section className="py-20 border-t border-[var(--card-border)]">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="echo-title text-3xl md:text-4xl text-[var(--foreground)] mb-6">
              Grounded in real memory.
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed text-sm md:text-base font-sans">
              Unlike generic chatbots that guess your responses, your clone generates replies 
              grounded directly in your real communication history. Every message is backed 
              by memories you actually made.
            </p>
          </div>
          {/* WhatsApp / Airbnb style mockup */}
          <div className="echo-card p-6 md:p-8 bg-[var(--surface)] w-full max-w-sm mx-auto">
            <div className="flex gap-3 mb-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[var(--background-subtle)] text-[var(--foreground-muted)] flex items-center justify-center font-bold font-heading text-xs shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02)] border border-[var(--card-border)]">
                T
              </div>
              <div className="bg-[var(--card-bg)] p-3 rounded-2xl rounded-tl-none text-xs text-[var(--foreground)] border border-[var(--card-border)] shadow-sm max-w-[80%] font-sans">
                are we still on for saturday?
              </div>
            </div>
            <div className="flex gap-3 justify-end mb-4 items-start">
              <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-[var(--primary-fg)] p-3 rounded-2xl rounded-tr-none text-xs font-medium shadow-[0_4px_12px_rgba(37,211,102,0.15)] max-w-[80%] font-sans">
                yeah bro all good, 6pm?
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--card-border)] flex items-center justify-between text-[11px] text-[var(--foreground-muted)] font-heading">
              <span>78% grounded match</span>
              <span className="text-[var(--primary)] font-bold">3 past replies found</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
