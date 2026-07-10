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
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-[70%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
        isOwn 
          ? 'bg-[var(--primary)] text-[var(--primary-fg)] font-medium rounded-br-sm shadow-[2px_2px_6px_rgba(0,0,0,0.15),inset_1px_1px_0px_rgba(255,255,255,0.2)]' 
          : 'skeu-inset rounded-bl-sm text-[var(--foreground)] border border-black/5 dark:border-white/5'
      }`}>
        <p className="whitespace-pre-wrap">{msg.text}</p>
        {msg.timestamp && (
          <p className={`text-[10px] mt-1 ${
            isOwn ? 'text-[var(--primary-fg)]/70 text-right' : 'text-[var(--foreground-muted)] text-right'
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
    <div className="flex h-[calc(100vh-64px)] max-w-6xl mx-auto w-full p-6 gap-6">
      {/* ── Sidebar ── */}
      <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto pr-1">
        <PersonalityCard profile={styleProfile} targetSender={targetSender} />

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm shadow-[inset_1px_1px_3px_rgba(239,68,68,0.1)] leading-relaxed">
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 flex flex-col skeu-raised overflow-hidden min-w-0 bg-[var(--card-bg)]">
        {/* Chat header */}
        <div className="px-5 h-14 border-b border-[var(--input-border)] flex items-center gap-3 shrink-0 shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]">
          <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-[var(--primary)] text-[var(--primary-fg)] font-bold text-sm shadow-[inset_1px_1px_0px_rgba(255,255,255,0.2)]">
            {targetSender.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-heading text-base font-bold text-[var(--foreground)] leading-none mb-1">{targetSender} (Clone)</p>
            <p className={`text-[10px] ${isTyping ? 'text-[var(--primary)] font-bold animate-pulse' : 'text-[var(--foreground-muted)]'}`}>
              {isTyping ? 'typing...' : 'powered by local LLM'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 bg-[var(--background-subtle)] shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_4px_10px_rgba(0,0,0,0.25)]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--foreground-muted)] text-center gap-3">
              <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">💬</span>
              <p className="text-sm font-semibold text-[var(--foreground)]">Start talking to your clone</p>
              <p className="text-xs max-w-xs opacity-75">Replies are generated based on the learned style profile.</p>
            </div>
          ) : (
            messages.map((msg, i) => <MessageBubble key={i} msg={msg} isOwn={msg.isOwn} />)
          )}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="px-4 py-2.5 rounded-xl skeu-inset border border-black/5 dark:border-white/5">
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-[var(--input-border)] flex gap-3 shrink-0 bg-[var(--card-bg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Message ${targetSender}...`}
            disabled={isTyping}
            className="flex-1 px-4 py-3 rounded-xl skeu-input font-text text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              !input.trim() || isTyping
                ? "bg-[var(--background-subtle)] text-[var(--foreground-muted)] skeu-inset opacity-50 cursor-not-allowed pointer-events-none"
                : "skeu-btn-accent text-[var(--primary-fg)] font-bold shadow-[0_4px_12px_-2px_rgba(80,227,194,0.3)]"
            }`}
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
