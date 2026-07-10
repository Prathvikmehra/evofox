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
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] px-4.5 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans animate-message ${
        isOwn 
          ? 'bg-[var(--primary)] text-[var(--primary-fg)] font-medium rounded-tr-none shadow-[0_4px_12px_rgba(37,211,102,0.12)]' 
          : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-tl-none'
      }`}>
        <p className="whitespace-pre-wrap">{msg.text}</p>
        {msg.timestamp && (
          <p className={`text-[9px] mt-1.5 ${
            isOwn ? 'text-[var(--primary-fg)]/60 text-right font-medium' : 'text-[var(--foreground-muted)] text-right font-medium'
          }`}>{msg.timestamp}</p>
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
      // Mock delay
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
    <div className="flex h-[calc(100vh-64px)] max-w-6xl mx-auto w-full p-6 gap-6 animate-page-entry">
      {/* ── Sidebar ── */}
      <div className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        <PersonalityCard profile={styleProfile} targetSender={targetSender} />

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm shadow-sm leading-relaxed font-sans">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 flex flex-col echo-card overflow-hidden min-w-0 bg-[var(--surface)]">
        {/* Chat header */}
        <div className="px-5 h-16 border-b border-[var(--card-border)] flex items-center gap-3 shrink-0 bg-[var(--surface)]">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary)] text-[var(--primary-fg)] font-bold text-sm shadow-sm">
            {targetSender.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-heading text-base font-semibold text-[var(--foreground)] leading-none mb-1">{targetSender} (Clone)</p>
            <p className={`text-[10px] font-medium ${isTyping ? 'text-[var(--primary)] animate-pulse' : 'text-[var(--foreground-muted)]'}`}>
              {isTyping ? 'typing...' : 'grounded in conversation history'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--background-subtle)]/30">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--foreground-muted)] text-center gap-3">
              <span className="text-3xl filter drop-shadow-sm">💬</span>
              <p className="text-sm font-semibold text-[var(--foreground)] font-heading">Start talking to your clone</p>
              <p className="text-xs max-w-xs opacity-75 font-sans">Replies are generated based on the learned style profile.</p>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} msg={msg} isOwn={msg.isOwn} />)
          )}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="px-4.5 py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-tl-none shadow-sm">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-[var(--card-border)] flex gap-3 shrink-0 bg-[var(--surface)] items-center"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Message ${targetSender}...`}
            disabled={isTyping}
            className="flex-1 px-5 py-3.5 rounded-[24px] bg-[var(--background-subtle)] border border-[var(--card-border)] focus:border-[var(--primary)]/30 focus:outline-none transition-all duration-300 font-sans text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)]/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer ${
              !input.trim() || isTyping
                ? "bg-[var(--card-bg)] text-[var(--foreground-muted)] border border-[var(--card-border)] opacity-50 cursor-not-allowed pointer-events-none"
                : "echo-btn-primary"
            }`}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
