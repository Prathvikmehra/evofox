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
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3 drop-shadow-[0_0_4px_rgba(80,227,194,0.15)]">
        Step 1 of 3
      </p>
      <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-3 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        Paste Your Chat History
      </h1>
      <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-8">
        Export a WhatsApp chat (without media) and paste the raw text below.
        <br />
        <span className="font-mono text-[11px] opacity-75 inline-block mt-2 px-2.5 py-1 rounded bg-[var(--background-subtle)] border border-[var(--input-border)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]">
          Settings → Chats → Export Chat → Without Media
        </span>
      </p>

      {/* Tactile Card Panel */}
      <div className="skeu-raised p-6 md:p-8 bg-[var(--card-bg)]">
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={"12/07/2025, 9:14 PM - Alex: hey are we still on for tomorrow?\n12/07/2025, 9:15 PM - You: yeah, 8pm at the usual spot!"}
          className="w-full h-64 p-4 font-mono text-[13px] leading-relaxed rounded-xl skeu-input resize-none"
        />

        {/* Error */}
        {error && (
          <div className="flex gap-3 items-start mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm shadow-[inset_1px_1px_3px_rgba(239,68,68,0.1)]">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Tactile Action Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!rawText.trim() || isLoading}
            className={`inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl transition-all ${
              !rawText.trim() || isLoading
                ? "bg-[var(--background-subtle)] text-[var(--foreground-muted)] skeu-inset cursor-not-allowed pointer-events-none opacity-60"
                : "skeu-btn-accent text-[var(--primary-fg)] font-bold shadow-[0_4px_12px_-2px_rgba(80,227,194,0.3)]"
            }`}
          >
            {isLoading && <Spinner />}
            {isLoading ? 'Analyzing...' : 'Analyze Chat →'}
          </button>
        </div>
      </div>
    </div>
  );
}
