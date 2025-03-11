const { ethers, upgrades } = require("hardhat");

async function main() {
  // Get contract factory
  const CounterV1 = await ethers.getContractFactory("CounterV1");

  // Deploy as upgradeable contract
  console.log("Deploying CounterV1...");
  const counterV1 = await upgrades.deployProxy(CounterV1, [], {
    initializer: "initialize",
  });

  await counterV1.waitForDeployment();
  console.log("CounterV1 deployed to:", counterV1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });