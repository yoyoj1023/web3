/**
 * EIP712 編碼互動式工具
 * 
 * 這個工具讓你可以修改參數並即時看到編碼結果的變化
 * 運行方式：npx ts-node 02-encoding-flow/encoding-playground.ts
 */

import { ethers } from "ethers";

interface EncodingResult {
  domainSeparator: string;
  typeHash: string;
  structHash: string;
  digest: string;
}

/**
 * 完整的 EIP712 編碼函數
 */
function encodeEIP712(
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  },
  typeName: string,
  typeFields: Array<{ name: string; type: string }>,
  value: Record<string, any>
): EncodingResult {
  
  // 1. 計算 Domain Separator
  const DOMAIN_TYPEHASH = ethers.id(
    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
  );
  
  const domainSeparator = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        DOMAIN_TYPEHASH,
        ethers.id(domain.name),
        ethers.id(domain.version),
        domain.chainId,
        domain.verifyingContract
      ]
    )
  );

  // 2. 計算 Type Hash
  const typeString = `${typeName}(${typeFields.map(f => `${f.type} ${f.name}`).join(",")})`;
  const typeHash = ethers.id(typeString);

  // 3. 計算 Struct Hash
  const types = ["bytes32", ...typeFields.map(f => f.type)];
  const values = [typeHash, ...typeFields.map(f => {
    const val = value[f.name];
    // 如果是 string，需要先哈希
    if (f.type === "string") {
      return ethers.id(val);
    }
    // 如果是 bytes，也需要哈希
    if (f.type === "bytes") {
      return ethers.keccak256(val);
    }
    return val;
  })];
  
  const structHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(types, values)
  );

  // 4. 計算 Final Digest
  const digest = ethers.keccak256(
    ethers.concat(["0x1901", domainSeparator, structHash])
  );

  return {
    domainSeparator,
    typeHash,
    structHash,
    digest
  };
}

/**
 * 場景 1: 基本的轉帳訊息
 */
function scenario1_SimpleTransfer() {
  console.log("\n" + "=".repeat(70));
  console.log("  場景 1: 簡單轉帳訊息");
  console.log("=".repeat(70) + "\n");

  const domain = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  const typeName = "Transfer";
  const typeFields = [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" }
  ];

  const value = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100n
  };

  console.log("輸入:");
  console.log("  Domain:", JSON.stringify(domain, null, 2).replace(/\n/g, "\n  "));
  console.log("  Type:", typeName);
  console.log("  Fields:", JSON.stringify(typeFields, null, 2).replace(/\n/g, "\n  "));
  console.log("  Value:", JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2).replace(/\n/g, "\n  "));

  const result = encodeEIP712(domain, typeName, typeFields, value);

  console.log("\n輸出:");
  console.log("  Domain Separator:", result.domainSeparator);
  console.log("  Type Hash:       ", result.typeHash);
  console.log("  Struct Hash:     ", result.structHash);
  console.log("  Digest:          ", result.digest);

  return result;
}

/**
 * 場景 2: 修改 Domain 的影響
 */
function scenario2_DomainChange() {
  console.log("\n" + "=".repeat(70));
  console.log("  場景 2: 修改 Domain - 觀察 Domain Separator 和 Digest 的變化");
  console.log("=".repeat(70) + "\n");

  const baseConfig = {
    typeName: "Transfer",
    typeFields: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    value: {
      to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      amount: 100n
    }
  };

  // 版本 A: 原始 domain
  const domainA = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  // 版本 B: 修改應用名稱
  const domainB = {
    name: "YourToken",  // 改變
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  // 版本 C: 修改鏈 ID
  const domainC = {
    name: "MyToken",
    version: "1",
    chainId: 137,  // 改變：從 Ethereum 到 Polygon
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  const resultA = encodeEIP712(domainA, baseConfig.typeName, baseConfig.typeFields, baseConfig.value);
  const resultB = encodeEIP712(domainB, baseConfig.typeName, baseConfig.typeFields, baseConfig.value);
  const resultC = encodeEIP712(domainC, baseConfig.typeName, baseConfig.typeFields, baseConfig.value);

  console.log("版本 A (原始):");
  console.log(`  name: "${domainA.name}", chainId: ${domainA.chainId}`);
  console.log(`  Domain Separator: ${resultA.domainSeparator}`);
  console.log(`  Digest:           ${resultA.digest}`);

  console.log("\n版本 B (修改名稱):");
  console.log(`  name: "${domainB.name}", chainId: ${domainB.chainId}`);
  console.log(`  Domain Separator: ${resultB.domainSeparator}`);
  console.log(`  Digest:           ${resultB.digest}`);

  console.log("\n版本 C (修改鏈 ID):");
  console.log(`  name: "${domainC.name}", chainId: ${domainC.chainId}`);
  console.log(`  Domain Separator: ${resultC.domainSeparator}`);
  console.log(`  Digest:           ${resultC.digest}`);

  console.log("\n觀察:");
  console.log(`  Domain Separator 是否相同: A==B ${resultA.domainSeparator === resultB.domainSeparator ? "✅" : "❌"}, A==C ${resultA.domainSeparator === resultC.domainSeparator ? "✅" : "❌"}`);
  console.log(`  Digest 是否相同:           A==B ${resultA.digest === resultB.digest ? "✅" : "❌"}, A==C ${resultA.digest === resultC.digest ? "✅" : "❌"}`);
  console.log("\n💡 結論: 修改 domain 的任何字段都會改變最終的 digest");
  console.log("   這就是 domain 如何防止重放攻擊的原理！");
}

/**
 * 場景 3: 修改數據的影響
 */
function scenario3_ValueChange() {
  console.log("\n" + "=".repeat(70));
  console.log("  場景 3: 修改數據 - 觀察 Struct Hash 和 Digest 的變化");
  console.log("=".repeat(70) + "\n");

  const domain = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  const typeName = "Transfer";
  const typeFields = [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" }
  ];

  // 版本 A: amount = 100
  const valueA = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100n
  };

  // 版本 B: amount = 200
  const valueB = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 200n  // 改變
  };

  const resultA = encodeEIP712(domain, typeName, typeFields, valueA);
  const resultB = encodeEIP712(domain, typeName, typeFields, valueB);

  console.log("版本 A (amount = 100):");
  console.log(`  Struct Hash: ${resultA.structHash}`);
  console.log(`  Digest:      ${resultA.digest}`);

  console.log("\n版本 B (amount = 200):");
  console.log(`  Struct Hash: ${resultB.structHash}`);
  console.log(`  Digest:      ${resultB.digest}`);

  console.log("\n觀察:");
  console.log(`  Domain Separator 是否相同: ${resultA.domainSeparator === resultB.domainSeparator ? "✅" : "❌"}`);
  console.log(`  Type Hash 是否相同:        ${resultA.typeHash === resultB.typeHash ? "✅" : "❌"}`);
  console.log(`  Struct Hash 是否相同:      ${resultA.structHash === resultB.structHash ? "✅" : "❌"}`);
  console.log(`  Digest 是否相同:           ${resultA.digest === resultB.digest ? "✅" : "❌"}`);

  console.log("\n💡 結論: 修改數據會改變 Struct Hash，進而改變最終的 digest");
  console.log("   Domain 和 Type 保持不變（因為應用和結構沒變）");
}

/**
 * 場景 4: 包含 string 類型
 */
function scenario4_StringType() {
  console.log("\n" + "=".repeat(70));
  console.log("  場景 4: 包含 String 類型 - 觀察編碼差異");
  console.log("=".repeat(70) + "\n");

  const domain = {
    name: "MyApp",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  const typeName = "Message";
  const typeFields = [
    { name: "content", type: "string" },
    { name: "timestamp", type: "uint256" }
  ];

  const value = {
    content: "Hello, EIP712!",
    timestamp: 1234567890n
  };

  console.log("輸入:");
  console.log(`  content: "${value.content}"`);
  console.log(`  timestamp: ${value.timestamp}`);

  console.log("\n關鍵: string 類型的編碼");
  console.log("  1. 先計算 keccak256(bytes(content))");
  const contentHash = ethers.id(value.content);
  console.log(`     content hash: ${contentHash}`);
  console.log("  2. 然後將 hash 結果編碼到 struct 中");

  const result = encodeEIP712(domain, typeName, typeFields, value);

  console.log("\n輸出:");
  console.log("  Type Hash:   ", result.typeHash);
  console.log("  Struct Hash: ", result.structHash);
  console.log("  Digest:      ", result.digest);

  console.log("\n💡 記住: 動態類型 (string, bytes) 必須先哈希再編碼！");
}

/**
 * 場景 5: 相同數據不同類型定義
 */
function scenario5_DifferentTypes() {
  console.log("\n" + "=".repeat(70));
  console.log("  場景 5: 相同數據，不同類型定義");
  console.log("=".repeat(70) + "\n");

  const domain = {
    name: "MyToken",
    version: "1",
    chainId: 1,
    verifyingContract: "0x1111111111111111111111111111111111111111"
  };

  // 類型 A: Transfer
  const typeNameA = "Transfer";
  const typeFieldsA = [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" }
  ];

  // 類型 B: Send (相同數據，不同名稱)
  const typeNameB = "Send";
  const typeFieldsB = [
    { name: "to", type: "address" },
    { name: "amount", type: "uint256" }
  ];

  const value = {
    to: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    amount: 100n
  };

  const resultA = encodeEIP712(domain, typeNameA, typeFieldsA, value);
  const resultB = encodeEIP712(domain, typeNameB, typeFieldsB, value);

  console.log("類型 A: Transfer(address to,uint256 amount)");
  console.log(`  Type Hash: ${resultA.typeHash}`);
  console.log(`  Digest:    ${resultA.digest}`);

  console.log("\n類型 B: Send(address to,uint256 amount)");
  console.log(`  Type Hash: ${resultB.typeHash}`);
  console.log(`  Digest:    ${resultB.digest}`);

  console.log("\n觀察:");
  console.log(`  Type Hash 是否相同: ${resultA.typeHash === resultB.typeHash ? "✅" : "❌"}`);
  console.log(`  Digest 是否相同:    ${resultA.digest === resultB.digest ? "✅" : "❌"}`);

  console.log("\n💡 結論: 即使數據相同，類型名稱不同也會導致不同的 digest");
  console.log("   類型定義必須完全一致！");
}

/**
 * 主函數
 */
function main() {
  console.log("\n");
  console.log("╔══════════════════════════════════════════════════════════════════╗");
  console.log("║                                                                  ║");
  console.log("║            EIP712 編碼互動式工具                                  ║");
  console.log("║                                                                  ║");
  console.log("║  通過不同場景展示參數變化如何影響編碼結果                          ║");
  console.log("║                                                                  ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝");

  try {
    // 場景 1: 基本範例
    scenario1_SimpleTransfer();

    // 場景 2: 修改 Domain
    scenario2_DomainChange();

    // 場景 3: 修改數據
    scenario3_ValueChange();

    // 場景 4: String 類型
    scenario4_StringType();

    // 場景 5: 不同類型定義
    scenario5_DifferentTypes();

    // 總結
    console.log("\n" + "=".repeat(70));
    console.log("  總結");
    console.log("=".repeat(70) + "\n");
    console.log("通過這些場景，你應該理解了:");
    console.log("\n1. Domain Separator 的變化會影響最終 digest");
    console.log("   → 這就是如何防止跨應用/跨鏈重放攻擊");
    console.log("\n2. 數據變化會影響 Struct Hash 和 digest");
    console.log("   → 確保簽名綁定到特定數據");
    console.log("\n3. String/bytes 類型需要先哈希");
    console.log("   → 標準化動態長度數據的表示");
    console.log("\n4. 類型定義必須完全一致");
    console.log("   → 確保簽名者和驗證者理解一致");
    console.log("\n🎓 你可以修改這個腳本中的參數來探索更多場景！\n");

  } catch (error) {
    console.error("\n❌ 錯誤:", error);
    process.exit(1);
  }
}

// 如果直接運行此文件
if (require.main === module) {
  main();
}

export { encodeEIP712 };

