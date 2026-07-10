import React from 'react';

export default function MessageBubble({ message, isOwn, isTyping = false }) {
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div 
        className={`max-w-[70%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
          isOwn 
            ? 'bg-[var(--primary)] text-[var(--primary-fg)] font-medium rounded-br-sm shadow-[2px_2px_6px_rgba(0,0,0,0.15),inset_1px_1px_0px_rgba(255,255,255,0.2)]' 
            : 'skeu-inset rounded-bl-sm text-[var(--foreground)] border border-black/5 dark:border-white/5'
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
