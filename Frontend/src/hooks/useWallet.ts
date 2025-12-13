import { useMemo } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { isIssuer } from '../utils/validation';

export const useWallet = () => {
  const wallet = useWalletContext();

  const roleFlags = useMemo(
    () => ({
      isIssuer: isIssuer(wallet.address || ''),
      isConnected: Boolean(wallet.address),
    }),
    [wallet.address],
  );

  return { ...wallet, ...roleFlags };
};
