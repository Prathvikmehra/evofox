import React from 'react';

export default function PersonalityCard({ profile, targetSender }) {
  if (!profile) return null;

  return (
    <div className="skeu-raised p-6 bg-[var(--card-bg)] border border-[var(--card-border)]">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-[9px] font-bold tracking-widest uppercase text-[var(--primary)] mb-1 drop-shadow-[0_0_4px_rgba(80,227,194,0.15)]">
          Style Profile
        </p>
        <h3 className="font-heading text-xl font-bold text-[var(--foreground)] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          {targetSender}
        </h3>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-5">
        {/* Avg word count */}
        <div className="p-3.5 skeu-inset">
          <p className="text-[10px] uppercase font-mono tracking-wider text-[var(--foreground-muted)] mb-1">
            Avg reply length
          </p>
          <p className="text-base font-bold text-[var(--foreground)]">
            {profile.averageWordCount ?? 0} <span className="font-normal text-xs text-[var(--foreground-muted)]">words</span>
          </p>
        </div>

        {/* Emojis */}
        <div>
          <p className="text-[11px] font-medium text-[var(--foreground-muted)] mb-2.5">
            Top emojis <span className="text-[var(--primary)] font-bold">({profile.emojiUsagePercent ?? 0}%)</span>
          </p>
          <div className="flex gap-2 flex-wrap">
            {profile.topEmojis?.length > 0 ? profile.topEmojis.map((e, i) => (
              <span key={i} className="text-lg skeu-raised w-10 h-10 flex items-center justify-center bg-[var(--card-bg)] border border-[var(--card-border)] hover:scale-105 active:scale-95 duration-100 cursor-default select-none">
                {e}
              </span>
            )) : (
              <span className="text-xs text-[var(--foreground-muted)] italic">None detected</span>
            )}
          </div>
        </div>

        {/* Common phrases */}
        <div>
          <p className="text-[11px] font-medium text-[var(--foreground-muted)] mb-2.5">
            Common phrases
          </p>
          <div className="flex gap-2 flex-wrap">
            {profile.commonPhrases?.length > 0 ? profile.commonPhrases.map((p, i) => (
              <span key={i} className="font-mono text-[11px] font-semibold text-[var(--primary)] px-3 py-1.5 rounded-lg skeu-inset bg-[var(--input-bg)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05)] border border-black/5 dark:border-white/5">
                "{p}"
              </span>
            )) : (
              <span className="text-xs text-[var(--foreground-muted)] italic">None detected</span>
            )}
          </div>
        </div>

        {/* Style tags */}
        <div className="flex gap-2 pt-4 border-t border-[var(--input-border)]">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--foreground-muted)] px-2.5 py-1 rounded-md bg-[var(--background-subtle)] border border-[var(--input-border)]">
            {profile.capitalizationStyle}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--foreground-muted)] px-2.5 py-1 rounded-md bg-[var(--background-subtle)] border border-[var(--input-border)]">
            {profile.punctuationStyle} punct
          </span>
        </div>
      </div>
    </div>
  );
}
