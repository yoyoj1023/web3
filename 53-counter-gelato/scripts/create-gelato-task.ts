const { AutomateSDK } = require("@gelatonetwork/automate-sdk");
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  // 獲取部署的合約
  const counterAddress = "0x07f41d88674620679DF45d941F5741942e68F7da"; // 將此替換為您的合約地址
  const Counter = await hre.ethers.getContractFactory("Counter");
  const counter = Counter.attach(counterAddress);
  
  // 獲取簽名者
  const [deployer] = await hre.ethers.getSigners();
  
  // 初始化 Gelato SDK (for Optimism Sepolia)
  const automate = new AutomateSDK(11155420, deployer); // Optimism Sepolia chainId
  
  // 定義要自動執行的功能
  const increaseCountFunction = counter.interface.encodeFunctionData("increaseCount");
  
  // 創建時間觸發的任務 (每5分鐘執行一次)
  const { taskId, tx } = await automate.createTask({
    name: "Auto Increase Counter",
    execAddress: counterAddress,
    execSelector: "increaseCount()",
    execAbi: JSON.stringify(Counter.interface.fragments),
    execData: increaseCountFunction,
    interval: 5 * 60, // 每5分鐘執行一次，以秒為單位
    dedicated: false, // 使用共享的執行者網絡
    singleExec: false, // 持續執行，不僅僅一次
  });
  
  await tx.wait();
  console.log(`Gelato task created with ID: ${taskId}`);
  
  // 將 Gelato 執行者地址設置為授權地址
  const gelatoAddress = await automate.getGelatoAddress();
  const setGelatoTx = await counter.setGelato(gelatoAddress);
  await setGelatoTx.wait();
  console.log(`Set Gelato address (${gelatoAddress}) as authorized caller`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});