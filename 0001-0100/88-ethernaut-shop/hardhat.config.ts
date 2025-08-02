import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-toolbox";

// 載入環境變數
dotenvConfig();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      }
    ]
  },
  networks: {
    optimismSepolia: {
      url: process.env.OP_SEPOLIA_RPC_URL_API_KEY,  
      accounts: [process.env.PRIVATE_KEY || (() => { throw new Error("PRIVATE_KEY is not defined in the environment variables"); })()],  // 你的錢包私鑰
      timeout: 60000, // 設置為 60 秒
    },
    opS: {
      url: process.env.OP_SEPOLIA_RPC_URL_API_KEY,  
      accounts: [process.env.PRIVATE_KEY],  // 你的錢包私鑰
      timeout: 600000, // 設置為 600 秒
    }
  }
};

export default config;
