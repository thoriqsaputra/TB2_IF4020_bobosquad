export const ROUTES = {
  home: '/',
  issue: '/issue',
  revoke: '/revoke',
  view: '/certificate',
  verify: '/verify',
  transactions: '/transactions',
};

export const STATUS_BADGES = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  revoked: { label: 'Revoked', color: 'bg-red-100 text-red-700' },
};

export const TX_STATUS_STYLES: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-700',
};
