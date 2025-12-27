import React, { useState } from 'react';
import { ShieldOff, Eye } from 'lucide-react';
import { Input } from '../common/Input';
import { TextArea } from '../common/TextArea';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ErrorMessage } from '../common/ErrorMessage';
import { useCertificate } from '../../hooks/useCertificate';
import { CertificateCard } from './CertificateCard';

export const RevocationForm: React.FC = () => {
  const [certificateId, setCertificateId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewed, setPreviewed] = useState(false);

  const { revokeCertificate, revokeStatus, loadCertificate, certificateMeta } = useCertificate();

  const handlePreview = async () => {
    if (!certificateId) return;
    await loadCertificate(Number(certificateId));
    setPreviewed(true);
  };

  const onConfirm = async () => {
    if (!certificateId || !reason) return;
    await revokeCertificate(Number(certificateId), reason);
    setShowConfirm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId || !reason) return;
    setShowConfirm(true);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldOff className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revoke Certificate</h2>
            <p className="text-sm text-gray-600">Enter the certificate ID and reason before revoking.</p>
          </div>
        </div>
        <Input
          label="Certificate ID"
          type="number"
          value={certificateId}
          onChange={(e) => setCertificateId(Number(e.target.value))}
          required
        />
        <TextArea label="Revocation Reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} required />
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Preview Certificate
          </Button>
          <Button type="submit" variant="secondary" disabled={!certificateId || !reason} loading={revokeStatus.loading}>
            Revoke Certificate
          </Button>
        </div>
        {revokeStatus.error && <ErrorMessage message={revokeStatus.error} />}
        {revokeStatus.successTx && (
          <div className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
            Successfully revoked. Tx: {revokeStatus.successTx}
          </div>
        )}
      </form>
      <div className="space-y-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Certificate Preview</h3>
            <span className="text-xs text-gray-500">{previewed ? 'Loaded' : 'Not loaded'}</span>
          </div>
          {previewed && certificateMeta ? (
            <div className="mt-4">
              <CertificateCard data={certificateMeta} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-600">Load certificate metadata before revoking.</p>
          )}
        </div>
      </div>
      <Modal
        open={showConfirm}
        title="Confirm Revocation"
        onClose={() => setShowConfirm(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={onConfirm} loading={revokeStatus.loading}>
              Confirm Revoke
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-700">
          Are you sure you want to revoke certificate <strong>#{certificateId}</strong>? This action will be recorded on-chain.
        </p>
      </Modal>
    </div>
  );
};
