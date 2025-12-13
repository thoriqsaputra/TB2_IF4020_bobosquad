import { CONFIG } from '../config/config';

const BASE = CONFIG.BACKEND_URL;

export const requestNonce = async (address: string): Promise<string> => {
  const res = await fetch(`${BASE}/auth/nonce?address=${encodeURIComponent(address)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch nonce');
  }
  const data = await res.json();
  return data.nonce as string;
};

export const submitSignature = async (address: string, signature: string): Promise<string> => {
  const res = await fetch(`${BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, signature }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Signature verification failed');
  }
  const data = await res.json();
  return data.token as string;
};
