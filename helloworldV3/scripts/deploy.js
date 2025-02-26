const hre = require("hardhat");

async function main() {
  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  
  console.log("部署開始...");
  const hello = await HelloWorld.deploy();
  await hello.waitForDeployment();

  console.log("HelloWorld deployed to:", await hello.getAddress());
  console.log("部署結束...");

  const msg = await HelloWorld.attach(await hello.getAddress());
  console.log("msg = ", await msg.getMessage());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
