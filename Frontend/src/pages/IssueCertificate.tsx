import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { CertificateForm } from '../components/certificate/CertificateForm';
import { useWallet } from '../hooks/useWallet';

export const IssueCertificate: React.FC = () => {
  const { isIssuer } = useWallet();

  if (!isIssuer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5" />
          <div>
            <p className="font-semibold">Access restricted</p>
            <p className="text-sm">Only issuer address can issue certificates.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <CertificateForm />
    </div>
  );
};
