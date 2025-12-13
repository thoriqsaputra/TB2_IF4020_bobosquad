import React from 'react';
import { BadgeCheck, Ban } from 'lucide-react';
import type { CertificateOnChain } from '../../types/contract';
import { formatTimestamp, getExplorerAddress } from '../../utils/helpers';
import { CONFIG } from '../../config/config';

interface Props {
  data: CertificateOnChain;
}

export const CertificateCard: React.FC<Props> = ({ data }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${data.isRevoked ? 'bg-red-50' : 'bg-green-50'}`}>
        {data.isRevoked ? <Ban className="h-5 w-5 text-red-600" /> : <BadgeCheck className="h-5 w-5 text-green-600" />}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">Certificate Metadata</p>
        <p className="text-xs text-gray-600">{data.isRevoked ? 'Revoked' : 'Active'}</p>
      </div>
    </div>
    <div className="mt-4 grid gap-2 text-sm text-gray-700">
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Issuer</span>
        <a
          className="text-primary underline"
          href={getExplorerAddress(data.issuer)}
          target="_blank"
          rel="noreferrer"
          title="View on explorer"
        >
          {data.issuer}
        </a>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Issued</span>
        <span>{formatTimestamp(data.timestamp)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500">IPFS CID</span>
        <span className="break-all text-right">{data.ipfsCid}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500">Hash</span>
        <span className="break-all text-right text-xs">{data.documentHash}</span>
      </div>
      {data.isRevoked && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          Revocation reason: {data.revokeReason || 'Not provided'}
        </div>
      )}
    </div>
    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
      Network: {CONFIG.NETWORK.chainName}
    </div>
  </div>
);
