export const CONFIG = {
  NETWORK: {
    chainId: 11155111, // Sepolia testnet
    chainName: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    blockExplorer: 'https://sepolia.etherscan.io',
  },

  // Backend base URL for nonce auth or helper APIs (set to your backend endpoint)
  BACKEND_URL: 'http://localhost:3000',
  CONTRACT_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: replace with deployed address
  ISSUER_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: replace with actual issuer address
  SUPPORTED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
};
