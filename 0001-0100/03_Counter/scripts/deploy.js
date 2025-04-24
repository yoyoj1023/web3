const hre = require("hardhat");

async function main() {

  console.log("開始部屬...");
  const Contract_HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const Contract_Counter = await hre.ethers.getContractFactory("Counter");
  console.log("Contract factory 已載入");

  const contract_HelloWorld = await Contract_HelloWorld.deploy();
  await contract_HelloWorld.waitForDeployment();
  console.log("已發送 HelloWorld 部屬交易...");

  const contract_Counter = await Contract_Counter.deploy();
  await contract_Counter.waitForDeployment();
  console.log("已發送 Counter 部屬交易...");
  console.log("部署完成...");

  console.log("HelloWorld deployed to:", await contract_HelloWorld.getAddress());
  console.log("Counter deployed to:", await contract_Counter.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
