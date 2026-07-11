import { Link } from "react-router-dom";
import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

const steps = [
  { num: "01", step: "Preserve", detail: "Export your chat history, privately and without signup walls." },
  { num: "02", step: "Clean & Reflect", detail: "Real exchanges are organized into meaningful memory pairs." },
  { num: "03", step: "Understand Style", detail: "Learn your pacing, unique phrases, and emotional tone." },
  { num: "04", step: "Talk & Grow", detail: "Interact with a grounded, authentic version of yourself." },
];

function SplineLoader() {
  return (
    <div className="w-full h-full min-h-[340px] rounded-3xl bg-[var(--background-subtle)] animate-pulse"
      style={{ background: "linear-gradient(120deg, var(--background-subtle) 40%, var(--card-bg) 60%, var(--background-subtle) 80%)", backgroundSize: "200% 100%", animation: "shimmer 1.8s infinite" }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="pb-24 animate-page-entry">
      {/* Hero Section — two-column on md+ */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">

          {/* ── Left: Text + CTA ── */}
          <div className="flex-1 text-center md:text-left">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary-text)] mb-6 drop-shadow-sm">
              A space for your memories and growth
            </p>
            <h1 className="echo-title text-5xl md:text-6xl lg:text-7xl text-[var(--foreground)] tracking-tight mb-8 leading-[1.1]">
              Your second<br />mind.
            </h1>
            <p className="max-w-xl text-[var(--foreground-muted)] text-base md:text-lg leading-relaxed font-sans mb-12">
              Today's AI is built to know everything about the world. EchoMind is built to understand <em>you</em> —
              learning your unique way of speaking, your experiences, and your thoughts from your chat exports,
              so you can revisit, reflect, and talk to your past self.
            </p>
            <div className="flex flex-wrap items-center md:items-start justify-center md:justify-start gap-4">
              <Link
                id="landing-get-started-btn"
                to="/signup"
                className="px-8 py-4 rounded-xl font-heading font-semibold text-sm transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  color: "var(--primary-fg)",
                  boxShadow: "0 4px 20px rgba(37,211,102,0.30)",
                }}
              >
                Get Started
              </Link>
              <Link
                to="/upload"
                className="px-8 py-4 rounded-xl font-heading font-semibold text-sm transition-all hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                  color: "var(--primary-fg)",
                  boxShadow: "0 4px 20px rgba(37,211,102,0.30)",
                }}
              >
                Create your clone
              </Link>
            </div>

          </div>

          {/* ── Right: Spline 3D Scene ── */}
          <div className="flex-1 w-full relative" style={{ minHeight: "420px" }}>
            {/* Soft glow behind the scene */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,211,102,0.08) 0%, transparent 70%)" }} />
            <Suspense fallback={<SplineLoader />}>
              <Spline
                scene="https://prod.spline.design/94l2XcO1QN64HL7q/scene.splinecode"
                style={{ width: "100%", height: "420px", borderRadius: "24px" }}
              />
            </Suspense>
          </div>

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
              <div key={p.step} className="echo-card echo-card-interactive p-8 bg-[var(--surface)] flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="font-heading text-xs font-bold text-[var(--primary-text)] mb-4 uppercase tracking-wider">
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
              <span className="text-[var(--primary-text)] font-bold">3 past replies found</span>
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-24 border-t border-[var(--card-border)] bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="echo-title text-3xl md:text-5xl text-[var(--foreground)] mb-6">Built for authenticity.</h2>
            <p className="text-[var(--foreground-muted)] text-base md:text-lg max-w-2xl mx-auto font-sans leading-relaxed">
              EchoMind doesn't just parrot words back to you. It creates a deep statistical profile of your communication habits to generate replies that feel genuinely yours.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="echo-card p-8 bg-[var(--surface)] hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] flex items-center justify-center mb-6 text-[var(--primary)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-[var(--foreground)] mb-3">Tone Matching</h3>
              <p className="text-[14px] text-[var(--foreground-muted)] font-sans leading-relaxed">
                Whether you use full punctuation, all lowercase, or excessive emojis, EchoMind mathematically maps your exact stylistic quirks.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="echo-card p-8 bg-[var(--surface)] hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] flex items-center justify-center mb-6 text-[var(--primary)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-[var(--foreground)] mb-3">Local Privacy</h3>
              <p className="text-[14px] text-[var(--foreground-muted)] font-sans leading-relaxed">
                Powered by a local Llama 3.2 model. Your deeply personal chat logs are processed securely and never used to train global AI models.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="echo-card p-8 bg-[var(--surface)] hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] flex items-center justify-center mb-6 text-[var(--primary)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-[var(--foreground)] mb-3">Lightning Fast</h3>
              <p className="text-[14px] text-[var(--foreground-muted)] font-sans leading-relaxed">
                Using highly optimized local inference and smart memory retrieval, EchoMind responds to you in milliseconds, exactly like a real chat app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="py-24 border-t border-[var(--card-border)] bg-[var(--background-subtle)]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/10 to-transparent rounded-3xl blur-3xl"></div>
            <div className="echo-card bg-[var(--surface)] border border-[var(--card-border)] rounded-3xl p-8 relative overflow-hidden">
              {/* Fake Terminal / Code window */}
              <div className="flex gap-2 mb-6 border-b border-[var(--card-border)] pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <pre className="font-mono text-[11px] md:text-[13px] text-[var(--foreground-muted)] overflow-x-auto">
                <code>
<span className="text-[var(--primary)]">const</span> cloneProfile = {'{\n'}
{'  '}name: <span className="text-blue-400">"Alex"</span>,\n
{'  '}style: {'{\n'}
{'    '}avgWords: <span className="text-orange-400">5.2</span>,\n
{'    '}capitalization: <span className="text-blue-400">"all_lowercase"</span>,\n
{'    '}punctuation: <span className="text-blue-400">"minimal"</span>,\n
{'    '}emojiUsage: <span className="text-orange-400">12%</span>,\n
{'    '}topPhrases: [<span className="text-blue-400">"bro"</span>, <span className="text-blue-400">"lmao"</span>, <span className="text-blue-400">"fr"</span>]\n
{'  }\n}'}
                </code>
              </pre>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)] mb-4">Under the hood</p>
            <h2 className="echo-title text-3xl md:text-4xl text-[var(--foreground)] mb-6">
              More than just a prompt.
            </h2>
            <p className="text-[var(--foreground-muted)] leading-relaxed text-base font-sans mb-6">
              EchoMind uses a specialized two-step architecture. First, it acts as a data scientist—cleaning, analyzing, and structuring your raw WhatsApp exports to build a mathematical style profile.
            </p>
            <p className="text-[var(--foreground-muted)] leading-relaxed text-base font-sans">
              Then, using Retrieval-Augmented Generation (RAG), it searches through your history to find exactly how you handled similar conversational contexts in the past, feeding this strictly into a tuned LLM prompt. The result? A clone that actually sounds like you.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="py-32 border-t border-[var(--card-border)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--primary)]/5"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="echo-title text-4xl md:text-6xl text-[var(--foreground)] mb-8">
            Ready to meet yourself?
          </h2>
          <p className="text-[var(--foreground-muted)] text-lg md:text-xl font-sans mb-12 max-w-2xl mx-auto">
            Upload your first chat export in seconds and start conversing with your digital twin today. It's completely free to try.
          </p>
          <Link
            to="/upload"
            className="inline-block px-10 py-5 rounded-2xl font-heading font-bold text-base transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              color: "var(--primary-fg)",
              boxShadow: "0 8px 30px rgba(37,211,102,0.35)",
            }}
          >
            Create Your Clone Now
          </Link>
        </div>
      </section>
    </div>
  );
}
