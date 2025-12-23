import React, { useState } from 'react';
import { FileCheck2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { FileUpload } from '../components/common/FileUpload';
import { Button } from '../components/common/Button';
import { VerificationResult } from '../components/certificate/VerificationResult';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useCertificate } from '../hooks/useCertificate';
import { cryptoService } from '../services/cryptoService';
import { validateFile } from '../utils/validation';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const VerifyCertificate: React.FC = () => {
  const [certificateId, setCertificateId] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { verifyCertificate, certificateMeta, verifyStatus, loadCertificate } = useCertificate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = validateFile(file || undefined);
    if (err) {
      setFileError(err);
      return;
    }
    setFileError(null);
    if (!certificateId || !file) return;
    setIsLoading(true);
    try {
      const meta = await loadCertificate(Number(certificateId));
      const fileOk = await cryptoService.verifyDocumentHash(file, meta.documentHash);
      const res = await verifyCertificate(Number(certificateId), meta.documentHash);
      if (!fileOk) {
        setError('Uploaded file hash does not match on-chain hash.');
      } else if (!res.isValid) {
        setError('On-chain verification failed.');
      } else {
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Verify Certificate</h2>
            <p className="text-sm text-gray-600">Provide certificate ID and upload the certificate to verify its integrity.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            label="Certificate ID"
            type="number"
            value={certificateId}
            onChange={(e) => setCertificateId(Number(e.target.value))}
            required
          />
          <FileUpload
            label="Certificate File"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            fileName={file?.name}
            error={fileError || undefined}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={isLoading || verifyStatus.loading}>
              Verify
            </Button>
          </div>
        </form>
        {isLoading && <LoadingSpinner label="Verifying certificate..." className="mt-3" />}
        {error && <ErrorMessage message={error} className="mt-3" />}
        <div className="mt-4">
          <VerificationResult isValid={verifyStatus.isValid && !error} details={certificateMeta} />
        </div>
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
          PLACEHOLDER: integrate Person 1 verifyCertificate and Person 3 hash verification.
        </div>
      </div>
    </div>
  );
};
