import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { verifyMessage } from "ethers";
import pkg from "pg";
import contractConfig from "./config/contract.js";

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

app.get("/health", async (_, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

app.get("/contract/info", (req, res) => {
  try {
    const contractInfo = contractConfig.getFullConfig();
    res.json({
      status: "ok",
      contract: contractInfo.contract,
      network: contractInfo.network,
      ipfs: contractInfo.ipfs,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Failed to load contract configuration",
    });
  }
});

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

app.post("/auth/verify", async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature) {
      return res.status(400).json({ error: "Address and signature required" });
    }
    const normalized = String(address).toLowerCase();
    const result = await pool.query(
      "SELECT nonce FROM nonces WHERE address = $1",
      [normalized]
    );
    if (!result.rows.length) {
      return res.status(401).json({ error: "Nonce not found" });
    }
    const { nonce } = result.rows[0];
    const recovered = verifyMessage(nonce, signature).toLowerCase();
    if (recovered !== normalized) {
      return res.status(401).json({ error: "Invalid signature" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Verify error", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
