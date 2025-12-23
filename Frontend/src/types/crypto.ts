import type { StudentData } from './certificate';

export interface PreparedCertificate {
  encryptedFile: Blob;
  aesKey: string;
  documentHash: string;
  ipfsCid: string;
}

export interface CryptoService {
  prepareCertificate(params: { certificateFile: File; studentData: StudentData }): Promise<PreparedCertificate>;
  generateCertificateSignature(params: { documentHash: string; ipfsCid: string; issuerPrivateKey: string }): Promise<string>;
  downloadCertificate(params: { ipfsCid: string; aesKey: string; certificateUrl?: string }): Promise<{ decryptedFile: Blob; mimeType: string }>;
  verifyDocumentHash(file: File | Blob, expectedHash: string): Promise<boolean>;
  uploadToStorage?(encryptedFile: Blob): Promise<{ url: string; size: number }>;
  generateIssuerKeys?(): Promise<{ privateKey: string; publicKey: string; address: string }>;
  embedCertificateUrl(file: Blob, certificateUrl: string): Promise<Blob>;
}
