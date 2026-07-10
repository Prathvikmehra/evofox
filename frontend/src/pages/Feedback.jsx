import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function StarIcon({ filled, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <svg
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={filled ? "var(--primary)" : "none"}
      stroke={filled ? "var(--primary)" : "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="cursor-pointer transition-all duration-200 hover:scale-120 text-[var(--foreground-muted)] active:scale-95"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SuccessCheck() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center animate-page-entry">
      <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(37,211,102,0.2)]">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 className="echo-title text-2xl text-[var(--foreground)] mb-2">Thank you!</h2>
      <p className="text-xs text-[var(--foreground-muted)] font-sans max-w-sm mb-8 leading-relaxed">
        Your feedback has been delivered successfully. We appreciate your support in making EchoMind better.
      </p>
      <Link to="/" className="echo-btn-primary px-6 py-3 text-xs font-semibold">
        Return to Home
      </Link>
    </div>
  );
}

export default function Feedback() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('general');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !message) {
      setError('Please fill in both your email address and message.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Retrieve environment credentials
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      // Missing environment variables fallback (helpful for staging/dev)
      console.warn("EmailJS credentials not set in environment variables (.env). Performing mock submit.");
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1200);
      return;
    }

    // Direct REST API payload
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        from_name: name || 'Anonymous User',
        from_email: email,
        feedback_type: feedbackType.toUpperCase(),
        rating: rating || 'N/A',
        message: message
      }
    };

    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const text = await res.text();
        throw new Error(text || 'Failed to submit feedback.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 w-full">
        <div className="echo-card p-8 md:p-12 bg-[var(--surface)]">
          <SuccessCheck />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16 w-full animate-page-entry">
      <div className="text-center mb-10">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.25em] text-[var(--primary-text)] mb-3">
          Share your experience
        </p>
        <h1 className="echo-title text-4xl text-[var(--foreground)] tracking-tight">
          Submit Feedback
        </h1>
        <p className="text-xs text-[var(--foreground-muted)] font-sans mt-2">
          Help us refine EchoMind's style mimicry and local-first pipelines.
        </p>
      </div>

      <div className="echo-card p-6 md:p-8 bg-[var(--surface)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] font-heading mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson (optional)"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] focus:border-[var(--primary)]/30 focus:outline-none transition-all duration-300 font-sans text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)]/50"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] font-heading mb-2">
              Email Address <span className="text-[var(--primary)]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full px-4 py-3 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] focus:border-[var(--primary)]/30 focus:outline-none transition-all duration-300 font-sans text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)]/50"
            />
          </div>

          {/* Feedback Type & Rating row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] font-heading mb-2">
                Feedback Type
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] focus:border-[var(--primary)]/30 focus:outline-none transition-all duration-300 font-sans text-sm text-[var(--foreground)] cursor-pointer"
              >
                <option value="general">General Suggestion</option>
                <option value="bug">Report a Bug</option>
                <option value="feature">Feature Request</option>
                <option value="style">Style Profiling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] font-heading mb-2">
                Rating
              </label>
              <div className="flex items-center gap-1.5 h-11">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={hoverRating ? star <= hoverRating : star <= rating}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] font-heading mb-2">
              Message <span className="text-[var(--primary)]">*</span>
            </label>
            <textarea
              required
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What can we improve? Feel free to paste details of any parsing errors or voice mismatches..."
              className="w-full p-4 rounded-2xl bg-[var(--background-subtle)] border border-[var(--card-border)] focus:border-[var(--primary)]/30 focus:outline-none transition-all duration-300 resize-none font-sans text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)]/50"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs font-sans leading-relaxed">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="echo-btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-[var(--primary-fg)]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending Feedback...
              </span>
            ) : 'Send Feedback'}
          </button>

        </form>
      </div>
    </div>
  );
}
