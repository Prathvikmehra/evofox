import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../context/AuthContext";
import { signupUser } from "../services/api";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { loginWithRedirect } = useAuth0();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await signupUser(name, email, password);
      login(token, user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignup() {
    loginWithRedirect({
      authorizationParams: { connection: "google-oauth2" },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md rounded-3xl border border-[var(--card-border)] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
        style={{ background: "var(--card-bg)" }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="echo-title text-3xl text-[var(--foreground)] mb-2">
            Create your clone
          </h1>
          <p className="text-[var(--foreground-muted)] text-sm font-sans">
            Join Echo<span className="text-[var(--primary)] font-bold">Mind</span> — your second mind awaits
          </p>
        </div>

        {/* Google button */}
        <button
          id="signup-google-btn"
          type="button"
          onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-[var(--card-border)] font-sans text-sm font-medium text-[var(--foreground)] mb-6 transition-all hover:border-[var(--primary)] hover:shadow-[0_0_0_2px_rgba(37,211,102,0.15)]"
          style={{ background: "var(--input-bg)" }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.15 0 5.97 1.09 8.2 2.87l6.12-6.12C34.46 3.1 29.5 1 24 1 14.8 1 6.97 6.48 3.26 14.44l7.13 5.54C12.14 13.62 17.62 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24.5c0-1.57-.14-3.1-.4-4.57H24v8.65h12.68c-.55 2.93-2.2 5.42-4.7 7.1l7.25 5.63C43.22 37.2 46.5 31.28 46.5 24.5z"/>
            <path fill="#FBBC05" d="M10.39 28.48A14.6 14.6 0 0 1 9.5 24c0-1.56.27-3.07.75-4.48L3.12 14a23.93 23.93 0 0 0 0 20l7.27-5.52z"/>
            <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.25-5.63c-1.82 1.22-4.14 1.94-6.25 1.94-6.38 0-11.86-4.12-13.61-9.89L3.12 34C6.83 41.52 14.8 47 24 47z"/>
          </svg>
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <hr className="flex-1 border-[var(--card-border)]" />
          <span className="text-[var(--foreground-muted)] text-xs font-sans">or</span>
          <hr className="flex-1 border-[var(--card-border)]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              id="signup-error"
              className="text-sm px-4 py-3 rounded-xl border font-sans"
              style={{
                background: "rgba(239,68,68,0.08)",
                borderColor: "rgba(239,68,68,0.35)",
                color: "rgb(239,68,68)",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="signup-name" className="block text-xs font-heading font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
              Name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-sans text-[var(--foreground)] border border-[var(--input-border)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              style={{ background: "var(--input-bg)" }}
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-xs font-heading font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-sans text-[var(--foreground)] border border-[var(--input-border)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              style={{ background: "var(--input-bg)" }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-xs font-heading font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-1.5">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm font-sans text-[var(--foreground)] border border-[var(--input-border)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
              style={{ background: "var(--input-bg)" }}
              placeholder="At least 6 characters"
            />
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl font-heading font-semibold text-sm transition-all mt-2 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
              color: "var(--primary-fg)",
              boxShadow: "0 4px 16px rgba(37,211,102,0.25)",
            }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--foreground-muted)] font-sans mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--primary)] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
