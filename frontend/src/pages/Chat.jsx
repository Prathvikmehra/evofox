import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import PersonalityCard from '../components/personality/PersonalityCard';

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 2px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--foreground-muted)',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({ msg, isOwn }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: '0.75rem',
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '0.625rem 0.875rem',
        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isOwn ? 'var(--primary)' : 'var(--card-bg)',
        color: isOwn ? 'var(--primary-fg)' : 'var(--foreground)',
        border: isOwn ? 'none' : '1px solid var(--card-border)',
        fontSize: '0.9rem',
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
      }}>
        <p>{msg.text}</p>
        {msg.timestamp && (
          <p style={{
            fontSize: '0.65rem',
            marginTop: '4px',
            opacity: 0.6,
            textAlign: 'right',
          }}>{msg.timestamp}</p>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const location = useLocation();
  if (!location.state?.targetSender) return <Navigate to="/" replace />;

  const { pairs, styleProfile, targetSender } = location.state;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = {
      text: input.trim(),
      isOwn: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Mock — replace with real fetch
      await new Promise(r => setTimeout(r, 2000));
      const mockReply = `This is a mock reply from ${targetSender}. fr ${styleProfile?.topEmojis?.[0] ?? '😂'}`;
      setMessages(prev => [...prev, {
        text: mockReply,
        isOwn: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      setError('Clone offline. Make sure backend and Ollama are running.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 64px)',
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      padding: '1.5rem',
      gap: '1.5rem',
    }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflowY: 'auto',
      }}>
        <PersonalityCard profile={styleProfile} targetSender={targetSender} />

        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '10px',
            color: '#ef4444',
            fontSize: '0.82rem',
            lineHeight: 1.5,
          }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── Chat Area ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        {/* Chat header */}
        <div style={{
          padding: '0 1.25rem',
          height: '56px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          flexShrink: 0,
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(80,227,194,0.1)',
            border: '1px solid rgba(80,227,194,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            fontSize: '1rem',
            color: 'var(--primary)',
          }}>
            {targetSender.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: 'var(--foreground)',
              lineHeight: 1.2,
            }}>{targetSender} (Clone)</p>
            <p style={{
              fontSize: '0.72rem',
              color: isTyping ? 'var(--primary)' : 'var(--foreground-muted)',
              transition: 'color 0.2s',
            }}>
              {isTyping ? 'typing...' : 'powered by local LLM'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
        }}>
          {messages.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--foreground-muted)',
              textAlign: 'center',
              gap: '0.5rem',
            }}>
              <p style={{ fontSize: '1.5rem' }}>💬</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Start talking to your clone</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Replies are generated based on the learned style profile.</p>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} msg={msg} isOwn={msg.isOwn} />)
          )}
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
              }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--card-border)',
            display: 'flex',
            gap: '0.75rem',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Message ${targetSender}...`}
            disabled={isTyping}
            style={{
              flex: 1,
              background: 'var(--background)',
              border: '1px solid var(--input-border)',
              borderRadius: '8px',
              padding: '0.65rem 1rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              color: 'var(--foreground)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--input-border)'; }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: !input.trim() || isTyping ? 'var(--card-border)' : 'var(--primary)',
              color: !input.trim() || isTyping ? 'var(--foreground-muted)' : 'var(--primary-fg)',
              border: 'none',
              cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
