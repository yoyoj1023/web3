const { ethers } = require("hardhat");

async function main() {
  // 1. 部署 LogicContractV1
  const LogicV1 = await ethers.getContractFactory("LogicContractV1");
  const logicV1 = await LogicV1.deploy();
  await logicV1.deployed();
  console.log("LogicContractV1 已部署到:", logicV1.address);

  // 2. 部署 Proxy 並傳入 LogicContractV1 的地址
  const ProxyContract = await ethers.getContractFactory("Proxy");
  const proxy = await ProxyContract.deploy(logicV1.address);
  await proxy.deployed();
  console.log("Proxy 已部署到:", proxy.address);

  // 3. 通過代理合約調用 LogicContractV1 的函數
  // 使用 LogicContractV1 的 ABI 與代理合約交互
  const proxyAsLogicV1 = await ethers.getContractAt("LogicContractV1", proxy.address);

  // 調用 setValue
  await proxyAsLogicV1.setValue(42);
  console.log("通過代理將值設置為 42");

  // 調用 getValue
  const valueV1 = await proxyAsLogicV1.getValue();
  console.log("通過代理從 V1 獲取的值:", valueV1.toString());

  // 4. 部署 LogicContractV2
  const LogicV2 = await ethers.getContractFactory("LogicContractV2");
  const logicV2 = await LogicV2.deploy();
  await logicV2.deployed();
  console.log("LogicContractV2 已部署到:", logicV2.address);

  // 5. 升級代理合約的邏輯到 LogicContractV2
  const proxyInstance = await ethers.getContractAt("Proxy", proxy.address);
  await proxyInstance.upgrade(logicV2.address);
  console.log("代理已升級到 LogicContractV2");

  // 6. 通過代理合約調用 LogicContractV2 的函數
  // 使用 LogicContractV2 的 ABI 與代理合約交互
  const proxyAsLogicV2 = await ethers.getContractAt("LogicContractV2", proxy.address);

  // 調用 setValue（假設 V2 的 setValue 會將值翻倍）
  await proxyAsLogicV2.setValue(33);
  console.log("通過代理將值設置為 33, V2 應將其翻倍為 66");

  // 調用 getValue
  const valueV2 = await proxyAsLogicV2.getValue();
  console.log("通過代理從 V2 獲取的值:", valueV2.toString());
}

// 執行腳本並處理錯誤
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });