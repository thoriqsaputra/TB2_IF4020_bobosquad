import { useCallback, useMemo, useState } from 'react';
import { useContract } from './useContract';
import { mockCryptoService } from '../services/cryptoService';
import type { PreparedCertificateView, StudentData } from '../types/certificate';
import type { CertificateOnChain, ContractTransaction } from '../types/contract';
import { CONFIG } from '../config/config';

type ProgressStep = 'idle' | 'preparing' | 'encrypting' | 'signing' | 'confirming';

export const useCertificate = () => {
  const { contract } = useContract();
  const [issueProgress, setIssueProgress] = useState<ProgressStep>('idle');
  const [issueResult, setIssueResult] = useState<PreparedCertificateView | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  const [revokeStatus, setRevokeStatus] = useState<{ loading: boolean; error?: string; successTx?: string }>({
    loading: false,
  });

  const [certificateMeta, setCertificateMeta] = useState<CertificateOnChain | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<{ loading: boolean; isValid?: boolean; error?: string }>({
    loading: false,
  });

  const [transactions, setTransactions] = useState<ContractTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const certificateUrlBuilder = useCallback((id: number, ipfsCid: string, aesKey: string, txHash: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
    return `${origin}/certificate?id=${id}&cid=${ipfsCid}&key=${aesKey}&tx=${txHash}`;
  }, []);

  const issueCertificate = useCallback(
    async (studentData: StudentData, certificateFile: File) => {
      setIsIssuing(true);
      setIssueProgress('preparing');
      setIssueError(null);
      try {
        const prepared = await mockCryptoService.prepareCertificate({ certificateFile, studentData });
        setIssueProgress('encrypting');
        const signature = await mockCryptoService.generateCertificateSignature({
          documentHash: prepared.documentHash,
          ipfsCid: prepared.ipfsCid,
          issuerPrivateKey: 'PLACEHOLDER', // Integration: replace with secure signer
        });
        setIssueProgress('signing');
        const result = await contract.issueCertificate({
          documentHash: prepared.documentHash,
          ipfsCid: prepared.ipfsCid,
          signature,
        });
        setIssueProgress('confirming');
        const certificateUrl = certificateUrlBuilder(result.certificateId, prepared.ipfsCid, prepared.aesKey, result.transactionHash);
        const merged: PreparedCertificateView = {
          certificateId: result.certificateId,
          transactionHash: result.transactionHash,
          blockExplorerUrl: result.blockExplorerUrl,
          certificateUrl,
        };
        setIssueResult(merged);
        setIssueProgress('idle');
        return merged;
      } catch (err: any) {
        console.error('Issue certificate failed', err);
        setIssueError(err?.message || 'Failed to issue certificate');
        setIssueProgress('idle');
        throw err;
      } finally {
        setIsIssuing(false);
      }
    },
    [certificateUrlBuilder, contract],
  );

  const revokeCertificate = useCallback(
    async (certificateId: number, reason: string) => {
      setRevokeStatus({ loading: true });
      try {
        const signature = await mockCryptoService.generateCertificateSignature({
          documentHash: certificateId.toString(),
          ipfsCid: reason,
          issuerPrivateKey: 'PLACEHOLDER',
        });
        const res = await contract.revokeCertificate({ certificateId, reason, signature });
        setRevokeStatus({ loading: false, successTx: res.transactionHash });
        return res;
      } catch (err: any) {
        console.error('Revoke failed', err);
        setRevokeStatus({ loading: false, error: err?.message || 'Failed to revoke certificate' });
        throw err;
      }
    },
    [contract],
  );

  const loadCertificate = useCallback(
    async (certificateId: number) => {
      const meta = await contract.getCertificate(certificateId);
      setCertificateMeta(meta);
      return meta;
    },
    [contract],
  );

  const verifyCertificate = useCallback(
    async (certificateId: number, documentHash: string) => {
      setVerifyStatus({ loading: true });
      try {
        const res = await contract.verifyCertificate(certificateId, documentHash);
        setVerifyStatus({ loading: false, isValid: res.isValid });
        setCertificateMeta(res.details);
        return res;
      } catch (err: any) {
        setVerifyStatus({ loading: false, error: err?.message || 'Verification failed' });
        throw err;
      }
    },
    [contract],
  );

  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await contract.getTransactionList();
      setTransactions(res);
      return res;
    } finally {
      setTxLoading(false);
    }
  }, [contract]);

  const progressCopy: Record<ProgressStep, string> = useMemo(
    () => ({
      idle: 'Idle',
      preparing: 'Preparing certificate...',
      encrypting: 'Encrypting and uploading...',
      signing: 'Signing transaction...',
      confirming: 'Confirming on blockchain...',
    }),
    [],
  );

  return {
    issueCertificate,
    issueProgress,
    issueResult,
    issueError,
    isIssuing,
    progressCopy,
    revokeCertificate,
    revokeStatus,
    certificateMeta,
    loadCertificate,
    verifyCertificate,
    verifyStatus,
    loadTransactions,
    transactions,
    txLoading,
  };
};
