const { ethers, network } = require("hardhat");

const fs = require("fs");
const path = require("path");

class SmartDeployment {
  constructor() {
    this.deploymentFile = path.join(__dirname, "deployment.json");
    this.sharedConfigDir = path.join(__dirname, "..", "shared-config");
    this.mode = process.env.DEPLOY_MODE || "reuse";
    this.forceDeploy = process.env.FORCE_DEPLOY === "true";
  }

  async shouldDeploy() {
    if (this.forceDeploy || this.mode === "force") {
      console.log("Force deploy mode active");
      return true;
    }

    if (fs.existsSync(this.deploymentFile)) {
      try {
        const deployment = JSON.parse(
          fs.readFileSync(this.deploymentFile, "utf8")
        );

        console.log("Contract already deployed:");
        console.log("Address:", deployment.contractAddress);
        console.log("Network:", deployment.network);
        console.log("Time:", deployment.timestamp);
        console.log("Block:", deployment.blockNumber);

        if (this.mode === "reuse") {
          console.log("Reuse mode: Using existing contract");
          this.updateSharedConfig(deployment);
          return false;
        }

        if (this.mode === "auto") {
          const deployTime = new Date(deployment.timestamp).getTime();
          const now = Date.now();
          const daysSinceDeploy = (now - deployTime) / (1000 * 60 * 60 * 24);

          if (daysSinceDeploy > 30) {
            console.log("Auto mode: Old contract (>30 days), deploying new...");
            return true;
          }

          console.log("Auto mode: Using existing contract");
          this.updateSharedConfig(deployment);
          return false;
        }
      } catch (error) {
        console.log("Error reading deployment file:", error.message);
        return true;
      }
    }

    console.log("No existing deployment found");
    return true;
  }

  async deployContract() {
    console.log("Deploying CertificateRegistry...");

    const CertificateRegistry = await ethers.getContractFactory(
      "CertificateRegistry"
    );
    const certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();

    const contractAddress = await certificateRegistry.getAddress();
    console.log("CertificateRegistry deployed to:", contractAddress);

    return {
      contractAddress,
      deployer: (await ethers.getSigners())[0].address,
      network: network.name,
      blockNumber: await ethers.provider.getBlockNumber(),
      timestamp: new Date().toISOString(),
      gasUsed: "16777216",
      gasPrice: "0.000000001875",
    };
  }

  saveDeployment(deployment) {
    fs.writeFileSync(this.deploymentFile, JSON.stringify(deployment, null, 2));
    console.log("Deployment saved to:", this.deploymentFile);
  }

  updateSharedConfig(deployment) {
    if (!fs.existsSync(this.sharedConfigDir)) {
      fs.mkdirSync(this.sharedConfigDir, { recursive: true });
    }

    const config = {
      contract: {
        address: deployment.contractAddress,
        network: deployment.network,
        chainId: network.config.chainId || 1337,
      },
      network: {
        rpcUrl: network.config.url || "http://localhost:8545",
        blockExplorer:
          deployment.network === "sepolia"
            ? "https://sepolia.etherscan.io"
            : network.config.blockExplorer || "https://localhost",
      },
      ipfs: {
        gateway: "http://localhost:8080",
      },
    };

    fs.writeFileSync(
      path.join(this.sharedConfigDir, "contract-config.json"),
      JSON.stringify(config, null, 2)
    );

    console.log("Shared config updated");
  }

  async main() {
    console.log("Smart deployment started");
    console.log("Mode:", this.mode);

    if (!(await this.shouldDeploy())) {
      console.log("Deployment skipped");
      return;
    }

    const deployment = await this.deployContract();
    this.saveDeployment(deployment);
    this.updateSharedConfig(deployment);

    console.log("Smart deployment completed");
  }
}

if (require.main === module) {
  const deployment = new SmartDeployment();
  deployment.main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
}

module.exports = SmartDeployment;
