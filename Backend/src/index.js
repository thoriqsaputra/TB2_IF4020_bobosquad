import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { verifyMessage } from "ethers";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

const pool = new Pool({ connectionString: DATABASE_URL });

app.use(
  cors({
    origin: ALLOWED_ORIGIN === "*" ? "*" : ALLOWED_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Health check (also validates DB connectivity)
app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// GET /auth/nonce?address=0x...
app.get("/auth/nonce", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: "Address is required" });
    const normalized = String(address).toLowerCase();
    const nonce = `Login to CertiChain: ${nanoid(10)}`;
    await pool.query(
      `
        INSERT INTO nonces (address, nonce)
        VALUES ($1, $2)
        ON CONFLICT (address) DO UPDATE SET nonce = EXCLUDED.nonce, created_at = NOW()
      `,
      [normalized, nonce]
    );
    res.json({ nonce });
  } catch (err) {
    console.error("Nonce error", err);
    res.status(500).json({ error: "Failed to generate nonce" });
  }
});

// POST /auth/verify { address, signature }
app.post("/auth/verify", async (req, res) => {
  try {
    const { address, signature } = req.body || {};
    if (!address || !signature)
      return res
        .status(400)
        .json({ error: "Address and signature are required" });
    const normalized = String(address).toLowerCase();
    const result = await pool.query(
      "SELECT nonce FROM nonces WHERE address = $1",
      [normalized]
    );
    if (result.rowCount === 0)
      return res
        .status(400)
        .json({ error: "Nonce not found. Request a new one." });
    const { nonce } = result.rows[0];

    const recovered = verifyMessage(nonce, signature).toLowerCase();
    if (recovered !== normalized) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    await pool.query("DELETE FROM nonces WHERE address = $1", [normalized]);
    // For demo purposes, return a mock token; replace with JWT/session in production
    res.json({ token: `mock-token-${normalized.slice(2, 8)}` });
  } catch (err) {
    console.error("Verify error", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Run migration on startup
const runMigration = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS nonces (
        address TEXT PRIMARY KEY,
        nonce TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log("Database migration completed");
  } catch (err) {
    console.error("Migration failed", err);
    process.exit(1);
  }
};

app.listen(PORT, async () => {
  await runMigration();
  console.log(`Backend listening on http://localhost:${PORT}`);
});
