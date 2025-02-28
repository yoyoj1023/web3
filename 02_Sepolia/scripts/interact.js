const hre = require("hardhat");

async function main() {
  const contractAddress = "0x7dcff9f9AF4ee2Abb4D45a8dE154DC9C272a999e"; // 替換為你的合約地址
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
