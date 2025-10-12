/**
 * EIP712 編碼流程逐步演示
 * 
 * 這個腳本逐步展示 EIP712 的四個核心編碼步驟，
 * 每一步都有詳細的輸出和說明
 * 
 * 運行方式：npx ts-node 02-encoding-flow/step-by-step.ts
 */

import { ethers } from "ethers";

// 輔助函數：格式化輸出
function printSection(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(`  ${title}`);
  console.log("=".repeat(60) + "\n");
}

function printStep(step: string) {
  console.log("\n" + "-".repeat(60));
  console.log(`  ${step}`);
  console.log("-".repeat(60) + "\n");
}

/**
 * 步驟 1: 計算 Domain Separator
 */
function step1_DomainSeparator() {
  printSection("步驟 1: 計算 Domain Separator");

  const domain = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  console.log("📋 Domain 數據:");
  console.log(JSON.stringify(domain, null, 2));

  printStep("1.1 定義 DOMAIN_TYPEHASH");
  
  const domainTypeString = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
  console.log("類型字串:");
  console.log(`  "${domainTypeString}"`);
  
  const DOMAIN_TYPEHASH = ethers.id(domainTypeString);
  console.log("\nDOMAIN_TYPEHASH (keccak256 of type string):");
  console.log(`  ${DOMAIN_TYPEHASH}`);

  printStep("1.2 哈希 string 字段");
  
  const nameHash = ethers.id(domain.name);
  console.log(`name: "${domain.name}"`);
  console.log(`keccak256(bytes("${domain.name}")):`);
  console.log(`  ${nameHash}`);
  
  const versionHash = ethers.id(domain.version);
  console.log(`\nversion: "${domain.version}"`);
  console.log(`keccak256(bytes("${domain.version}")):`);
  console.log(`  ${versionHash}`);

  printStep("1.3 編碼所有字段");
  
  console.log("使用 abi.encode 編碼以下數據:");
  console.log(`  1. DOMAIN_TYPEHASH: ${DOMAIN_TYPEHASH}`);
  console.log(`  2. name hash:       ${nameHash}`);
  console.log(`  3. version hash:    ${versionHash}`);
  console.log(`  4. chainId:         ${domain.chainId}`);
  console.log(`  5. contract:        ${domain.verifyingContract}`);
  
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "bytes32", "bytes32", "uint256", "address"],
    [
      DOMAIN_TYPEHASH,
      nameHash,
      versionHash,
      domain.chainId,
      domain.verifyingContract
    ]
  );
  console.log("\n編碼結果 (hex):");
  console.log(`  ${encoded}`);
  console.log(`  長度: ${(encoded.length - 2) / 2} bytes`);

  printStep("1.4 計算最終的 Domain Separator");
  
  const domainSeparator = ethers.keccak256(encoded);
  console.log("Domain Separator = keccak256(編碼結果):");
  console.log(`  ${domainSeparator}`);

  console.log("\n✅ Domain Separator 計算完成！");
  console.log("   這是應用程式的唯一「指紋」");

  return { domain, domainSeparator, DOMAIN_TYPEHASH };
}

/**
 * 步驟 2: 計算 Type Hash
 */
function step2_TypeHash() {
  printSection("步驟 2: 計算 Type Hash");

  printStep("2.1 定義數據結構");
  
  const types = {
    Transfer: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ]
  };
  
  console.log("類型定義 (TypeScript 格式):");
  console.log(JSON.stringify(types, null, 2));

  printStep("2.2 構建類型字串");
  
  console.log("規則:");
  console.log("  格式: TypeName(type1 field1,type2 field2,...)");
  console.log("  - 類型名後直接跟括號（無空格）");
  console.log("  - 字段間用逗號分隔（無空格）");
  console.log("  - 每個字段: 類型 + 空格 + 名稱");
  
  const typeString = "Transfer(address to,uint256 amount,uint256 deadline)";
  console.log("\n構建的類型字串:");
  console.log(`  "${typeString}"`);

  printStep("2.3 計算 Type Hash");
  
  const TYPE_HASH = ethers.id(typeString);
  console.log("TYPE_HASH = keccak256(類型字串):");
  console.log(`  ${TYPE_HASH}`);

  console.log("\n✅ Type Hash 計算完成！");
  console.log("   這是數據結構的「指紋」");

  return { types, typeString, TYPE_HASH };
}

/**
 * 步驟 3: 計算 Struct Hash
 */
function step3_StructHash(TYPE_HASH: string) {
  printSection("步驟 3: 計算 Struct Hash");

  const value = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100n,
    deadline: 1234567890n
  };

  console.log("📋 實際數據:");
  console.log(JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));

  printStep("3.1 確定編碼規則");
  
  console.log("字段類型分析:");
  console.log("  - to:       address  → 原子類型，直接編碼");
  console.log("  - amount:   uint256  → 原子類型，直接編碼");
  console.log("  - deadline: uint256  → 原子類型，直接編碼");
  console.log("\n如果有 string 或 bytes 類型，需要先哈希！");

  printStep("3.2 編碼所有字段");
  
  console.log("使用 abi.encode 編碼以下數據:");
  console.log(`  1. TYPE_HASH: ${TYPE_HASH}`);
  console.log(`  2. to:        ${value.to}`);
  console.log(`  3. amount:    ${value.amount}`);
  console.log(`  4. deadline:  ${value.deadline}`);
  
  const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "address", "uint256", "uint256"],
    [TYPE_HASH, value.to, value.amount, value.deadline]
  );
  
  console.log("\n編碼結果 (hex):");
  console.log(`  ${encoded}`);
  console.log(`  長度: ${(encoded.length - 2) / 2} bytes`);

  printStep("3.3 計算最終的 Struct Hash");
  
  const structHash = ethers.keccak256(encoded);
  console.log("Struct Hash = keccak256(編碼結果):");
  console.log(`  ${structHash}`);

  console.log("\n✅ Struct Hash 計算完成！");
  console.log("   這是實際數據的哈希");

  return { value, structHash };
}

/**
 * 步驟 4: 計算 Final Digest
 */
function step4_FinalDigest(domainSeparator: string, structHash: string) {
  printSection("步驟 4: 計算 Final Digest");

  printStep("4.1 組合三個部分");
  
  console.log("最終 digest 由三部分組成:");
  console.log("\n1. EIP-191 前綴: 0x1901");
  console.log("   - 0x19: EIP-191 標識");
  console.log("   - 0x01: EIP-712 版本號");
  console.log("   - 作用: 防止與以太坊交易混淆");
  
  console.log("\n2. Domain Separator (32 bytes):");
  console.log(`   ${domainSeparator}`);
  console.log("   作用: 綁定到特定應用和環境");
  
  console.log("\n3. Struct Hash (32 bytes):");
  console.log(`   ${structHash}`);
  console.log("   作用: 表示實際要簽署的數據");

  printStep("4.2 使用 encodePacked 緊湊編碼");
  
  console.log("⚠️  注意: 這裡使用 abi.encodePacked，不是 abi.encode");
  console.log("    encodePacked 不添加長度前綴，直接拼接\n");
  
  const packed = ethers.concat([
    "0x1901",
    domainSeparator,
    structHash
  ]);
  
  console.log("緊湊編碼結果:");
  console.log(`  ${packed}`);
  console.log(`  長度: ${(packed.length - 2) / 2} bytes`);
  console.log("  分解:");
  console.log(`    - 0x1901:    ${packed.slice(0, 6)}`);
  console.log(`    - domain:    ${packed.slice(6, 70)}`);
  console.log(`    - struct:    ${packed.slice(70)}`);

  printStep("4.3 計算最終的 Digest");
  
  const digest = ethers.keccak256(packed);
  console.log("Digest = keccak256(緊湊編碼結果):");
  console.log(`  ${digest}`);

  console.log("\n✅ Final Digest 計算完成！");
  console.log("   這就是最終要簽署的 32 字節數據");
  console.log("   接下來會使用 ECDSA 私鑰對這個 digest 進行簽名");

  return digest;
}

/**
 * 額外: 簽名和驗證
 */
async function bonus_SignAndVerify(
  domain: any,
  types: any,
  value: any,
  digest: string
) {
  printSection("額外演示: 簽名和驗證");

  const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(PRIVATE_KEY);

  printStep("5.1 使用私鑰簽名");
  
  console.log(`簽名者地址: ${wallet.address}`);
  console.log(`要簽名的 digest: ${digest}`);
  
  // 方法 1: 使用 signTypedData（推薦）
  const signature = await wallet.signTypedData(domain, types, value);
  console.log("\n簽名結果 (使用 signTypedData):");
  console.log(`  ${signature}`);
  console.log(`  長度: ${(signature.length - 2) / 2} bytes (65 bytes)`);

  printStep("5.2 分解簽名");
  
  const sig = ethers.Signature.from(signature);
  console.log("簽名組件:");
  console.log(`  r: ${sig.r}`);
  console.log(`  s: ${sig.s}`);
  console.log(`  v: ${sig.v}`);
  console.log(`  yParity: ${sig.yParity}`);

  printStep("5.3 驗證簽名");
  
  const recoveredAddress = ethers.verifyTypedData(domain, types, value, signature);
  console.log(`從簽名恢復的地址: ${recoveredAddress}`);
  console.log(`原始簽名者地址:   ${wallet.address}`);
  console.log(`匹配: ${recoveredAddress.toLowerCase() === wallet.address.toLowerCase() ? "✅" : "❌"}`);

  printStep("5.4 手動驗證（使用 digest）");
  
  // 也可以直接從 digest 恢復
  const recoveredFromDigest = ethers.recoverAddress(digest, signature);
  console.log(`使用 digest 恢復的地址: ${recoveredFromDigest}`);
  console.log(`匹配: ${recoveredFromDigest.toLowerCase() === wallet.address.toLowerCase() ? "✅" : "❌"}`);
}

/**
 * 驗證整個流程
 */
function verification(
  domain: any,
  types: any,
  value: any,
  manualDigest: string
) {
  printSection("驗證: 對比 ethers.js 內建實現");

  const builtInDigest = ethers.TypedDataEncoder.hash(domain, types, value);
  
  console.log("手動計算的 Digest:");
  console.log(`  ${manualDigest}`);
  console.log("\nethers.js 內建計算的 Digest:");
  console.log(`  ${builtInDigest}`);
  console.log("\n結果:");
  console.log(`  ${manualDigest === builtInDigest ? "✅ 完全一致！" : "❌ 不一致"}`);

  if (manualDigest === builtInDigest) {
    console.log("\n🎉 恭喜！你已經完全理解 EIP712 的編碼流程");
  }
}

/**
 * 主函數
 */
async function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                                                          ║");
  console.log("║        EIP712 編碼流程逐步演示                            ║");
  console.log("║                                                          ║");
  console.log("║  這個演示會詳細展示 EIP712 的四個核心編碼步驟            ║");
  console.log("║                                                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  try {
    // 步驟 1: Domain Separator
    const { domain, domainSeparator } = step1_DomainSeparator();

    // 步驟 2: Type Hash
    const { types, TYPE_HASH } = step2_TypeHash();

    // 步驟 3: Struct Hash
    const { value, structHash } = step3_StructHash(TYPE_HASH);

    // 步驟 4: Final Digest
    const digest = step4_FinalDigest(domainSeparator, structHash);

    // 驗證
    verification(domain, types, value, digest);

    // 額外: 簽名和驗證
    await bonus_SignAndVerify(domain, types, value, digest);

    printSection("總結");
    console.log("EIP712 編碼的四個步驟:");
    console.log("\n1️⃣  計算 Domain Separator");
    console.log("   → 確定應用身份（name, version, chainId, contract）");
    console.log("\n2️⃣  計算 Type Hash");
    console.log("   → 確定數據結構（類型定義的指紋）");
    console.log("\n3️⃣  計算 Struct Hash");
    console.log("   → 編碼實際數據（遵循特定規則）");
    console.log("\n4️⃣  計算 Final Digest");
    console.log("   → 組合成最終訊息（0x1901 + domain + struct）");
    console.log("\n然後使用 ECDSA 對 digest 進行簽名，得到 (v, r, s)");
    console.log("\n下一步: 學習 v, r, s 的意義");
    console.log("查看: ../03-signature-components/\n");

  } catch (error) {
    console.error("\n❌ 錯誤:", error);
    process.exit(1);
  }
}

// 如果直接運行此文件
if (require.main === module) {
  main();
}

export {
  step1_DomainSeparator,
  step2_TypeHash,
  step3_StructHash,
  step4_FinalDigest
};

