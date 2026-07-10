/**
 * userModel.js — data-access layer for the `users` table.
 *
 * All queries use parameterized placeholders ($1, $2, …) — values are
 * NEVER string-concatenated into SQL, preventing SQL injection.
 *
 * Call ensureUsersTable() once at startup to create the table if it
 * doesn't already exist (idempotent, uses CREATE TABLE IF NOT EXISTS).
 */
const pool = require("../config/db");

// ── Table bootstrap ──────────────────────────────────────────────────────────
async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255)        NOT NULL,
      email      VARCHAR(255) UNIQUE NOT NULL,
      password   VARCHAR(255)        NOT NULL,
      created_at TIMESTAMP           DEFAULT NOW()
    )
  `);

  // ── Additive migrations (idempotent) ─────────────────────────────────────
  // Allow Google-auth users who have no password
  await pool.query(`
    ALTER TABLE users ALTER COLUMN password DROP NOT NULL
  `).catch(() => {/* already nullable — ignore */});

  // Store Auth0 subject ID for Google-auth users
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS auth0_id VARCHAR(255) UNIQUE
  `);
}

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Insert a new user row.
 * @param {string} name
 * @param {string} email
 * @param {string} hashedPassword  — bcrypt hash, never plaintext
 * @returns {Promise<Object>}  The newly created row (without password).
 */
async function createUser(name, email, hashedPassword) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, hashedPassword]
  );
  return rows[0];
}

/**
 * Find a user by email.
 * Returns the full row including the password hash (needed for login compare).
 * Callers MUST strip the password before sending any response.
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1",
    [email]
  );
  return rows[0] ?? null;
}

/**
 * Find a user by primary key.
 * Returns the row WITHOUT the password column (safe to attach to req.user).
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function findUserById(id) {
  const { rows } = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1 LIMIT 1",
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Insert a new user authenticated via Google / Auth0.
 * Password is intentionally NULL — these users authenticate via Auth0, not
 * bcrypt. The auth0_id uniquely identifies them across sign-ins.
 * @param {string} name
 * @param {string} email
 * @param {string} auth0Id   — Auth0 subject string, e.g. "google-oauth2|..."
 * @returns {Promise<Object>}  The newly created row (id, name, email).
 */
async function createGoogleUser(name, email, auth0Id) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, auth0_id)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, auth0Id]
  );
  return rows[0];
}

module.exports = { ensureUsersTable, createUser, findUserByEmail, findUserById, createGoogleUser };
