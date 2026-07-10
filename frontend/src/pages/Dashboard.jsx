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
    <div style={{
      maxWidth: '560px',
      margin: '0 auto',
      padding: '4rem 2rem',
      width: '100%',
    }}>
      {/* Heading */}
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--primary)',
        marginBottom: '1rem',
      }}>
        Step 2 of 3
      </p>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: 'var(--foreground)',
        marginBottom: '0.75rem',
      }}>
        Who to clone?
      </h1>
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--foreground-muted)',
        lineHeight: 1.65,
        marginBottom: '2.5rem',
      }}>
        We found <strong style={{ color: 'var(--foreground)' }}>{senders.length} participants</strong> in this chat.
        Pick whose communication style to learn.
      </p>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '0.875rem 1rem',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '0.85rem',
        }}>
          {error}
        </div>
      )}

      {/* Sender list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {senders.map((sender, idx) => {
          const isSelected = selectedSender === sender;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(sender)}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '1rem 1.25rem',
                background: isSelected ? 'var(--card-bg)' : 'var(--card-bg)',
                border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--card-border)'}`,
                borderRadius: '10px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading && !isSelected ? 0.5 : 1,
                transition: 'border-color 0.2s, transform 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--card-border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--background-subtle)',
                  border: '1px solid var(--card-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                }}>
                  <UserIcon />
                </div>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'var(--foreground)',
                }}>
                  {sender}
                </span>
              </div>
              <div style={{ color: 'var(--foreground-muted)' }}>
                {isSelected && isLoading ? <Spinner /> : <ChevronIcon />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
