import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import { verifyMessage, JsonRpcProvider, Contract } from "ethers";
import pkg from "pg";
import contractConfig from "./config/contract.js";
import fs from "fs";
import path from "path";

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

const ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "certificateId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "documentHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ipfsCid",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "certificateId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "issuer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CertificateRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "getCertificateCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { internalType: "string", name: "ipfsCid", type: "string" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "issueCertificate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "certificateId", type: "uint256" },
    ],
    name: "getCertificate",
    outputs: [
      { internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { internalType: "string", name: "ipfsCid", type: "string" },
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "isRevoked", type: "bool" },
      { internalType: "string", name: "revokeReason", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "certificateId", type: "uint256" },
      { internalType: "bytes32", name: "documentHash", type: "bytes32" },
      { internalType: "string", name: "ipfsCid", type: "string" },
    ],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bool", name: "isValid", type: "bool" },
      { internalType: "string", name: "message", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "certificateId", type: "uint256" },
      { internalType: "string", name: "reason", type: "string" },
    ],
    name: "revokeCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const getAbi = () => ABI;

app.get("/contract/verify", async (req, res) => {
  try {
    const id = Number(req.query.id);
    const documentHash = String(req.query.hash || "");
    if (!id || !documentHash) {
      return res.status(400).json({ error: "id and hash required" });
    }
    const provider = new JsonRpcProvider(contractConfig.getRpcUrl());
    const contract = new Contract(
      contractConfig.getContractAddress(),
      getAbi(),
      provider
    );
    let cert;
    try {
      cert = await contract.getCertificate(id);
    } catch {
      return res.json({ isValid: false });
    }
    const details = {
      documentHash: cert.documentHash,
      ipfsCid: cert.ipfsCid,
      issuer: cert.issuer,
      timestamp: Number(cert.timestamp),
      isRevoked: Boolean(cert.isRevoked),
      revokeReason: cert.revokeReason,
    };
    const isValid =
      !details.isRevoked &&
      String(details.documentHash).toLowerCase() === documentHash.toLowerCase();
    res.json({ isValid, details });
  } catch (err) {
    console.error("Contract verify error", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.get("/contract/certificate/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "id required" });
    const provider = new JsonRpcProvider(contractConfig.getRpcUrl());
    const contract = new Contract(
      contractConfig.getContractAddress(),
      getAbi(),
      provider
    );
    const cert = await contract.getCertificate(id);
    const details = {
      documentHash: cert.documentHash,
      ipfsCid: cert.ipfsCid,
      issuer: cert.issuer,
      timestamp: Number(cert.timestamp),
      isRevoked: Boolean(cert.isRevoked),
      revokeReason: cert.revokeReason,
    };
    res.json({ status: "ok", details });
  } catch (err) {
    console.error("Contract certificate error", err);
    res.status(500).json({ error: "Failed to load certificate" });
  }
});

app.get("/contract/transactions", async (req, res) => {
  try {
    const provider = new JsonRpcProvider(contractConfig.getRpcUrl());
    const contract = new Contract(
      contractConfig.getContractAddress(),
      getAbi(),
      provider
    );
    const latest = await provider.getBlockNumber();
    const from = Math.max(0, latest - 20000);
    const issued = await contract.queryFilter(
      contract.filters.CertificateIssued(),
      from,
      latest
    );
    const revoked = await contract.queryFilter(
      contract.filters.CertificateRevoked(),
      from,
      latest
    );
    const txs = [];
    for (const ev of issued) {
      const b = await provider.getBlock(ev.blockHash);
      let certificateId = 0;
      try {
        const parsed = contract.interface.parseLog(ev);
        if (parsed?.name === "CertificateIssued") {
          certificateId = Number(parsed.args.certificateId);
        }
      } catch {}
      txs.push({
        txHash: ev.transactionHash,
        type: "ISSUE",
        certificateId,
        timestamp: Number(b?.timestamp || 0),
        status: "SUCCESS",
      });
    }
    for (const ev of revoked) {
      const b = await provider.getBlock(ev.blockHash);
      let certificateId = 0;
      try {
        const parsed = contract.interface.parseLog(ev);
        if (parsed?.name === "CertificateRevoked") {
          certificateId = Number(parsed.args.certificateId);
        }
      } catch {}
      txs.push({
        txHash: ev.transactionHash,
        type: "REVOKE",
        certificateId,
        timestamp: Number(b?.timestamp || 0),
        status: "SUCCESS",
      });
    }
    txs.sort((a, b) => b.timestamp - a.timestamp);
    res.json({ status: "ok", transactions: txs });
  } catch (err) {
    console.error("Contract transactions error", err);
    res.status(500).json({ error: "Failed to load transactions" });
  }
});

app.post(
  "/ipfs/add",
  express.raw({ type: "application/octet-stream", limit: "20mb" }),
  async (req, res) => {
    try {
      const bytes = req.body;
      if (!bytes || !bytes.length) {
        return res.status(400).json({ error: "Empty body" });
      }
      const apiUrl = "http://ipfs:5001/api/v0/add?pin=true";
      const form = new FormData();
      const blob = new Blob([bytes], { type: "application/octet-stream" });
      form.append("file", blob, "certificate.enc");
      const resp = await fetch(apiUrl, { method: "POST", body: form });
      if (!resp.ok) {
        const t = await resp.text();
        return res
          .status(502)
          .json({ error: "IPFS upload failed", details: t.slice(0, 500) });
      }
      const text = await resp.text();
      const lines = text.trim().split("\n");
      const last = JSON.parse(lines[lines.length - 1]);
      const cid = last.Hash || last.cid || (last.Cid && last.Cid["/"]);
      if (!cid) {
        return res.status(500).json({ error: "IPFS returned no CID" });
      }
      res.json({ cid });
    } catch (err) {
      console.error("IPFS add error", err);
      res.status(500).json({ error: "Failed to upload to IPFS" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
