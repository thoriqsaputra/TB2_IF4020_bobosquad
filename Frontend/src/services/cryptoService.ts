import type { CryptoService, PreparedCertificate } from '../types/crypto';
import type { StudentData } from '../types/certificate';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const randomHex = (length: number) => {
  const chars = 'abcdef0123456789';
  let out = '0x';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

const randomBase64Key = () => btoa(Math.random().toString(36).slice(2)).padEnd(24, '=');

const buildMockPrepared = async (certificateFile: File, studentData: StudentData): Promise<PreparedCertificate> => {
  console.log('PLACEHOLDER prepareCertificate', studentData);
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
    return `${documentHash}${ipfsCid}`.slice(0, 66).padEnd(66, 'f');
  },

  async downloadCertificate({ ipfsCid, aesKey }) {
    console.log('PLACEHOLDER downloadCertificate', ipfsCid, aesKey);
    await delay(600);
    const blob = new Blob(['Decrypted certificate preview for CID: ', ipfsCid], {
      type: 'text/plain',
    });
    return { decryptedFile: blob, mimeType: 'text/plain' };
  },

  async verifyDocumentHash(file: File | Blob, expectedHash: string) {
    console.log('PLACEHOLDER verifyDocumentHash', file, expectedHash);
    await delay(300);
    // Mock: accept hashes that end with 'c'
    return expectedHash.endsWith('c');
  },
};
