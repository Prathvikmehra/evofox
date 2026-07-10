import React from 'react';

export default function PersonalityCard({ profile, targetSender }) {
  if (!profile) return null;

  return (
    <div className="echo-card p-6 bg-[var(--surface)]">
      {/* Header */}
      <div className="mb-6">
        <p className="font-heading text-[10px] font-bold tracking-widest uppercase text-[var(--primary)] mb-1">
          Style Profile
        </p>
        <h3 className="echo-title text-xl text-[var(--foreground)]">
          {targetSender}
        </h3>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-5">
        {/* Avg word count */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
          <p className="text-[10px] uppercase font-heading tracking-wider text-[var(--foreground-muted)] mb-1">
            Avg reply length
          </p>
          <p className="text-base font-bold text-[var(--foreground)] font-heading">
            {profile.averageWordCount ?? 0} <span className="font-normal text-xs text-[var(--foreground-muted)] font-sans">words</span>
          </p>
        </div>

        {/* Emojis */}
        <div>
          <p className="text-[11px] font-semibold text-[var(--foreground-muted)] mb-2 font-heading">
            Top emojis <span className="text-[var(--primary)] font-bold">({profile.emojiUsagePercent ?? 0}%)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {profile.topEmojis?.length > 0 ? profile.topEmojis.map((e, i) => (
              <span key={i} className="text-lg w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--card-bg)] border border-[var(--card-border)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-default select-none shadow-sm">
                {e}
              </span>
            )) : (
              <span className="text-xs text-[var(--foreground-muted)] italic font-sans">None detected</span>
            )}
          </div>
        </div>

        {/* Common phrases */}
        <div>
          <p className="text-[11px] font-semibold text-[var(--foreground-muted)] mb-2 font-heading">
            Common phrases
          </p>
          <div className="flex gap-2 flex-wrap">
            {profile.commonPhrases?.length > 0 ? profile.commonPhrases.map((p, i) => (
              <span key={i} className="font-heading text-xs text-[var(--foreground)] px-3 py-1.5 rounded-xl bg-[var(--background-subtle)] border border-[var(--card-border)] shadow-sm">
                "{p}"
              </span>
            )) : (
              <span className="text-xs text-[var(--foreground-muted)] italic font-sans">None detected</span>
            )}
          </div>
        </div>

        {/* Style tags */}
        <div className="flex gap-2 pt-4 border-t border-[var(--card-border)]">
          <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[var(--foreground-muted)] px-3 py-1 rounded-[20px] bg-[var(--card-bg)] border border-[var(--card-border)]">
            {profile.capitalizationStyle}
          </span>
          <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[var(--foreground-muted)] px-3 py-1 rounded-[20px] bg-[var(--card-bg)] border border-[var(--card-border)]">
            {profile.punctuationStyle} punct
          </span>
        </div>
      </div>
    </div>
  );
}
