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
              <span className="font-heading text-xs text-[var(--foreground-muted)] flex items-center gap-2 px-4 py-2.5 rounded-[20px] bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shadow-[0_0_6px_var(--primary)]" />
                .txt export in, live clone out
              </span>
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
    </div>
  );
}
