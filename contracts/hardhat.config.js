// Hardhat configuration for deploying and testing ArcTradeEscrow
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const ARC_TESTNET_RPC = process.env.ARC_TESTNET_RPC || "https://rpc.testnet.arc.network";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ARCSCAN_API_KEY = process.env.ARCSCAN_API_KEY || "";

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
    hardhat: {},
    arcTestnet: {
      url: ARC_TESTNET_RPC,
      chainId: 42198, // Dedicated Arc Testnet Chain ID
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
    arcMainnet: {
      url: process.env.ARC_MAINNET_RPC || "https://rpc.mainnet.arc.network",
      chainId: 42199, // Dedicated Arc Mainnet Chain ID
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: {
      arcTestnet: ARCSCAN_API_KEY,
    },
    customChains: [
      {
        network: "arcTestnet",
        chainId: 42198,
        urls: {
          apiURL: "https://explorer.testnet.arc.network/api",
          browserURL: "https://explorer.testnet.arc.network"
        }
      }
    ]
  }
};
