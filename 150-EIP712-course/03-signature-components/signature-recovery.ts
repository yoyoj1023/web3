/**
 * 簽名和地址恢復完整演示
 * 
 * 展示 v, r, s 組件的提取和使用
 * 運行方式：npx ts-node 03-signature-components/signature-recovery.ts
 */

import { ethers } from "ethers";

const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

function printSection(title: string) {
  console.log("\n" + "=".repeat(70));
  console.log(`  ${title}`);
  console.log("=".repeat(70) + "\n");
}

/**
 * 演示 1: 基本簽名和組件提取
 */
async function demo1_BasicSignature() {
  printSection("演示 1: 基本簽名和組件提取");

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const message = "Hello, EIP712!";

  console.log("簽名者地址:", wallet.address);
  console.log("訊息:", message);

  // 簽名
  const signature = await wallet.signMessage(message);
  console.log("\n完整簽名 (hex):", signature);
  console.log("長度:", (signature.length - 2) / 2, "bytes");

  // 使用 ethers.js 分解簽名
  const sig = ethers.Signature.from(signature);
  
  console.log("\n📊 簽名組件:");
  console.log("─".repeat(70));
  console.log("r (32 bytes):", sig.r);
  console.log("s (32 bytes):", sig.s);
  console.log("v (1 byte):  ", sig.v);
  console.log("yParity:     ", sig.yParity);
  
  // 手動分解（展示底層邏輯）
  const sigBytes = ethers.getBytes(signature);
  const r = ethers.hexlify(sigBytes.slice(0, 32));
  const s = ethers.hexlify(sigBytes.slice(32, 64));
  const v = sigBytes[64];
  
  console.log("\n🔍 手動分解:");
  console.log("─".repeat(70));
  console.log("r:", r);
  console.log("s:", s);
  console.log("v:", v);
  
  console.log("\n✅ 兩種方法結果一致:", 
    sig.r === r && sig.s === s && sig.v === v ? "是" : "否");
}

/**
 * 演示 2: 地址恢復
 */
async function demo2_AddressRecovery() {
  printSection("演示 2: 地址恢復");

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const message = "Recover my address!";
  
  console.log("原始簽名者:", wallet.address);
  console.log("訊息:", message);

  // 簽名
  const signature = await wallet.signMessage(message);
  const messageHash = ethers.hashMessage(message);
  
  console.log("\n訊息哈希:", messageHash);
  console.log("簽名:", signature);

  // 方法 1: 使用完整簽名恢復
  console.log("\n方法 1: 使用完整簽名");
  console.log("─".repeat(70));
  const recovered1 = ethers.recoverAddress(messageHash, signature);
  console.log("恢復的地址:", recovered1);
  console.log("匹配:", recovered1 === wallet.address ? "✅" : "❌");

  // 方法 2: 使用 v, r, s 恢復
  console.log("\n方法 2: 使用 v, r, s 組件");
  console.log("─".repeat(70));
  const sig = ethers.Signature.from(signature);
  const recovered2 = ethers.recoverAddress(messageHash, {
    r: sig.r,
    s: sig.s,
    v: sig.v
  });
  console.log("恢復的地址:", recovered2);
  console.log("匹配:", recovered2 === wallet.address ? "✅" : "❌");

  // 方法 3: 使用 verifyMessage（便捷方法）
  console.log("\n方法 3: 使用 verifyMessage");
  console.log("─".repeat(70));
  const recovered3 = ethers.verifyMessage(message, signature);
  console.log("恢復的地址:", recovered3);
  console.log("匹配:", recovered3 === wallet.address ? "✅" : "❌");
}

/**
 * 演示 3: EIP712 簽名的組件
 */
async function demo3_EIP712Components() {
  printSection("演示 3: EIP712 簽名的組件");

  const wallet = new ethers.Wallet(PRIVATE_KEY);

  const domain = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  const types = {
    Transfer: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ]
  };

  const value = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100n
  };

  console.log("Domain:", JSON.stringify(domain, null, 2));
  console.log("\nValue:", JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  // 簽名
  const signature = await wallet.signTypedData(domain, types, value);
  const sig = ethers.Signature.from(signature);

  console.log("\n📊 EIP712 簽名組件:");
  console.log("─".repeat(70));
  console.log("r:", sig.r);
  console.log("s:", sig.s);
  console.log("v:", sig.v);

  // 恢復地址
  const recovered = ethers.verifyTypedData(domain, types, value, signature);
  console.log("\n恢復的地址:", recovered);
  console.log("原始地址:  ", wallet.address);
  console.log("匹配:", recovered === wallet.address ? "✅" : "❌");

  // 計算 digest 並手動恢復
  const digest = ethers.TypedDataEncoder.hash(domain, types, value);
  console.log("\nDigest:", digest);
  
  const recoveredFromDigest = ethers.recoverAddress(digest, signature);
  console.log("從 digest 恢復:", recoveredFromDigest);
  console.log("匹配:", recoveredFromDigest === wallet.address ? "✅" : "❌");
}

/**
 * 演示 4: v 值的意義
 */
async function demo4_VValueMeaning() {
  printSection("演示 4: v 值的意義（恢復標識符）");

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const message = "Test v value";

  const signature = await wallet.signMessage(message);
  const sig = ethers.Signature.from(signature);

  console.log("簽名組件:");
  console.log("  v:", sig.v);
  console.log("  yParity:", sig.yParity);

  console.log("\nv 值的含義:");
  console.log("─".repeat(70));
  console.log("在以太坊中，v 通常是 27 或 28");
  console.log("  v = 27 → yParity = 0 (偶數 y)");
  console.log("  v = 28 → yParity = 1 (奇數 y)");
  
  console.log("\n為什麼需要 v？");
  console.log("  給定 r（x 坐標），橢圓曲線上有兩個可能的點：(x, y) 和 (x, -y)");
  console.log("  v 告訴我們應該使用哪一個");

  // 演示：錯誤的 v 會導致恢復失敗
  console.log("\n實驗：使用錯誤的 v 值");
  console.log("─".repeat(70));
  
  const messageHash = ethers.hashMessage(message);
  const wrongV = sig.v === 27 ? 28 : 27;
  
  try {
    const wrongRecovery = ethers.recoverAddress(messageHash, {
      r: sig.r,
      s: sig.s,
      v: wrongV
    });
    console.log("使用錯誤 v 恢復的地址:", wrongRecovery);
    console.log("與原地址相同:", wrongRecovery === wallet.address ? "✅" : "❌");
    console.log("\n💡 不同的 v 值會恢復出不同的地址！");
  } catch (error) {
    console.log("使用錯誤的 v 值導致錯誤:", error);
  }
}

/**
 * 演示 5: s 值的範圍（防止可塑性）
 */
async function demo5_SValueRange() {
  printSection("演示 5: s 值的範圍（防止簽名可塑性）");

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  const message = "Test s value";
  
  const signature = await wallet.signMessage(message);
  const sig = ethers.Signature.from(signature);

  // secp256k1 曲線的階
  const N = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
  const HALF_N = N / 2n;

  const sValue = BigInt(sig.s);

  console.log("簽名的 s 值:");
  console.log("  s:", sig.s);
  console.log("  s (decimal):", sValue.toString());
  
  console.log("\n曲線參數:");
  console.log("  N (曲線的階):", N.toString());
  console.log("  N/2:          ", HALF_N.toString());

  console.log("\n檢查 s 值範圍:");
  console.log("─".repeat(70));
  console.log("  s <= N/2:", sValue <= HALF_N ? "✅ 符合 EIP-2" : "❌ 不符合");

  if (sValue <= HALF_N) {
    console.log("\n✅ 這個簽名是規範化的（canonical）");
    console.log("   ethers.js 自動確保 s 在低半部分");
  } else {
    console.log("\n⚠️  這個簽名的 s 值在高半部分");
    console.log("   可以通過 s' = N - s 轉換為規範形式");
  }

  // 演示可塑性
  console.log("\n簽名可塑性演示:");
  console.log("─".repeat(70));
  console.log("原始簽名的 s:", sig.s);
  
  const altS = N - sValue;
  console.log("可塑變體的 s:", ethers.toBeHex(altS, 32));
  console.log("\n💡 兩個不同的 s 值可能產生相同的恢復地址");
  console.log("   這就是為什麼需要 EIP-2 限制 s 的範圍！");
}

/**
 * 演示 6: 不同訊息產生不同簽名
 */
async function demo6_DifferentMessages() {
  printSection("演示 6: 不同訊息產生完全不同的簽名");

  const wallet = new ethers.Wallet(PRIVATE_KEY);
  
  const messages = [
    "Hello",
    "Hello!",  // 只差一個字符
    "hello"    // 只是大小寫不同
  ];

  console.log("簽名者:", wallet.address);
  console.log("\n對比不同訊息的簽名:\n");

  for (const msg of messages) {
    const sig = ethers.Signature.from(await wallet.signMessage(msg));
    console.log(`訊息: "${msg}"`);
    console.log(`  r: ${sig.r.slice(0, 16)}...`);
    console.log(`  s: ${sig.s.slice(0, 16)}...`);
    console.log(`  v: ${sig.v}`);
    console.log();
  }

  console.log("💡 觀察: 即使訊息只有微小差異，簽名也完全不同");
  console.log("   這確保了簽名和訊息的強綁定關係");
}

/**
 * 主函數
 */
async function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║                                                                  ║");
  console.log("║          簽名組件 (v, r, s) 完整演示                             ║");
  console.log("║                                                                  ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");

  try {
    await demo1_BasicSignature();
    await demo2_AddressRecovery();
    await demo3_EIP712Components();
    await demo4_VValueMeaning();
    await demo5_SValueRange();
    await demo6_DifferentMessages();

    printSection("總結");
    console.log("簽名組件 (v, r, s) 的核心概念:");
    console.log("\n🔴 r (32 bytes)");
    console.log("   - 簽名點的 x 坐標");
    console.log("   - 來自隨機數 k 的橢圓曲線點運算");
    console.log("   - 公開，不洩露私鑰信息");
    console.log("\n🟢 s (32 bytes)");
    console.log("   - 簽名證明，綁定私鑰、訊息和 r");
    console.log("   - 核心的密碼學證明組件");
    console.log("   - 應該在範圍 [1, N/2] 內（EIP-2）");
    console.log("\n🔵 v (1 byte)");
    console.log("   - 恢復標識符，取值 27 或 28");
    console.log("   - 用於確定正確的公鑰（從 2-4 個可能中選擇）");
    console.log("   - 在 EIP-155 後包含鏈 ID 信息");
    console.log("\n下一步: 實作 Hello World 範例");
    console.log("查看: ../04-hello-world/\n");

  } catch (error) {
    console.error("\n❌ 錯誤:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

