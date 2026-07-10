/**
 * db.js — PostgreSQL connection pool.
 *
 * Reads DATABASE_URL from the environment (loaded by dotenv in app.js).
 * Export the pool so any module can call pool.query(...) with parameterized
 * queries.
 */
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Reasonable limits for a hackathon/local setup
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Warn loudly on unexpected pool errors (e.g. DB restart) instead of crashing
pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err.message);
});

module.exports = pool;
