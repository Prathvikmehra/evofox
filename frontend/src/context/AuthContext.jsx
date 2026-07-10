/**
 * AuthContext.jsx — application-level auth state.
 *
 * Provides: { user, token, isAuthenticated, isLoading, login(token, user), logout() }
 *
 * Persistence:  localStorage key "echomind_auth" (JSON: { token, user }).
 * Auth0 bridge: when useAuth0() reports an authenticated session (Google login),
 *               we call POST /api/auth/google-sync ONCE to obtain a JWT and
 *               store it via login() — so all auth paths produce the same
 *               JWT-based session shape everywhere in the app.
 */
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { syncGoogleUser } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "echomind_auth";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.user) return parsed;
    }
  } catch {
    // corrupt storage — ignore
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const {
    isAuthenticated: auth0IsAuth,
    user: auth0User,
    isLoading: auth0Loading,
  } = useAuth0();

  // ── Restore from localStorage on mount ───────────────────────────────────
  const [authState, setAuthState] = useState(readStorage);

  // isLoading: true while Auth0 is determining its session state.
  // Consumers can use this to avoid a Login/Sign Up flash.
  const [isLoading, setIsLoading] = useState(true);

  // ── Prevent double-calling google-sync ───────────────────────────────────
  const syncedRef = useRef(false);

  // ── Resolve loading state ─────────────────────────────────────────────────
  useEffect(() => {
    if (!auth0Loading) {
      setIsLoading(false);
    }
  }, [auth0Loading]);

  // ── Auth0 bridge: Google login → google-sync → JWT session ───────────────
  useEffect(() => {
    if (auth0Loading) return;
    if (!auth0IsAuth || !auth0User?.email) return;
    if (authState.token) return;  // already have a JWT session
    if (syncedRef.current) return; // already attempted sync this session

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
        // Do NOT reset syncedRef here — prevents infinite retry loops.
        // User can reload if they need to retry.
        console.error("[AuthContext] google-sync failed:", err.message);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth0Loading, auth0IsAuth, auth0User]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function login(token, user) {
    const next = { token, user };
    // Write to localStorage FIRST — so ProtectedRoute's fallback check
    // always sees the session even before React commits the state update.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuthState(next);
  }

  function logout() {
    syncedRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({ token: null, user: null });
  }

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: Boolean(authState.token),
    isLoading,
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
