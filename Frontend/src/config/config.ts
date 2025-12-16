export const CONFIG = {
  NETWORK: {
    chainId: 1337, // Sepolia testnet
    chainName: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "https://localhost",
  },

  // Backend base URL for nonce auth or helper APIs (set to your backend endpoint)
  BACKEND_URL: "http://localhost:3000",
  CONTRACT_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // TODO: replace with deployed address
  ISSUER_ADDRESS: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // TODO: replace with actual issuer address
  SUPPORTED_FILE_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
  ],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};
