import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state?.senders) return <Navigate to="/" replace />;

  const { senders, messages } = location.state;
  const [selectedSender, setSelectedSender] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = async (sender) => {
    if (isLoading) return;
    setSelectedSender(sender);
    setIsLoading(true);
    setError(null);

    try {
      // Mock — replace with real fetch
      await new Promise(r => setTimeout(r, 1500));
      const mockData = {
        pairs: [],
        styleProfile: {
          averageWordCount: 8.5,
          emojiUsagePercent: 65,
          topEmojis: ['😂', '🔥', '💯'],
          commonPhrases: ['fr', 'literally', 'no way'],
          capitalizationStyle: 'lowercase',
          punctuationStyle: 'minimal',
        },
      };
      navigate('/chat', { state: { pairs: mockData.pairs, styleProfile: mockData.styleProfile, targetSender: sender } });
    } catch (err) {
      setError(err.message || 'Failed to analyze. Make sure the backend is running.');
      setSelectedSender(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-16 w-full flex flex-col justify-center animate-page-entry">
      {/* Heading */}
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">
        Step 2 of 3
      </p>
      <h1 className="echo-title text-4xl md:text-5xl text-[var(--foreground)] mb-4">
        Who to clone?
      </h1>
      <p className="text-[13px] md:text-sm text-[var(--foreground-muted)] leading-relaxed mb-8 font-sans">
        We found <strong className="text-[var(--foreground)] font-semibold">{senders.length} participants</strong> in this conversation.
        Select whose perspective and writing style you would like to explore.
      </p>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-sans shadow-sm">
          {error}
        </div>
      )}

      {/* Sender list */}
      <div className="flex flex-col gap-4">
        {senders.map((sender, idx) => {
          const isSelected = selectedSender === sender;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(sender)}
              disabled={isLoading}
              className={`flex items-center justify-between w-full p-5 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? "bg-[var(--card-bg)] text-[var(--primary)] border-2 border-[var(--primary)] shadow-[0_8px_24px_rgba(37,211,102,0.1)] scale-[0.99] pointer-events-none"
                  : "bg-[var(--surface)] border border-[var(--card-border)] shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-[var(--foreground)] hover:translate-y-[-1.5px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.03)] cursor-pointer active:translate-y-[0px]"
              } ${isLoading && !isSelected ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? "bg-[var(--primary)] text-[var(--primary-fg)] shadow-[0_0_12px_rgba(37,211,102,0.3)]" 
                    : "bg-[var(--background-subtle)] text-[var(--foreground-muted)] border border-[var(--card-border)]"
                }`}>
                  <UserIcon />
                </div>
                <span className="font-heading text-sm font-semibold text-[var(--foreground)]">
                  {sender}
                </span>
              </div>
              <div className={`${isSelected ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"}`}>
                {isSelected && isLoading ? <Spinner /> : <ChevronIcon />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
