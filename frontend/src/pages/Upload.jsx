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
    <div style={{
      maxWidth: '680px',
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
        Step 1 of 3
      </p>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'clamp(2rem, 5vw, 3rem)',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: 'var(--foreground)',
        marginBottom: '0.75rem',
      }}>
        Paste Your Chat History
      </h1>
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--foreground-muted)',
        lineHeight: 1.65,
        marginBottom: '2.5rem',
      }}>
        Export a WhatsApp chat (without media) and paste the raw text below.
        <br />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.7 }}>
          Settings → Chats → Export Chat → Without Media
        </span>
      </p>

      {/* Card */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '1.5rem',
      }}>
        <textarea
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder={"12/07/2025, 9:14 PM - Alex: hey are we still on for tomorrow?\n12/07/2025, 9:15 PM - You: yeah, 8pm at the usual spot!"}
          style={{
            width: '100%',
            height: '260px',
            background: 'transparent',
            border: '1px solid var(--input-border)',
            borderRadius: '8px',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            color: 'var(--foreground)',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; }}
        />

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            marginTop: '1rem',
            padding: '0.875rem 1rem',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            color: '#ef4444',
            fontSize: '0.85rem',
          }}>
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        {/* Button */}
        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleAnalyze}
            disabled={!rawText.trim() || isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: !rawText.trim() || isLoading ? 'var(--card-border)' : 'var(--primary)',
              color: !rawText.trim() || isLoading ? 'var(--foreground-muted)' : 'var(--primary-fg)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: !rawText.trim() || isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, opacity 0.2s',
            }}
          >
            {isLoading && <Spinner />}
            {isLoading ? 'Analyzing...' : 'Analyze Chat →'}
          </button>
        </div>
      </div>
    </div>
  );
}
