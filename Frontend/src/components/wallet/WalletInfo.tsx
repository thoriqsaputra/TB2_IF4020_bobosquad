import React from 'react';
import { Network, ShieldCheck } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { truncateAddress } from '../../utils/helpers';
import { CONFIG } from '../../config/config';

export const WalletInfo: React.FC = () => {
  const { address, chainId, isCorrectNetwork, isIssuer } = useWallet();

  if (!address) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
        <Network className="h-4 w-4 text-primary" />
        <span>{chainId === CONFIG.NETWORK.chainId ? CONFIG.NETWORK.chainName : `Chain ${chainId}`}</span>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <span>{truncateAddress(address)}</span>
      </div>
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1 ${
          isCorrectNetwork ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}
      >
        <span>{isCorrectNetwork ? 'Network OK' : 'Wrong Network'}</span>
      </div>
      {isIssuer && <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Issuer</span>}
    </div>
  );
};
