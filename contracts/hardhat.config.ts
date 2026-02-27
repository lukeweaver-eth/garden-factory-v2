import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env from the Garden root (two levels up from contracts/)
const envPath = resolve(__dirname, "../../.env");
let privateKey = "";
let etherscanApiKey = "";
let sepoliaRpc = "https://ethereum-sepolia.publicnode.com";
let mainnetRpc = "https://ethereum.publicnode.com";

try {
  const envContent = readFileSync(envPath, "utf8");

  // Strip surrounding quotes from a .env value (handles "value" or 'value')
  const strip = (s: string) => s.trim().replace(/^['"]|['"]$/g, "");

  const pkMatch = envContent.match(/^PRIVATE_KEY=(.+)$/m);
  if (pkMatch) {
    const parsed = strip(pkMatch[1]);
    const hex = parsed.startsWith("0x") ? parsed.slice(2) : parsed;
    if (hex.length === 64) {
      privateKey = "0x" + hex;
    } else {
      console.warn(`Warning: PRIVATE_KEY has ${hex.length} hex chars (expected 64 / 32 bytes). Skipping.`);
    }
  }

  const apiMatch = envContent.match(/^ETHERSCAN_API_KEY=(.+)$/m);
  if (apiMatch) etherscanApiKey = strip(apiMatch[1]);

  const sepoliaMatch = envContent.match(/^SEPOLIA_RPC_URL=(.+)$/m);
  if (sepoliaMatch) sepoliaRpc = strip(sepoliaMatch[1]);

  const mainnetMatch = envContent.match(/^MAINNET_RPC_URL=(.+)$/m);
  if (mainnetMatch) mainnetRpc = strip(mainnetMatch[1]);
} catch (e) {
  console.warn("Warning: Could not load .env file from", envPath);
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
