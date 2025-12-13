export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  signer?: unknown;
}

export interface NetworkInfo {
  chainId: number;
  name?: string;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  signNonceChallenge: (nonce: string) => Promise<string>;
  switchToSupportedNetwork: () => Promise<void>;
  authenticate: () => Promise<string>;
  authToken: string | null;
  authenticating: boolean;
  authError: string | null;
}
