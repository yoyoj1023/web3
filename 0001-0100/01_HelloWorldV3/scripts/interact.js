const hre = require("hardhat");

async function main() {
  const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // 替換為你的合約地址
  console.log("合約地址:", contractAddress);

  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");

  // 連接到已部署的合約
  const hello = await HelloWorld.attach(contractAddress);

  // 呼叫 getMessage 函數
  const message = await hello.getMessage();
  console.log("Contract Message:", message);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
