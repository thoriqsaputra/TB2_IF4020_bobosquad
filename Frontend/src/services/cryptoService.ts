import type { CryptoService, PreparedCertificate } from "../types/crypto";
import type { StudentData } from "../types/certificate";
import { ethers } from "ethers";
import { CONFIG } from "../config/config";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomHex = (length: number) => {
  const chars = "abcdef0123456789";
  let out = "0x";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

const randomBase64Key = () =>
  btoa(Math.random().toString(36).slice(2)).padEnd(24, "=");

const buildMockPrepared = async (
  certificateFile: File,
  studentData: StudentData
): Promise<PreparedCertificate> => {
  console.log("PLACEHOLDER prepareCertificate", studentData);
  await delay(800);
  const ipfsCid = `Qm${Math.random().toString(36).slice(2, 10)}`;
  return {
    encryptedFile: certificateFile,
    aesKey: randomBase64Key(),
    documentHash: randomHex(64),
    ipfsCid,
  };
};

export const mockCryptoService: CryptoService = {
  async prepareCertificate(params) {
    return buildMockPrepared(params.certificateFile, params.studentData);
  },

  async generateCertificateSignature({ documentHash, ipfsCid }) {
    await delay(500);
    return `${documentHash}${ipfsCid}`.slice(0, 66).padEnd(66, "f");
  },

  async downloadCertificate({ ipfsCid, aesKey }) {
    console.log("PLACEHOLDER downloadCertificate", ipfsCid, aesKey);
    await delay(600);
    const blob = new Blob(
      ["Decrypted certificate preview for CID: ", ipfsCid],
      {
        type: "text/plain",
      }
    );
    return { decryptedFile: blob, mimeType: "text/plain" };
  },

  async verifyDocumentHash(file: File | Blob, expectedHash: string) {
    console.log("PLACEHOLDER verifyDocumentHash", file, expectedHash);
    await delay(300);
    // Mock: accept hashes that end with 'c'
    return expectedHash.endsWith("c");
  },
  async embedCertificateUrl(file: Blob, _certificateUrl: string) {
    await delay(200);
    const buf = await file.arrayBuffer();
    return new Blob([buf], { type: file.type || "application/octet-stream" });
  },
};

const DEFAULT_IPFS_GATEWAY = "http://localhost:8080";
const DEFAULT_IPFS_API = "http://localhost:5001";
let cachedGateway: string | null = null;
let cachedApi: string | null = null;

const resolveIpfsEndpoints = async () => {
  if (cachedGateway && cachedApi)
    return { gateway: cachedGateway, api: cachedApi };
  try {
    const res = await fetch(`${CONFIG.BACKEND_URL}/contract/info`);
    if (res.ok) {
      const data = await res.json();
      const gw = String(data?.ipfs?.gateway || DEFAULT_IPFS_GATEWAY);
      // Map docker internal host 'ipfs' to localhost for browser access
      const normalizedGateway = gw.replace("http://ipfs:", "http://localhost:");
      const u = new URL(normalizedGateway);
      const apiUrl = `${u.protocol}//${u.hostname}:5001`;
      cachedGateway = normalizedGateway;
      cachedApi = apiUrl;
      return { gateway: normalizedGateway, api: apiUrl };
    }
  } catch {}
  cachedGateway = DEFAULT_IPFS_GATEWAY;
  cachedApi = DEFAULT_IPFS_API;
  return { gateway: DEFAULT_IPFS_GATEWAY, api: DEFAULT_IPFS_API };
};

// helper reserved for future use (left intentionally unused to avoid dead code warnings)
// const toHex = (bytes: Uint8Array) => '0x' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
const fromBase64 = (b64: string) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
};
const toBase64 = (bytes: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const sha3File = async (file: File | Blob) => {
  const buf = await file.arrayBuffer();
  const hash = ethers.keccak256(new Uint8Array(buf));
  return hash;
};

const generateAesKeyBase64 = async () => {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const raw = await crypto.subtle.exportKey("raw", key);
  return toBase64(new Uint8Array(raw));
};

const importAesKey = async (b64: string) => {
  const raw = fromBase64(b64);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
};

const encryptBlob = async (blob: Blob, keyBase64: string) => {
  const key = await importAesKey(keyBase64);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const plaintext = new Uint8Array(await blob.arrayBuffer());
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );
  const ct = new Uint8Array(ciphertext);
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return new Blob([out], { type: "application/octet-stream" });
};

const uploadToIpfs = async (blob: Blob) => {
  const { api } = await resolveIpfsEndpoints();
  const form = new FormData();
  form.append("file", blob, "certificate.enc");
  const res = await fetch(`${api}/api/v0/add?pin=true`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("IPFS upload failed");
  const text = await res.text();
  const lines = text.trim().split("\n");
  const last = JSON.parse(lines[lines.length - 1]);
  const cid: string = last.Hash || last.cid || last.Cid?.["/"];
  if (!cid) throw new Error("IPFS returned no CID");
  return cid;
};

const detectMimeType = (bytes: Uint8Array) => {
  const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const jpgMagic = [0xff, 0xd8];
  const pdfMagic = [0x25, 0x50, 0x44, 0x46];
  const startsWith = (magic: number[]) => magic.every((v, i) => bytes[i] === v);
  if (bytes.length >= 8 && startsWith(pngMagic)) return "image/png";
  if (bytes.length >= 2 && startsWith(jpgMagic)) return "image/jpeg";
  if (bytes.length >= 4 && startsWith(pdfMagic)) return "application/pdf";
  // crude text detection
  const sample = bytes.slice(0, Math.min(bytes.length, 1024));
  const isText = Array.from(sample).every(
    (b) => b === 9 || b === 10 || b === 13 || (b >= 32 && b <= 126)
  );
  return isText ? "text/plain" : "application/octet-stream";
};

const decryptBytes = async (encrypted: Uint8Array, keyBase64: string) => {
  const iv = encrypted.slice(0, 12);
  const ct = encrypted.slice(12);
  const key = await importAesKey(keyBase64);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ct
  );
  return new Uint8Array(plainBuf);
};

export const cryptoService: CryptoService = {
  async prepareCertificate({ certificateFile }) {
    const documentHash = await sha3File(certificateFile);
    const aesKey = await generateAesKeyBase64();
    const encryptedFile = await encryptBlob(certificateFile, aesKey);
    const ipfsCid = await uploadToIpfs(encryptedFile);
    return { encryptedFile, aesKey, documentHash, ipfsCid };
  },

  async generateCertificateSignature({ documentHash, ipfsCid }) {
    return ethers.keccak256(
      ethers.solidityPacked(["bytes32", "string"], [documentHash, ipfsCid])
    );
  },

  async downloadCertificate({ ipfsCid, aesKey }) {
    const { gateway } = await resolveIpfsEndpoints();
    const res = await fetch(`${gateway}/ipfs/${encodeURIComponent(ipfsCid)}`);
    if (!res.ok) throw new Error("Failed to fetch from IPFS gateway");
    const buf = await res.arrayBuffer();
    const decrypted = await decryptBytes(new Uint8Array(buf), aesKey);
    const mimeType = detectMimeType(decrypted);
    const blob = new Blob([decrypted], { type: mimeType });
    return { decryptedFile: blob, mimeType };
  },

  async verifyDocumentHash(file: File | Blob, expectedHash: string) {
    const hash = await sha3File(file);
    return hash.toLowerCase() === expectedHash.toLowerCase();
  },

  async uploadToStorage(encryptedFile: Blob) {
    const { gateway } = await resolveIpfsEndpoints();
    const cid = await uploadToIpfs(encryptedFile);
    const url = `${gateway}/ipfs/${cid}`;
    const size = encryptedFile.size;
    return { url, size };
  },
  async embedCertificateUrl(file: Blob, certificateUrl: string) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mimeType = detectMimeType(bytes);
    if (mimeType === "application/pdf") {
      const pdf = await PDFDocument.load(bytes);
      const page = pdf.getPages()[0];
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const text = `Certificate URL: ${certificateUrl}`;
      page.drawText(text, {
        x: 40,
        y: 40,
        size: 10,
        font,
        color: rgb(0, 0.4, 0.8),
      });
      const out = await pdf.save();
      const ab = new ArrayBuffer(out.byteLength);
      const view = new Uint8Array(ab);
      view.set(out);
      return new Blob([ab], { type: "application/pdf" });
    }
    if (mimeType === "image/png" || mimeType === "image/jpeg") {
      const imgUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = imgUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      const pad = 12;
      const text = `Certificate URL: ${certificateUrl}`;
      ctx.font = "20px sans-serif";
      const textWidth = ctx.measureText(text).width;
      const boxWidth = textWidth + pad * 2;
      const boxHeight = 32 + pad;
      ctx.fillRect(pad, canvas.height - boxHeight - pad, boxWidth, boxHeight);
      ctx.fillStyle = "white";
      ctx.fillText(text, pad * 2, canvas.height - pad * 2);
      const dataUrl = canvas.toDataURL(mimeType);
      const res = await fetch(dataUrl);
      const outBuf = await res.arrayBuffer();
      return new Blob([outBuf], { type: mimeType });
    }
    if (mimeType === "text/plain") {
      const text = await file.text();
      const appended = `${text}\n\nCertificate URL: ${certificateUrl}\n`;
      return new Blob([appended], { type: "text/plain" });
    }
    return file;
  },
};
