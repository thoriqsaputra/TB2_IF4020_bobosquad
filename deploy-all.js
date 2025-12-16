#!/usr/bin/env node

/**
 * Master Deployment Script
 * Deploy smart contract + update FE/BE configs + start docker services
 * Usage: node deploy-all.js [network]
 * network: localhost | sepolia (default: localhost)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function execCommand(command, description) {
  log(COLORS.blue, `${description}...`);
  try {
    execSync(command, { stdio: "inherit", cwd: process.cwd() });
    log(COLORS.green, `${description} completed`);
  } catch (error) {
    log(COLORS.red, `${description} failed: ${error.message}`);
    process.exit(1);
  }
}

async function deployContract(network) {
  log(COLORS.yellow, `\nDeploying CertificateRegistry to ${network}...`);

  // Deploy using hardhat
  execCommand(
    `cd SmartContract && npx hardhat run scripts/deploy-smart.js --network ${network}`,
    "Deploy smart contract"
  );
}

function updateFrontendConfig(contractAddress, issuerAddress, network) {
  log(COLORS.yellow, "\nUpdating Frontend config...");

  const feConfigPath = path.join(
    __dirname,
    "Frontend",
    "src",
    "config",
    "config.ts"
  );
  let config = fs.readFileSync(feConfigPath, "utf8");

  const networkConfig = {
    localhost: {
      chainId: 1337,
      chainName: "Localhost",
      rpcUrl: "http://127.0.0.1:8545",
      blockExplorer: "https://localhost",
    },
    sepolia: {
      chainId: 11155111,
      chainName: "Sepolia",
      rpcUrl: `https://sepolia.infura.io/v3/${
        process.env.INFURA_PROJECT_ID || "YOUR_KEY"
      }`,
      blockExplorer: "https://sepolia.etherscan.io",
    },
  };

  const networkInfo = networkConfig[network];

  // Update network config
  config = config.replace(/chainId: \d+/, `chainId: ${networkInfo.chainId}`);
  config = config.replace(
    /chainName: ['"][^'"]+['"]/,
    `chainName: "${networkInfo.chainName}"`
  );
  config = config.replace(
    /rpcUrl: ['"][^'"]+['"]/,
    `rpcUrl: "${networkInfo.rpcUrl}"`
  );
  config = config.replace(
    /blockExplorer: ['"][^'"]+['"]/,
    `blockExplorer: "${networkInfo.blockExplorer}"`
  );

  // Update contract addresses
  config = config.replace(
    /CONTRACT_ADDRESS: ['"]0x[0-9a-fA-F]+['"]/,
    `CONTRACT_ADDRESS: "${contractAddress}"`
  );
  config = config.replace(
    /ISSUER_ADDRESS: ['"][^'"]+['"]/,
    `ISSUER_ADDRESS: "${
      issuerAddress || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    }"`
  );

  fs.writeFileSync(feConfigPath, config);
  log(COLORS.green, "✓ Frontend config updated");
}

function updateFrontendEnv(contractAddress, issuerAddress, network) {
  log(COLORS.yellow, "\nUpdating Frontend .env...");

  const feEnvPath = path.join(__dirname, "Frontend", ".env");

  const networkConfig = {
    localhost: {
      rpcUrl: "http://127.0.0.1:8545",
      ipfsGateway: "http://localhost:8080",
    },
    sepolia: {
      rpcUrl: `https://sepolia.infura.io/v3/${
        process.env.INFURA_PROJECT_ID || "YOUR_KEY"
      }`,
      ipfsGateway: "https://gateway.pinata.cloud",
    },
  };

  const networkInfo = networkConfig[network];

  const envContent = `# Frontend Environment Variables
VITE_CONTRACT_ADDRESS=${contractAddress}
VITE_RPC_URL=${networkInfo.rpcUrl}
VITE_NETWORK=${network}
VITE_BACKEND_URL=http://localhost:3000
VITE_IPFS_GATEWAY=${networkInfo.ipfsGateway}`;

  fs.writeFileSync(feEnvPath, envContent);
  log(COLORS.green, "✓ Frontend .env updated");
}

function updateBackendConfig(contractAddress, issuerAddress, network) {
  log(COLORS.yellow, "\nUpdating Backend config...");

  const beConfigPath = path.join(
    __dirname,
    "Backend",
    "src",
    "config",
    "contract.js"
  );
  let config = fs.readFileSync(beConfigPath, "utf8");

  const networkConfig = {
    localhost: {
      rpcUrl: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      rpcUrl: `https://sepolia.infura.io/v3/${
        process.env.INFURA_PROJECT_ID || "YOUR_KEY"
      }`,
      chainId: 11155111,
    },
  };

  const networkInfo = networkConfig[network];

  // Update contract config
  config = config.replace(
    /address:\s*'0x[0-9a-fA-F]+'/,
    `address: '${contractAddress}'`
  );
  config = config.replace(
    /rpcUrl:\s*'[^']+'/,
    `rpcUrl: '${networkInfo.rpcUrl}'`
  );
  config = config.replace(/chainId:\s*\d+/, `chainId: ${networkInfo.chainId}`);

  fs.writeFileSync(beConfigPath, config);
  log(COLORS.green, "✓ Backend config updated");
}

function copySharedConfigToBackend() {
  log(COLORS.yellow, "\n📋 Copying shared config to Backend...");

  const sourcePath = path.join(
    __dirname,
    "SmartContract",
    "shared-config",
    "contract-config.json"
  );
  const targetPath = path.join(
    __dirname,
    "Backend",
    "config",
    "contract-config.json"
  );

  if (fs.existsSync(sourcePath)) {
    const config = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
    fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
    log(COLORS.green, "✓ Shared config copied to Backend");
  } else {
    log(COLORS.red, "✗ Shared config not found!");
  }
}

function startDockerServices() {
  log(COLORS.yellow, "\nStarting Docker services...");

  // Check if docker-compose.yml exists
  const composePath = path.join(__dirname, "docker-compose.yml");
  if (!fs.existsSync(composePath)) {
    log(COLORS.red, "✗ docker-compose.yml not found!");
    return;
  }

  execCommand("docker-compose up -d", "Start Docker services");
}

async function main() {
  const network = process.argv[2] || "localhost";

  log(COLORS.blue, "==========================================");
  log(COLORS.blue, "MASTER DEPLOYMENT SCRIPT");
  log(COLORS.blue, `Network: ${network}`);
  log(COLORS.blue, "==========================================");

  // Step 1: Deploy smart contract
  await deployContract(network);

  // Step 2: Read deployment result
  log(COLORS.yellow, "\nReading deployment result...");
  const deploymentPath = path.join(
    __dirname,
    "SmartContract",
    "scripts",
    "deployment.json"
  );

  if (!fs.existsSync(deploymentPath)) {
    log(COLORS.red, "✗ Deployment result not found!");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  const contractAddress = deployment.contractAddress;
  const issuerAddress =
    deployment.issuerAddress ||
    deployment.deployer ||
    deployment.deployerAddress ||
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

  log(COLORS.green, `Contract deployed at: ${contractAddress}`);
  log(COLORS.green, `Issuer address: ${issuerAddress || "Not specified"}`);

  // Update configs
  updateFrontendConfig(contractAddress, issuerAddress, network);
  updateBackendConfig(contractAddress, issuerAddress, network);
  updateFrontendEnv(contractAddress, issuerAddress, network);

  // Copy shared config to Backend
  copySharedConfigToBackend();

  // Step 4: Start Docker services
  startDockerServices();

  // Step 5: Summary
  log(COLORS.green, "\nDEPLOYMENT COMPLETE!");
  log(COLORS.blue, "\nSUMMARY:");
  log(COLORS.blue, `Network: ${network}`);
  log(COLORS.blue, `Contract: ${contractAddress}`);
  log(COLORS.blue, `Issuer: ${issuerAddress}`);
  log(COLORS.blue, `Frontend: http://localhost:3000`);
  log(COLORS.blue, `Backend: http://localhost:3000`);
  log(COLORS.blue, "Docker: PostgreSQL + IPFS running");

  log(COLORS.yellow, "\nNext steps:");
  log(COLORS.yellow, "1. Update .env files with your credentials");
  log(COLORS.yellow, "2. Start frontend: cd Frontend && npm start");
  log(COLORS.yellow, "3. Start backend: cd Backend && npm start");
}

main().catch((error) => {
  log(COLORS.red, `Error: ${error.message}`);
  process.exit(1);
});
