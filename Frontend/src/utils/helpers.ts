import { CONFIG } from '../config/config';

export const truncateAddress = (address?: string, size = 4) => {
  if (!address) return '';
  return `${address.slice(0, 2 + size)}...${address.slice(-size)}`;
};

export const formatTimestamp = (ts?: number) => {
  if (!ts) return '-';
  return new Date(ts * 1000).toLocaleString();
};

export const formatDateInput = (value?: string) => {
  if (!value) return '';
  return new Date(value).toISOString().split('T')[0];
};

export const getExplorerTx = (hash?: string) =>
  hash ? `${CONFIG.NETWORK.blockExplorer}/tx/${hash}` : '#';

export const getExplorerAddress = (address?: string) =>
  address ? `${CONFIG.NETWORK.blockExplorer}/address/${address}` : '#';

export const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};
