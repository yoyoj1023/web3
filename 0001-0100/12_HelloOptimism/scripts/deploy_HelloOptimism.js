const hre = require("hardhat");

async function main() {
  const HelloOptimism = await hre.ethers.getContractFactory("HelloOptimism");
  const helloOptimism = await HelloOptimism.deploy();

  await helloOptimism.waitForDeployment();
  console.log("HelloOptimism deployed to: ", await helloOptimism.getAddress());
  console.log("helloOptimism message = ", await helloOptimism.message());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
