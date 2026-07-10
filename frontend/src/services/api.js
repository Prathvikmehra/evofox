const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function uploadChatExport(file, cloneName) {
  const form = new FormData();
  form.append("file", file);
  form.append("cloneName", cloneName);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  return handle(res);
}

export async function getSessionStatus(sessionId) {
  const res = await fetch(`${BASE}/upload/${sessionId}/status`);
  return handle(res);
}

export async function getPersonality(sessionId) {
  const res = await fetch(`${BASE}/personality/${sessionId}`);
  return handle(res);
}

export async function sendChatMessage(sessionId, message) {
  const res = await fetch(`${BASE}/chat/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return handle(res);
}

export async function getChatHistory(sessionId) {
  const res = await fetch(`${BASE}/chat/${sessionId}/history`);
  return handle(res);
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export async function signupUser(name, email, password) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handle(res);
}

export async function loginUser(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

export async function syncGoogleUser(name, email, auth0Id) {
  const res = await fetch(`${BASE}/auth/google-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, auth0Id }),
  });
  return handle(res);
}