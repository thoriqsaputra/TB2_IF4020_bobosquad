class ContractConfig {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    // Environment variables (Vite prefix) - browser compatible
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    const rpcUrl = import.meta.env.VITE_RPC_URL;
    const network = import.meta.env.VITE_NETWORK;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const ipfsGateway = import.meta.env.VITE_IPFS_GATEWAY;

    return {
      contract: {
        address: contractAddress || "",
        network: network || "localhost",
        chainId: network === "localhost" ? 1337 : 11155111,
      },
      network: {
        rpcUrl: rpcUrl || "http://127.0.0.1:8545",
        blockExplorer:
          network === "localhost"
            ? "http://localhost:3000"
            : "https://sepolia.etherscan.io",
      },
      backend: {
        url: backendUrl || "http://localhost:3000",
      },
      ipfs: {
        gateway: ipfsGateway || "http://localhost:8080",
      },
    };
  }

  getContractAddress() {
    return this.config.contract.address;
  }

  getRpcUrl() {
    return this.config.network.rpcUrl;
  }

  getNetwork() {
    return this.config.contract.network;
  }

  getBackendUrl() {
    return this.config.backend.url;
  }

  getIpfsGateway() {
    return this.config.ipfs.gateway;
  }

  getBlockExplorerUrl() {
    return this.config.network.blockExplorer;
  }

  getChainId() {
    return this.config.contract.chainId;
  }

  getContractABI() {
    try {
      return JSON.parse(import.meta.env.VITE_CONTRACT_ABI || "[]");
    } catch {
      return [];
    }
  }

  getFullConfig() {
    return this.config;
  }

  isContractReady() {
    return (
      this.config.contract.address && this.config.contract.address.length > 0
    );
  }
}

const contractConfig = new ContractConfig();

export default contractConfig;
