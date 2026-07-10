import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  );
}

function ChevronIcon({ className }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

const techStack = [
  { name: "React 19 + Vite", role: "Core UI Framework", desc: "For ultra-fast client-side hot modules replacement and clean responsive flow state management." },
  { name: "Express.js", role: "Server Layer", desc: "A light HTTP interface exposing pure AI logic endpoints without bloating system resources." },
  { name: "Ollama (local)", role: "LLM Inference", desc: "Runs llama3.2:3b locally. Zero cloud roundtrips, zero subscription fees, and complete offline usage." },
  { name: "Plain JS Retriever", role: "Keyword Overlap Matcher", desc: "Retrieves context-rich message pairs instantly without requiring heavyweight vector databases or embeddings." },
];

const features = [
  { title: "WhatsApp Export Parsing", desc: "Intelligently parses standard WhatsApp chat formats, supporting 12h/24h clocks, multi-line continuations, and automated system message filtering." },
  { title: "Voice & Style Profiling", desc: "Extracts communication metrics: emoji frequencies, average reply length, phrase preferences, capitalization rules, and punctuation patterns." },
  { title: "Local & Private Architecture", desc: "Runs completely offline. No tracking cookies, no server logins, and no training data leaks. Your personal conversations stay private." },
];

const faqs = [
  { q: "Does any data leave my computer?", a: "No. EchoMind is 100% local. The WhatsApp text you upload is parsed in your browser and sent to your locally running backend, which communicates only with your local Ollama instance." },
  { q: "What LLM model does it use by default?", a: "It uses llama3.2:3b. We found this size to balance processing speed, text layout consistency, and stylistic mimicking capabilities perfectly on consumer laptops." },
  { q: "Why is there no database?", a: "By storing data strictly in-memory during active sessions, we guarantee that your conversations are never persisted, eliminating data leakage risks entirely." },
];

export default function About() {
  const [expandedIdx, setExpandedIdx] = useState(null);

  return (
    <div className="pb-24 animate-page-entry">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary-text)] mb-6 drop-shadow-sm">
          Behind the technology
        </p>
        <h1 className="echo-title text-5xl md:text-6xl text-[var(--foreground)] tracking-tight mb-8">
          Private, Local-First,<br />Intelligent.
        </h1>
        <p className="max-w-2xl mx-auto text-[var(--foreground-muted)] text-base md:text-lg leading-relaxed font-sans">
          EchoMind is a specialized AI text-cloning application designed to let you archive, analyze, and converse with your own conversational style—without sacrificing your privacy.
        </p>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 border-t border-[var(--card-border)] bg-[var(--background-subtle)]/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="echo-title text-3xl text-[var(--foreground)] mb-6">
                Our Vision
              </h2>
              <blockquote className="border-l-4 border-[var(--primary)] pl-4 my-4 italic text-[var(--foreground-muted)] text-sm leading-relaxed font-sans">
                "Everyone texts a little differently — the slang, the emoji habits, the message length, the punctuation. EchoMind turns a real chat export into a working style profile, and lets a local LLM reply the way that person actually would — with nothing ever leaving your machine."
              </blockquote>
              <p className="text-[var(--foreground-muted)] leading-relaxed text-sm font-sans mt-6">
                Most AI technologies rely on cloud infrastructures that catalog every conversation you have. EchoMind offers a different paradigm: software that knows you deeply, yet respects your boundary by operating entirely offline.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="echo-card p-6 bg-[var(--surface)] flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary-text)]">
                  <ShieldIcon />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-[var(--foreground)] mb-1">100% Private</h3>
                  <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">No tracking, no external server storage. Your chats stay on your local disk.</p>
                </div>
              </div>

              <div className="echo-card p-6 bg-[var(--surface)] flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary-text)]">
                  <CpuIcon />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-[var(--foreground)] mb-1">Local Model Inference</h3>
                  <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">Powered by local Ollama execution using compact, hyper-focused open-source language models.</p>
                </div>
              </div>

              <div className="echo-card p-6 bg-[var(--surface)] flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary-text)]">
                  <DatabaseIcon />
                </div>
                <div>
                  <h3 className="font-heading text-base font-semibold text-[var(--foreground)] mb-1">Zero Database Overhead</h3>
                  <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">Utilizes in-memory transient structures. When you close the tab, the state is cleared.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Tech Stack Section */}
      <section className="py-20 border-t border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="echo-title text-3xl md:text-4xl text-[var(--foreground)] mb-4">
              Modern Local Tech Stack
            </h2>
            <p className="text-sm text-[var(--foreground-muted)] font-sans max-w-xl mx-auto">
              Built on clean open-source components, EchoMind integrates lightweight tools to enable seamless style learning.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech) => (
              <div key={tech.name} className="echo-card p-6 bg-[var(--surface)] flex flex-col justify-between hover:translate-y-[-2px] transition-all duration-300">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-[12px] bg-[var(--primary)]/10 text-[var(--primary-text)] font-heading text-[10px] font-semibold uppercase tracking-wider mb-4">
                    {tech.role}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[var(--foreground)] mb-2">
                    {tech.name}
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] leading-relaxed font-sans">
                    {tech.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Mechanics Section */}
      <section className="py-20 border-t border-[var(--card-border)] bg-[var(--background-subtle)]/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="echo-title text-3xl md:text-4xl text-[var(--foreground)] mb-4">
              System Mechanics
            </h2>
            <p className="text-sm text-[var(--foreground-muted)] font-sans max-w-xl mx-auto">
              How your chat history is transformed into a custom personality clone.
            </p>
          </div>

          <div className="space-y-8">
            {features.map((feat, idx) => (
              <div key={feat.title} className="echo-card p-8 bg-[var(--surface)] flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary-text)] flex items-center justify-center font-heading font-bold text-lg flex-shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-[var(--foreground)] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[var(--foreground-muted)] leading-relaxed font-sans">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-[var(--card-border)] bg-[var(--background-subtle)]/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="echo-title text-3xl text-[var(--foreground)] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[var(--foreground-muted)] font-sans">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedIdx === idx;
              return (
                <div key={faq.q} className="echo-card bg-[var(--surface)] overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="w-full text-left p-6 flex items-center justify-between font-heading text-base font-semibold text-[var(--foreground)] hover:text-[var(--primary-text)] transition-colors duration-250 cursor-pointer focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[var(--primary)] font-bold">?</span>
                      {faq.q}
                    </span>
                    <ChevronIcon className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--primary)]' : 'text-[var(--foreground-muted)]'}`} />
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 pt-0 border-t border-[var(--card-border)]/50">
                      <p className="text-xs text-[var(--foreground-muted)] leading-relaxed font-sans mt-4 pl-3.5">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Bottom Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 text-center">
        <div className="echo-card p-8 md:p-12 bg-gradient-to-br from-[var(--surface)] to-[var(--background-subtle)] border border-[var(--card-border)] rounded-3xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none" />
          
          <h2 className="echo-title text-3xl text-[var(--foreground)] mb-4">
            Ready to build your second mind?
          </h2>
          <p className="text-sm text-[var(--foreground-muted)] font-sans max-w-lg mx-auto mb-8">
            Get started by uploading your chat archive. The setup process is entirely private and takes less than a minute.
          </p>

          <Link
            to="/upload"
            className="echo-btn-primary px-8 py-4 text-sm font-semibold inline-block"
          >
            Start Chat Upload
          </Link>
        </div>
      </section>
    </div>
  );
}
