import React from 'react';

export default function PersonalityCard({ profile, targetSender }) {
  if (!profile) return null;

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--card-border)',
      borderRadius: '12px',
      padding: '1.5rem',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'var(--primary)',
          marginBottom: '0.25rem',
        }}>Style Profile</p>
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--foreground)',
        }}>
          {targetSender}
        </h3>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Avg word count */}
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Avg reply length</p>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>
            {profile.averageWordCount ?? 0} <span style={{ fontWeight: 400, color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>words</span>
          </p>
        </div>

        {/* Emojis */}
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
            Top emojis <span style={{ color: 'var(--primary)' }}>({profile.emojiUsagePercent ?? 0}% of messages)</span>
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {profile.topEmojis?.length > 0 ? profile.topEmojis.map((e, i) => (
              <span key={i} style={{
                fontSize: '1.25rem',
                background: 'var(--background-subtle)',
                border: '1px solid var(--card-border)',
                borderRadius: '6px',
                padding: '4px 8px',
              }}>{e}</span>
            )) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontStyle: 'italic' }}>None detected</span>
            )}
          </div>
        </div>

        {/* Common phrases */}
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>Common phrases</p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {profile.commonPhrases?.length > 0 ? profile.commonPhrases.map((p, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                background: 'rgba(80,227,194,0.08)',
                color: 'var(--primary)',
                border: '1px solid rgba(80,227,194,0.15)',
                borderRadius: '6px',
                padding: '3px 8px',
              }}>"{p}"</span>
            )) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontStyle: 'italic' }}>None detected</span>
            )}
          </div>
        </div>

        {/* Style tags */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--card-border)',
        }}>
          <span style={{
            fontSize: '0.72rem',
            background: 'var(--background-subtle)',
            color: 'var(--foreground-muted)',
            borderRadius: '6px',
            padding: '3px 8px',
          }}>{profile.capitalizationStyle}</span>
          <span style={{
            fontSize: '0.72rem',
            background: 'var(--background-subtle)',
            color: 'var(--foreground-muted)',
            borderRadius: '6px',
            padding: '3px 8px',
          }}>{profile.punctuationStyle} punctuation</span>
        </div>
      </div>
    </div>
  );
}
