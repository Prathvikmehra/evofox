/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * Reads from BOTH React state (useAuth) AND localStorage to guard against
 * the race condition where login() calls setAuthState() and navigate()
 * in the same tick — React may not have committed the new state before
 * this component renders for the first time at the new route.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEY = "echomind_auth";

function hasLocalSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.token && parsed?.user);
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  // isAuthenticated covers the normal case (React state).
  // hasLocalSession() covers the race condition window where setAuthState
  // hasn't propagated yet but localStorage already has the session.
  if (!isAuthenticated && !hasLocalSession()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
