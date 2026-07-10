import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite', marginRight: '8px' }}>
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default function Upload() {
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!rawText.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      // Mock delay — replace with real fetch when backend is ready
      await new Promise(r => setTimeout(r, 1500));
      const mockData = {
        messages: [{ text: rawText, sender: 'Alex' }],
        senders: ['Alex', 'Jordan', 'Sam'],
      };
      navigate('/select-sender', { state: { messages: mockData.messages, senders: mockData.senders, rawText } });
    } catch (err) {
      setError(err.message || 'Network error. Make sure the backend is running on port 3000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 w-full flex flex-col justify-center">
      {/* Heading */}
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
        Step 1 of 3
      </p>
      <h1 className="echo-title text-4xl md:text-5xl text-[var(--foreground)] mb-4">
        Paste your chat history
      </h1>
      <p className="text-[13px] md:text-sm text-[var(--foreground-muted)] leading-relaxed mb-8 font-sans">
        Export a WhatsApp chat (without media) and paste the raw text below to let EchoMind begin learning your unique style.
        <br />
        <span className="inline-block mt-3 px-3.5 py-2 rounded-[20px] bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-heading">
          Settings → Chats → Export Chat → Without Media
        </span>
      </p>

      {/* Tactile Card Panel */}
      <div className="echo-card p-6 md:p-8 bg-[var(--surface)]">
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={"12/07/2025, 9:14 PM - Alex: hey are we still on for tomorrow?\n12/07/2025, 9:15 PM - You: yeah, 8pm at the usual spot!"}
          className="w-full h-64 p-5 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] focus:border-[var(--primary)]/30 focus:outline-none transition-all duration-300 resize-none font-sans text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)]/50"
        />

        {/* Error */}
        {error && (
          <div className="flex gap-3 items-start mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[13px] font-sans">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!rawText.trim() || isLoading}
            className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-[20px] transition-all duration-300 ${
              !rawText.trim() || isLoading
                ? "bg-[var(--card-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)] cursor-not-allowed opacity-60"
                : "echo-btn-primary"
            }`}
          >
            {isLoading && <Spinner />}
            {isLoading ? 'Reading Chat...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
