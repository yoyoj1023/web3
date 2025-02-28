const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  const Contract_HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  console.log("Contract factory loaded.");

  const contract_HelloWorld = await Contract_HelloWorld.deploy();
  console.log("Deployment transaction sent.");

  await contract_HelloWorld.waitForDeployment();
  console.log("部署完成...");
  console.log("HelloWorld deployed to:", await contract_HelloWorld.getAddress());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
