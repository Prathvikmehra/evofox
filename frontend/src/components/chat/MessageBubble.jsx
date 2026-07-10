import React from 'react';

export default function MessageBubble({ message, isOwn, isTyping = false }) {
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div 
        className={`max-w-[70%] px-4.5 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans animate-message ${
          isOwn 
            ? 'bg-[var(--primary)] text-[var(--primary-fg)] font-medium rounded-tr-none shadow-[0_4px_12px_rgba(37,211,102,0.12)]' 
            : 'bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-tl-none'
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-1.5 h-6">
            <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
        
        {!isTyping && message.timestamp && (
          <div className={`text-[10px] mt-1 ${isOwn ? 'text-[var(--primary-fg)]/70 text-right' : 'text-[var(--foreground-muted)] text-right'}`}>
            {message.timestamp}
          </div>
        )}
      </div>
    </div>
  );
}
