import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import { config as dotenvConfig } from "dotenv";

// 載入環境變數
dotenvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    optimismSepolia: {
      url: process.env.OP_SEPOLIA_RPC_URL_API_KEY,  
      accounts: [process.env.PRIVATE_KEY || (() => { throw new Error("PRIVATE_KEY is not defined in the environment variables"); })()],  // 你的錢包私鑰
      timeout: 60000, // 設置為 60 秒
    }
  }
};

export default config;
