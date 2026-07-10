import React from 'react';

export default function MessageBubble({ message, isOwn, isTyping = false }) {
  return (
    <div className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[75%] px-4 py-2 rounded-2xl ${
          isOwn 
            ? 'bg-primary text-primary-foreground rounded-br-sm' 
            : 'bg-muted/50 border shadow-sm rounded-bl-sm'
        }`}
      >
        {isTyping ? (
          <div className="flex items-center gap-1.5 h-6">
            <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
        )}
        
        {!isTyping && message.timestamp && (
          <div className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground'}`}>
            {message.timestamp}
          </div>
        )}
      </div>
    </div>
  );
}
