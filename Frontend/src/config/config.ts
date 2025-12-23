export const CONFIG = {
  NETWORK: {
    chainId: 11155111,
    chainName: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/4fc554a498ed4f8e8abbf35c36318bbc",
    blockExplorer: "https://sepolia.etherscan.io",
  },

  // Backend base URL for nonce auth or helper APIs (set to your backend endpoint)
  BACKEND_URL: "http://localhost:3000",
  CONTRACT_ADDRESS: "0x4B45cb768531139A405071B58978a792317d8433",
  ISSUER_ADDRESS: "0x24E2C6804642aAb8c509fb7c1a95CAD030CDcd66",
  SUPPORTED_FILE_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
  ],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};
