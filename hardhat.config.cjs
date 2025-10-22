require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  BASE_SEPOLIA_RPC_URL,
  BASE_SEPOLIA_RPC_HEADERS,
  BASE_MAINNET_RPC_URL,
  DEPLOYER_PRIVATE_KEY
} = process.env;

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
    overrides: {
      "contracts/BasePaymaster.sol": {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      "contracts/BaseManRegistry.sol": {
        version: "0.8.21",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    baseSepolia: {
      url: BASE_SEPOLIA_RPC_URL || "",
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      httpHeaders: (() => {
        if (!BASE_SEPOLIA_RPC_HEADERS) return undefined;
        try {
          return JSON.parse(BASE_SEPOLIA_RPC_HEADERS);
        } catch (error) {
          console.warn("[hardhat-config] Failed to parse BASE_SEPOLIA_RPC_HEADERS", error);
          return undefined;
        }
      })()
    },
    base: {
      url: BASE_MAINNET_RPC_URL || "",
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.BASESCAN_API_KEY || ""
  }
};
