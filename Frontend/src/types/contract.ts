export interface CertificateOnChain {
  documentHash: string;
  ipfsCid: string;
  issuer: string;
  timestamp: number;
  isRevoked: boolean;
  revokeReason: string;
}

export interface IssueCertificateParams {
  documentHash: string;
  ipfsCid: string;
  signature: string;
}

export interface IssueCertificateResult {
  certificateId: number;
  transactionHash: string;
  blockExplorerUrl: string;
}

export interface RevokeCertificateParams {
  certificateId: number;
  reason: string;
  signature: string;
}

export interface VerifyCertificateResult {
  isValid: boolean;
  details: CertificateOnChain;
}

export interface ContractTransaction {
  txHash: string;
  type: 'ISSUE' | 'REVOKE';
  certificateId: number;
  timestamp: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  blockExplorerUrl: string;
}

export interface ContractService {
  issueCertificate(params: IssueCertificateParams): Promise<IssueCertificateResult>;
  revokeCertificate(params: RevokeCertificateParams): Promise<{ transactionHash: string; blockExplorerUrl: string }>;
  getCertificate(id: number): Promise<CertificateOnChain>;
  verifyCertificate(id: number, documentHash: string): Promise<VerifyCertificateResult>;
  getTransactionList(): Promise<ContractTransaction[]>;
  updateIssuer?(newIssuer: string, signature: string): Promise<{ transactionHash: string; blockExplorerUrl: string }>;
}
