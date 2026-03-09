import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
import * as envEnc from "@chainlink/env-enc";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
// Try plain .env first (for testing)
dotenv.config();
// Then try encrypted env (for mainnet)
try {
  envEnc.config();
} catch {
  // Encrypted env not available, that's fine
}

let privateKey = process.env.PRIVATE_KEY || "";
let etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";
let sepoliaRpc = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia.publicnode.com";
let mainnetRpc = process.env.MAINNET_RPC_URL || "https://ethereum.publicnode.com";

// Validate private key format
if (privateKey) {
  const hex = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  if (hex.length === 64) {
    privateKey = "0x" + hex;
  } else {
    console.warn(`Warning: PRIVATE_KEY has ${hex.length} hex chars (expected 64 / 32 bytes). Ignoring.`);
    privateKey = "";
  }
}

console.log("Private key:", privateKey ? `${privateKey.substring(0, 6)}...` : "NOT FOUND");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: sepoliaRpc,
      chainId: 11155111,
      accounts: privateKey ? [privateKey] : [],
    },
    mainnet: {
      url: mainnetRpc,
      chainId: 1,
      accounts: privateKey ? [privateKey] : [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
