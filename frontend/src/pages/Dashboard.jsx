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
    <div className="max-w-xl mx-auto px-6 py-16 w-full flex flex-col justify-center">
      {/* Heading */}
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3 drop-shadow-[0_0_4px_rgba(80,227,194,0.15)]">
        Step 2 of 3
      </p>
      <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-3 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
        Who to clone?
      </h1>
      <p className="text-sm text-[var(--foreground-muted)] leading-relaxed mb-8">
        We found <strong className="text-[var(--foreground)] font-semibold">{senders.length} participants</strong> in this chat.
        Pick whose communication style to learn.
      </p>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm shadow-[inset_1px_1px_3px_rgba(239,68,68,0.1)]">
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
              className={`flex items-center justify-between w-full p-4 md:p-5 rounded-xl transition-all ${
                isSelected
                  ? "bg-[var(--input-bg)] text-[var(--primary)] skeu-inset border border-[var(--border-primary-trans)] scale-[0.99] pointer-events-none"
                  : "skeu-btn-primary hover:text-[var(--foreground)]"
              } ${isLoading && !isSelected ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isSelected 
                    ? "bg-[var(--background)] text-[var(--primary)] shadow-[0_0_8px_var(--primary-glow)]" 
                    : "skeu-inset text-[var(--primary)]"
                }`}>
                  <UserIcon />
                </div>
                <span className="font-text text-sm font-semibold text-[var(--foreground)]">
                  {sender}
                </span>
              </div>
              <div className="text-[var(--foreground-muted)]">
                {isSelected && isLoading ? <Spinner /> : <ChevronIcon />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
