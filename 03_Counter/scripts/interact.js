const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 替換為你的合約地址
  const contractAddress_Counter = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // 替換為你的合約地址
  console.log("合約地址:", contractAddress);
  console.log("Counter 合約地址:", contractAddress_Counter);

  const HelloWorld = await hre.ethers.getContractFactory("HelloWorld");
  const Counter = await hre.ethers.getContractFactory("Counter");

  // 連接到已部署的合約
  const hello = await HelloWorld.attach(contractAddress);
  const counter = await Counter.attach(contractAddress_Counter);

  // 呼叫 getMessage 函數
  const message = await hello.getMessage();
  console.log("Contract Message:", message);

  console.log("增加計數器: ", await counter.increment());
  console.log("目前計數器: ", await counter.getCount());
  
  console.log("增加計數器: ");
  await counter.increment();
  console.log("目前計數器: ", await counter.getCount());

  console.log("減少計數器: ");
  await counter.decrement();
  console.log("目前計數器: ", await counter.getCount());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
