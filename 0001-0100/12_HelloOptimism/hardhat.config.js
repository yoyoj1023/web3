require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    optimismSepolia: {
      url: "https://sepolia.optimism.io",  //可換成 Alchemy 或 Infura 的 RPC URL
      accounts: [process.env.PRIVATE_KEY]  // 你的錢包私鑰
    }
  }
};
