import * as hre from "hardhat";

async function main() {
  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = await Counter.deploy();

  await counter.waitForDeployment();
  
  const counterAddress = await counter.getAddress();
  console.log(`Counter deployed to: ${counterAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});