import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileCheck2, ScanLine, Shield } from 'lucide-react';
import { Button } from '../components/common/Button';
import { WalletConnect } from '../components/wallet/WalletConnect';
import { useWallet } from '../hooks/useWallet';

export const Home: React.FC = () => {
  const { isIssuer } = useWallet();

  return (
    <div className="bg-gradient-to-b from-white via-blue-50/50 to-white">
      <section className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-14 text-center md:flex-row md:items-start md:text-left">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-primary">
            <Shield className="h-4 w-4" />
            Secured on Blockchain
          </div>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
            Digital Certificates with Trust, Transparency, and Speed
          </h1>
          <p className="text-lg text-gray-600">
            Issue, verify, and revoke academic certificates powered by blockchain security and modern cryptography.
          </p>
          <div className="flex flex-wrap gap-3">
            {isIssuer && (
              <Link to="/issue">
                <Button>Issue Certificate</Button>
              </Link>
            )}
            <Link to="/verify">
              <Button variant="secondary">Verify Certificate</Button>
            </Link>
            <Link to="/transactions">
              <Button variant="ghost">View Transactions</Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>End-to-end encryption</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>On-chain verification</span>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>QR sharing</span>
          </div>
        </div>
        <div className="flex-1">
          <WalletConnect />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: FileCheck2, title: 'Issue Securely', desc: 'Encrypt documents and anchor hashes on-chain.' },
            { icon: ScanLine, title: 'Verify Instantly', desc: 'Public verification via ID or QR code.' },
            { icon: Shield, title: 'Revoke Transparently', desc: 'Revocations logged immutably with reasons.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
