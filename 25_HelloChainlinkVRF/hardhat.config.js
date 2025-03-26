require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@chainlink/contracts");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID",
      accounts: ["YOUR_PRIVATE_KEY"],
    },
  },
};