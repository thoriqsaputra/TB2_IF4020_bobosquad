const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CertificateRegistry contract...");

  const CertificateRegistry = await ethers.getContractFactory(
    "CertificateRegistry"
  );

  const [deployer] = await ethers.getSigners();

  console.log("Deployer address:", deployer.address);
  console.log(
    "Deployer balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  const certificateRegistry = await CertificateRegistry.deploy();

  await certificateRegistry.waitForDeployment();

  const contractAddress = await certificateRegistry.getAddress();

  console.log("CertificateRegistry deployed to:", contractAddress);
  console.log(
    "Transaction hash:",
    certificateRegistry.deploymentTransaction().hash
  );

  const issuer = await certificateRegistry.issuer();
  console.log("Contract issuer:", issuer);

  const certificateCount = await certificateRegistry.getCertificateCount();
  console.log("Initial certificate count:", certificateCount.toString());

  console.log("\nDeployment completed successfully!");
  console.log("\nDeployment Summary:");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Network: ${network.name}`);
  console.log(
    `   Block Number: ${
      certificateRegistry.deploymentTransaction().blockNumber
    }`
  );

  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: network.name,
    blockNumber: certificateRegistry.deploymentTransaction().blockNumber,
    timestamp: new Date().toISOString(),
    gasUsed: certificateRegistry.deploymentTransaction().gasLimit.toString(),
    gasPrice: ethers.formatEther(
      certificateRegistry.deploymentTransaction().gasPrice
    ),
  };

  console.log("\nDeployment info saved to deployment.json");

  const fs = require("fs");
  fs.writeFileSync("deployment.json", JSON.stringify(deploymentInfo, null, 2));

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
