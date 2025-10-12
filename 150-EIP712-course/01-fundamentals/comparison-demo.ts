/**
 * EIP712 vs 傳統簽名對比演示
 * 
 * 這個腳本展示了傳統簽名和 EIP712 結構化簽名的區別
 * 運行方式：npx ts-node 01-fundamentals/comparison-demo.ts
 */

import { ethers } from "ethers";

// 創建一個測試錢包
const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new ethers.Wallet(PRIVATE_KEY);

console.log("==========================================");
console.log("🔐 EIP712 vs 傳統簽名對比演示");
console.log("==========================================\n");
console.log(`簽名者地址: ${wallet.address}\n`);

/**
 * 演示 1: 傳統簽名方式
 */
async function traditionalSigningDemo() {
  console.log("📝 方式 1: 傳統簽名 (eth_sign / personal_sign)");
  console.log("─────────────────────────────────────────\n");

  // 要簽名的數據
  const transferData = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100,
    deadline: 1234567890,
  };

  // 方法 A: 直接簽名字串（不安全！）
  const message1 = `Transfer ${transferData.amount} tokens to ${transferData.to}`;
  const signature1 = await wallet.signMessage(message1);

  console.log("簽名內容（使用者看到的）:");
  console.log(`  "${message1}"\n`);

  console.log("實際簽名的數據（十六進制）:");
  const messageBytes = ethers.toUtf8Bytes(message1);
  console.log(`  ${ethers.hexlify(messageBytes)}\n`);

  console.log("簽名結果:");
  console.log(`  ${signature1}\n`);

  // 方法 B: 拼接字串（仍然不安全）
  const message2 = `to:${transferData.to},amount:${transferData.amount},deadline:${transferData.deadline}`;
  const signature2 = await wallet.signMessage(message2);

  console.log("❌ 傳統簽名的問題:");
  console.log("  1. 格式不固定：可以用任意字串拼接方式");
  console.log("  2. 無類型信息：不知道 '100' 是字串還是數字");
  console.log("  3. 缺乏結構：解析困難，容易出錯");
  console.log("  4. 無域隔離：同樣的簽名可能被其他 DApp 重放");
  console.log("  5. 盲簽風險：使用者看到的和實際簽的可能不一致\n");

  return { message: message1, signature: signature1 };
}

/**
 * 演示 2: EIP712 結構化簽名
 */
async function eip712SigningDemo() {
  console.log("✅ 方式 2: EIP712 結構化簽名");
  console.log("─────────────────────────────────────────\n");

  // 1. 定義 Domain（應用身份）
  const domain = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111",
  };

  console.log("Domain（應用身份）:");
  console.log(JSON.stringify(domain, null, 2));
  console.log();

  // 2. 定義 Types（數據結構）
  const types = {
    Transfer: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  console.log("Types（數據結構定義）:");
  console.log(JSON.stringify(types, null, 2));
  console.log();

  // 3. 定義 Value（實際數據）
  const value = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100n,
    deadline: 1234567890n,
  };

  console.log("Value（實際數據）:");
  console.log(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  console.log();

  // 4. 簽名
  const signature = await wallet.signTypedData(domain, types, value);

  console.log("簽名結果:");
  console.log(`  ${signature}\n`);

  // 5. 展示編碼細節
  console.log("編碼細節:");

  // Domain Separator
  const domainTypeHash = ethers.id(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );
  console.log(`  Domain TypeHash: ${domainTypeHash}`);

  const domainSeparator = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        domainTypeHash,
        ethers.id(domain.name),
        ethers.id(domain.version),
        domain.chainId,
        domain.verifyingContract,
      ]
    )
  );
  console.log(`  Domain Separator: ${domainSeparator}\n`);

  // Type Hash
  const transferTypeHash = ethers.id(
    "Transfer(address to,uint256 amount,uint256 deadline)"
  );
  console.log(`  Transfer TypeHash: ${transferTypeHash}`);

  // Struct Hash
  const structHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "address", "uint256", "uint256"],
      [transferTypeHash, value.to, value.amount, value.deadline]
    )
  );
  console.log(`  Struct Hash: ${structHash}\n`);

  // Digest（最終簽名的數據）
  const digest = ethers.keccak256(
    ethers.concat([
      "0x1901",
      domainSeparator,
      structHash,
    ])
  );
  console.log(`  Final Digest: ${digest}\n`);

  console.log("✅ EIP712 的優勢:");
  console.log("  1. 結構明確：有清楚的類型定義");
  console.log("  2. 類型安全：amount 是 uint256，不是字串");
  console.log("  3. 可讀性強：錢包能清楚顯示每個字段");
  console.log("  4. 域隔離：綁定到特定應用和鏈");
  console.log("  5. 標準化：所有實現使用相同的編碼方式\n");

  return { domain, types, value, signature, digest };
}

/**
 * 演示 3: 簽名驗證對比
 */
async function verificationDemo(
  traditionalData: { message: string; signature: string },
  eip712Data: any
) {
  console.log("🔍 簽名驗證對比");
  console.log("─────────────────────────────────────────\n");

  // 驗證傳統簽名
  console.log("傳統簽名驗證:");
  const recoveredAddr1 = ethers.verifyMessage(
    traditionalData.message,
    traditionalData.signature
  );
  console.log(`  恢復的地址: ${recoveredAddr1}`);
  console.log(`  匹配原地址: ${recoveredAddr1 === wallet.address ? "✅" : "❌"}\n`);

  // 驗證 EIP712 簽名
  console.log("EIP712 簽名驗證:");
  const recoveredAddr2 = ethers.verifyTypedData(
    eip712Data.domain,
    eip712Data.types,
    eip712Data.value,
    eip712Data.signature
  );
  console.log(`  恢復的地址: ${recoveredAddr2}`);
  console.log(`  匹配原地址: ${recoveredAddr2 === wallet.address ? "✅" : "❌"}\n`);
}

/**
 * 演示 4: 重放攻擊防護
 */
function replayAttackDemo() {
  console.log("🛡️  重放攻擊防護演示");
  console.log("─────────────────────────────────────────\n");

  console.log("場景: 攻擊者試圖在不同環境重放簽名\n");

  console.log("傳統簽名:");
  console.log("  ❌ 缺乏應用標識 → 可以在任何 DApp 重放");
  console.log("  ❌ 缺乏鏈 ID → 可以在不同鏈上重放");
  console.log("  ❌ 缺乏合約綁定 → 可以提交到任何合約\n");

  console.log("EIP712 簽名:");
  console.log("  ✅ Domain name → 只能在 'MyToken' 應用使用");
  console.log("  ✅ chainId: 1 → 只能在以太坊主網使用");
  console.log("  ✅ verifyingContract → 只能在指定合約驗證");
  console.log("  ✅ 三重防護，徹底防止重放攻擊\n");
}

/**
 * 演示 5: 錢包顯示對比
 */
function walletDisplayDemo() {
  console.log("👁️  錢包顯示對比");
  console.log("─────────────────────────────────────────\n");

  console.log("傳統簽名在錢包中的顯示:");
  console.log("┌─────────────────────────────────────┐");
  console.log("│ 簽名請求                             │");
  console.log("├─────────────────────────────────────┤");
  console.log("│ 訊息:                                │");
  console.log("│ Transfer 100 tokens to 0x742d...    │");
  console.log("│                                     │");
  console.log("│ ⚠️  你真的知道這代表什麼嗎？        │");
  console.log("└─────────────────────────────────────┘\n");

  console.log("EIP712 在錢包中的顯示:");
  console.log("┌─────────────────────────────────────┐");
  console.log("│ 簽名請求 - MyToken                   │");
  console.log("├─────────────────────────────────────┤");
  console.log("│ Domain:                             │");
  console.log("│   name: MyToken                     │");
  console.log("│   version: 1                        │");
  console.log("│   chainId: 1 (Ethereum)             │");
  console.log("│                                     │");
  console.log("│ Transfer:                           │");
  console.log("│   to: 0x742d35Cc... (address)       │");
  console.log("│   amount: 100 (uint256)             │");
  console.log("│   deadline: 1234567890 (uint256)    │");
  console.log("│                                     │");
  console.log("│ ✅ 每個字段都清晰明確                │");
  console.log("└─────────────────────────────────────┘\n");
}

/**
 * 主函數
 */
async function main() {
  try {
    // 演示 1: 傳統簽名
    const traditionalData = await traditionalSigningDemo();

    console.log("\n");

    // 演示 2: EIP712 簽名
    const eip712Data = await eip712SigningDemo();

    console.log("\n");

    // 演示 3: 驗證對比
    await verificationDemo(traditionalData, eip712Data);

    console.log("\n");

    // 演示 4: 重放攻擊防護
    replayAttackDemo();

    console.log("\n");

    // 演示 5: 錢包顯示對比
    walletDisplayDemo();

    console.log("==========================================");
    console.log("🎓 總結");
    console.log("==========================================\n");
    console.log("EIP712 通過以下方式提升安全性和用戶體驗:");
    console.log("  1. 結構化數據 - 明確的類型定義");
    console.log("  2. 域隔離 - 防止跨應用/跨鏈重放");
    console.log("  3. 標準化編碼 - 一致的實現方式");
    console.log("  4. 更好的 UX - 錢包能清楚展示簽名內容");
    console.log("  5. 更高的安全性 - 減少盲簽和釣魚風險\n");

    console.log("下一步: 學習 EIP712 的詳細編碼流程");
    console.log("查看: ../02-encoding-flow/\n");

  } catch (error) {
    console.error("錯誤:", error);
    process.exit(1);
  }
}

// 如果直接運行此文件，則執行 main
if (require.main === module) {
  main();
}

export { traditionalSigningDemo, eip712SigningDemo, verificationDemo };

