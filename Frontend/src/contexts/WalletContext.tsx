import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../config/config';
import type { WalletContextValue } from '../types/wallet';
import { getBrowserProvider, switchToSupportedNetwork as requestSwitchNetwork } from '../services/web3Service';
import { requestNonce, submitSignature } from '../services/authService';

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const STORAGE_KEY = 'wallet_connected';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const reset = () => {
    setAddress(null);
    setChainId(null);
    setIsCorrectNetwork(false);
    setAuthToken(null);
    setAuthError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refreshNetworkStatus = async () => {
    try {
      const provider = await getBrowserProvider();
      const network = await provider.getNetwork();
      const correct = Number(network.chainId) === CONFIG.NETWORK.chainId;
      setChainId(Number(network.chainId));
      setIsCorrectNetwork(correct);
    } catch (err) {
      console.error('Network status error', err);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const provider = await getBrowserProvider();
      const network = await provider.getNetwork();
      const accounts: string[] = await provider.send('eth_requestAccounts', []);
      if (accounts?.length) {
        setAddress(accounts[0]);
        setChainId(Number(network.chainId));
        setIsCorrectNetwork(Number(network.chainId) === CONFIG.NETWORK.chainId);
        localStorage.setItem(STORAGE_KEY, 'true');
      }
    } catch (err) {
      console.error('Wallet connect error', err);
      reset();
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    reset();
  };

  const signNonceChallenge = async (nonce: string) => {
    if (!address) throw new Error('Wallet not connected');
    const provider = await getBrowserProvider();
    const signer = await provider.getSigner();
    return signer.signMessage(nonce);
  };

  const authenticate = async () => {
    if (!address) throw new Error('Wallet not connected');
    setAuthenticating(true);
    setAuthError(null);
    try {
      const nonce = await requestNonce(address);
      const signature = await signNonceChallenge(nonce);
      const token = await submitSignature(address, signature);
      setAuthToken(token);
      return token;
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
      throw err;
    } finally {
      setAuthenticating(false);
    }
  };

  const switchToSupportedNetwork = async () => {
    await requestSwitchNetwork();
    await refreshNetworkStatus();
  };

  useEffect(() => {
    const attachListeners = async () => {
      if (!(window as any).ethereum) return;
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          reset();
        } else {
          setAddress(accounts[0]);
        }
      });
      (window as any).ethereum.on('chainChanged', async () => {
        await refreshNetworkStatus();
      });
    };
    attachListeners();
  }, []);

  useEffect(() => {
    const eagerConnect = async () => {
      if (localStorage.getItem(STORAGE_KEY) !== 'true') return;
      try {
        const provider = await getBrowserProvider();
        const accounts: string[] = await provider.send('eth_accounts', []);
        if (accounts?.length) {
          const network = await provider.getNetwork();
          setAddress(accounts[0]);
          setChainId(Number(network.chainId));
          setIsCorrectNetwork(Number(network.chainId) === CONFIG.NETWORK.chainId);
        }
      } catch (err) {
        console.warn('Eager connect failed', err);
      }
    };
    eagerConnect();
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address,
      chainId,
      isConnecting,
      isCorrectNetwork,
      signer: undefined,
      connect,
      disconnect,
      signNonceChallenge,
      switchToSupportedNetwork,
      authenticate,
      authToken,
      authError,
      authenticating,
    }),
    [address, chainId, isConnecting, isCorrectNetwork, authToken, authError, authenticating],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWalletContext = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
};
