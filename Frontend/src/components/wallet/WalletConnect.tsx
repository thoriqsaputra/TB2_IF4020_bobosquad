import React from 'react';
import { AlertTriangle, PlugZap } from 'lucide-react';
import { Button } from '../common/Button';
import { useWallet } from '../../hooks/useWallet';
import { CONFIG } from '../../config/config';

export const WalletConnect: React.FC = () => {
  const {
    connect,
    disconnect,
    isConnecting,
    isConnected,
    address,
    isCorrectNetwork,
    switchToSupportedNetwork,
    authenticate,
    authToken,
    authenticating,
    authError,
  } = useWallet();

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-primary">
          <PlugZap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Wallet Connection</p>
          <p className="text-xs text-gray-600">
            {isConnected ? 'Wallet connected' : 'Connect MetaMask to start'}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {isConnected ? (
            <>
              {!isCorrectNetwork && (
                <Button variant="ghost" onClick={switchToSupportedNetwork}>
                  Switch Network
                </Button>
              )}
              <Button variant="ghost" onClick={authenticate} loading={authenticating}>
                {authToken ? 'Re-auth' : 'Auth'}
              </Button>
              <Button variant="ghost" onClick={disconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={connect} loading={isConnecting}>
              Connect
            </Button>
          )}
        </div>
      </div>
      {isConnected && !isCorrectNetwork && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          <div>
            <p className="font-semibold">Wrong network</p>
            <p>Switch to {CONFIG.NETWORK.chainName} to continue.</p>
          </div>
        </div>
      )}
      {isConnected && address && (
        <div className="mt-3 space-y-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
          <div>Address: {address}</div>
          <div>Status: {authToken ? `Authenticated (token: ${authToken})` : 'Not authenticated'}</div>
          {authError && <div className="text-red-600">Auth error: {authError}</div>}
        </div>
      )}
    </div>
  );
};
