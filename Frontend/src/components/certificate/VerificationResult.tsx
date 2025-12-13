import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { CertificateOnChain } from '../../types/contract';
import { formatTimestamp } from '../../utils/helpers';

interface Props {
  isValid?: boolean;
  details?: CertificateOnChain | null;
}

export const VerificationResult: React.FC<Props> = ({ isValid, details }) => {
  if (isValid === undefined) return null;
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${isValid ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}
    >
      <div className="flex items-center gap-2 text-lg font-semibold">
        {isValid ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
        <span>{isValid ? 'Valid Certificate' : 'Invalid or Revoked'}</span>
      </div>
      {details && (
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Issuer</span>
            <span className="font-semibold">{details.issuer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Issued</span>
            <span>{formatTimestamp(details.timestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span>{details.isRevoked ? 'Revoked' : 'Active'}</span>
          </div>
          {details.revokeReason && details.isRevoked && (
            <div className="rounded-lg bg-white/60 px-3 py-2 text-xs text-gray-700">Reason: {details.revokeReason}</div>
          )}
        </div>
      )}
    </div>
  );
};
