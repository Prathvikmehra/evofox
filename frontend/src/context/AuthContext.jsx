/**
 * AuthContext.jsx — application-level auth state.
 *
 * Provides: { user, token, isAuthenticated, login(token, user), logout() }
 *
 * Persistence:  localStorage key "echomind_auth" (JSON: { token, user }).
 * Auth0 bridge: when useAuth0() reports an authenticated session (Google login),
 *               we call POST /api/auth/google-sync once to obtain a JWT and
 *               store it via login() — so all auth paths end up with the same
 *               JWT-based session shape for the rest of the app.
 */
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { syncGoogleUser } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "echomind_auth";

export function AuthProvider({ children }) {
  const { isAuthenticated: auth0IsAuth, user: auth0User, isLoading: auth0Loading } = useAuth0();

  // ── Restore from localStorage on mount ───────────────────────────────────
  const [authState, setAuthState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.user) return parsed;
      }
    } catch {
      // corrupt storage — start fresh
    }
    return { token: null, user: null };
  });

  // ── Prevent double-calling google-sync on hot reload ─────────────────────
  const syncedRef = useRef(false);

  // ── Auth0 bridge: Google login → google-sync → JWT session ───────────────
  useEffect(() => {
    if (auth0Loading) return;
    if (!auth0IsAuth || !auth0User) return;
    if (authState.token) return; // already have a session (e.g. email/pass)
    if (syncedRef.current) return;

    syncedRef.current = true;

    syncGoogleUser(
      auth0User.name || auth0User.email,
      auth0User.email,
      auth0User.sub
    )
      .then(({ token, user }) => {
        login(token, user);
      })
      .catch((err) => {
        console.error("[AuthContext] google-sync failed:", err.message);
        syncedRef.current = false; // allow retry on next render
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0Loading, auth0IsAuth, auth0User]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function login(token, user) {
    const next = { token, user };
    setAuthState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function logout() {
    syncedRef.current = false;
    setAuthState({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
  }

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: Boolean(authState.token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
