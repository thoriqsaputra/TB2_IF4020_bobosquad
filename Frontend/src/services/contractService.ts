import type {
  CertificateOnChain,
  ContractService,
  ContractTransaction,
  IssueCertificateParams,
  IssueCertificateResult,
  RevokeCertificateParams,
  VerifyCertificateResult,
} from '../types/contract';
import { CONFIG } from '../config/config';
import { getExplorerTx } from '../utils/helpers';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockContractService: ContractService = {
  async issueCertificate(params: IssueCertificateParams): Promise<IssueCertificateResult> {
    console.log('PLACEHOLDER issueCertificate', params);
    await delay(2000);
    const txHash = `0x${'a'.repeat(64)}`;
    const certificateId = Math.floor(Math.random() * 100000);
    return {
      certificateId,
      transactionHash: txHash,
      blockExplorerUrl: getExplorerTx(txHash),
    };
  },

  async revokeCertificate(params: RevokeCertificateParams) {
    console.log('PLACEHOLDER revokeCertificate', params);
    await delay(1500);
    const txHash = `0x${'b'.repeat(64)}`;
    return {
      transactionHash: txHash,
      blockExplorerUrl: getExplorerTx(txHash),
    };
  },

  async getCertificate(id: number): Promise<CertificateOnChain> {
    console.log('PLACEHOLDER getCertificate', id);
    await delay(800);
    return {
      documentHash: `0x${'c'.repeat(64)}`,
      ipfsCid: 'QmExampleCid123',
      issuer: CONFIG.ISSUER_ADDRESS,
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      isRevoked: false,
      revokeReason: '',
    };
  },

  async verifyCertificate(id: number, documentHash: string): Promise<VerifyCertificateResult> {
    console.log('PLACEHOLDER verifyCertificate', id, documentHash);
    await delay(500);
    const cert = await this.getCertificate(id);
    return { isValid: cert.documentHash === documentHash && !cert.isRevoked, details: cert };
  },

  async getTransactionList(): Promise<ContractTransaction[]> {
    await delay(700);
    const now = Math.floor(Date.now() / 1000);
    return [
      {
        txHash: `0x${'a'.repeat(64)}`,
        type: 'ISSUE',
        certificateId: 1,
        timestamp: now - 5000,
        status: 'SUCCESS',
        blockExplorerUrl: getExplorerTx(`0x${'a'.repeat(64)}`),
      },
      {
        txHash: `0x${'b'.repeat(64)}`,
        type: 'REVOKE',
        certificateId: 2,
        timestamp: now - 8000,
        status: 'PENDING',
        blockExplorerUrl: getExplorerTx(`0x${'b'.repeat(64)}`),
      },
    ];
  },
};
