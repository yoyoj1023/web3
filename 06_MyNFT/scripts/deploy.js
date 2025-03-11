const { ethers } = require("hardhat");

async function main() {
  // Get contract factory
  const MyNFT = await ethers.getContractFactory("MyNFT");
  
  // Deploy contract
  console.log("Deploying MyNFT contract...");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment();
  
  console.log("MyNFT deployed to:", myNFT.address);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });