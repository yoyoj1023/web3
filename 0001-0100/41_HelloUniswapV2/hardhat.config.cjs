require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-dependency-compiler");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: "0.8.28",
  solidity: "0.5.16",
  networks: {
    optimismSepolia: {
      url: process.env.OP_SEPOLIA_RPC_URL_API_KEY,  
      accounts: [process.env.PRIVATE_KEY],  // 你的錢包私鑰
      timeout: 60000, // 設置為 60 秒
    },
    opS: {
      url: process.env.OP_SEPOLIA_RPC_URL_API_KEY,  
      accounts: [process.env.PRIVATE_KEY],  // 你的錢包私鑰
      timeout: 60000, // 設置為 60 秒
    }
  },
  dependencyCompiler: {
    paths: [
      "@uniswap/v2-core/contracts/UniswapV2Factory.sol",
      "@uniswap/v2-core/contracts/UniswapV2Pair.sol"
    ],
  }
};
