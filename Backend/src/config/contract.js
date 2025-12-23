import fs from "fs";
import path from "path";

class ContractConfig {
  constructor() {
    this.config = null;
    this.loadConfig();
  }

  loadConfig() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const rpcUrl = process.env.RPC_URL;
    const ipfsGateway = process.env.IPFS_GATEWAY;

    let sharedConfig = {};
    const sharedConfigPath = path.join(
      process.cwd(),
      "config",
      "contract-config.json"
    );

    if (fs.existsSync(sharedConfigPath)) {
      try {
        sharedConfig = JSON.parse(fs.readFileSync(sharedConfigPath, "utf8"));
      } catch (error) {
        console.warn("Could not read shared config:", error.message);
      }
    }

    const chainId =
      sharedConfig.contract?.chainId !== undefined
        ? sharedConfig.contract.chainId
        : 11155111;

    this.config = {
      contract: {
        address: contractAddress || sharedConfig.contract?.address || "",
        network: sharedConfig.contract?.network || "sepolia",
        chainId,
      },
      network: {
        rpcUrl:
          rpcUrl ||
          sharedConfig.network?.rpcUrl ||
          "https://sepolia.infura.io/v3/YOUR_KEY",
        blockExplorer:
          Number(chainId) === 11155111
            ? "https://sepolia.etherscan.io"
            : sharedConfig.network?.blockExplorer ||
              "https://sepolia.etherscan.io",
      },
      ipfs: {
        gateway:
          ipfsGateway ||
          sharedConfig.ipfs?.gateway ||
          "https://gateway.pinata.cloud",
      },
    };

    if (!this.config.contract.address) {
      console.warn("CONTRACT_ADDRESS not set. Some features may not work.");
    }

    console.log("Contract Configuration loaded:");
    console.log("Address:", this.config.contract.address || "NOT SET");
    console.log("Network:", this.config.contract.network);
    console.log("RPC URL:", this.config.network.rpcUrl);
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

  getIpfsGateway() {
    return this.config.ipfs.gateway;
  }

  getBlockExplorerUrl() {
    return this.config.network.blockExplorer;
  }

  getFullConfig() {
    return this.config;
  }
}

const contractConfig = new ContractConfig();

export default contractConfig;
