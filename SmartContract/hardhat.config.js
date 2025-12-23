require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env.local") });
require("dotenv").config();

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const INFURA_KEY = process.env.INFURA_KEY || "";
const RPC_URL =
  process.env.RPC_URL ||
  (INFURA_KEY ? `https://sepolia.infura.io/v3/${INFURA_KEY}` : "");
const isValidPk = /^0x[0-9a-fA-F]{64}$/.test(PRIVATE_KEY);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: RPC_URL || "https://sepolia.infura.io/v3/",
      accounts: isValidPk ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
