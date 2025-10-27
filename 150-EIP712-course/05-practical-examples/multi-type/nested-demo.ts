import { ethers } from "ethers";

/**
 * 複雜類型和嵌套結構演示
 * 展示如何處理陣列、嵌套結構、動態類型等
 */

/**
 * 演示複雜類型處理
 */
async function demonstrateComplexTypes() {
  console.log("\n🚀 開始複雜類型演示\n");
  console.log("=".repeat(70));

  console.log("\n⚙️  設定環境...");
  console.log("提示：請確保已啟動本地 Hardhat 節點");

  console.log("\n" + "=".repeat(70));
  console.log("📚 為什麼需要複雜類型？");
  console.log("=".repeat(70));

  console.log("\n真實世界的應用通常需要複雜的數據結構：");
  console.log("• 訂單系統（多個商品項目）");
  console.log("• NFT 屬性（嵌套信息）");
  console.log("• 提案系統（多個操作）");
  console.log("• 社交圖譜（關係網絡）");

  console.log("\n" + "=".repeat(70));
  console.log("🔤 類型編碼規則");
  console.log("=".repeat(70));

  console.log("\n1️⃣ 基本類型（直接編碼）");
  console.log("```solidity");
  console.log("uint256, int256, address, bool, bytes32");
  console.log("→ abi.encode(value)");
  console.log("```");
  console.log("範例：");
  console.log("  uint256 amount = 100");
  console.log("  → abi.encode(amount)");

  console.log("\n2️⃣ 動態類型（先哈希）");
  console.log("```solidity");
  console.log("string, bytes");
  console.log("→ keccak256(bytes(value))");
  console.log("```");
  console.log("範例：");
  console.log('  string name = "Alice"');
  console.log('  → keccak256(bytes("Alice"))');

  console.log("\n3️⃣ 陣列類型（先編碼每個元素，再哈希整體）");
  console.log("```solidity");
  console.log("uint256[], address[], Item[]");
  console.log("→ keccak256(abi.encodePacked(hash1, hash2, ...))");
  console.log("```");
  console.log("範例：");
  console.log("  [item1, item2, item3]");
  console.log("  → hash1 = hashItem(item1)");
  console.log("  → hash2 = hashItem(item2)");
  console.log("  → hash3 = hashItem(item3)");
  console.log("  → keccak256(abi.encodePacked(hash1, hash2, hash3))");

  console.log("\n4️⃣ 結構類型（遞歸計算）");
  console.log("```solidity");
  console.log("struct Item { string name; uint256 price; }");
  console.log("→ keccak256(abi.encode(ITEM_TYPEHASH, hashName, price))");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("📦 範例 1：簡單結構（Person）");
  console.log("=".repeat(70));

  console.log("\n結構定義：");
  console.log("```solidity");
  console.log("struct Person {");
  console.log("    string name;      // 動態類型");
  console.log("    address wallet;   // 基本類型");
  console.log("}");
  console.log("```");

  console.log("\n類型字串：");
  console.log('```\n"Person(string name,address wallet)"\n```');
  console.log("注意：沒有空格！");

  console.log("\n類型哈希：");
  console.log("```solidity");
  console.log('PERSON_TYPEHASH = keccak256("Person(string name,address wallet)")');
  console.log("```");

  console.log("\n結構哈希計算：");
  console.log("```solidity");
  console.log("function _hashPerson(Person memory person) internal pure returns (bytes32) {");
  console.log("    return keccak256(abi.encode(");
  console.log("        PERSON_TYPEHASH,");
  console.log("        keccak256(bytes(person.name)),  // string 先哈希");
  console.log("        person.wallet                   // address 直接編碼");
  console.log("    ));");
  console.log("}");
  console.log("```");

  console.log("\nTypeScript 實現：");
  console.log("```typescript");
  console.log("const domain = { name: 'ComplexTypes', version: '1', ... };");
  console.log("");
  console.log("const types = {");
  console.log("  Person: [");
  console.log("    { name: 'name', type: 'string' },");
  console.log("    { name: 'wallet', type: 'address' }");
  console.log("  ]");
  console.log("};");
  console.log("");
  console.log("const person = {");
  console.log("  name: 'Alice',");
  console.log("  wallet: '0x...'");
  console.log("};");
  console.log("");
  console.log("const signature = await signer.signTypedData(domain, types, person);");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("📦 範例 2：包含陣列（Item[]）");
  console.log("=".repeat(70));

  console.log("\n結構定義：");
  console.log("```solidity");
  console.log("struct Item {");
  console.log("    string name;");
  console.log("    uint256 price;");
  console.log("    uint256 quantity;");
  console.log("}");
  console.log("");
  console.log("struct Order {");
  console.log("    address buyer;");
  console.log("    address seller;");
  console.log("    Item[] items;      // 陣列類型");
  console.log("    uint256 deadline;");
  console.log("    uint256 nonce;");
  console.log("}");
  console.log("```");

  console.log("\n類型字串（重要！）：");
  console.log("```");
  console.log('"Order(address buyer,address seller,Item[] items,uint256 deadline,uint256 nonce)');
  console.log('Item(string name,uint256 price,uint256 quantity)"');
  console.log("```");
  console.log("注意：");
  console.log("• 主類型後面接引用的類型");
  console.log("• 引用類型按字母順序排列（這裡只有一個 Item）");
  console.log("• 沒有換行，是一個完整的字串");

  console.log("\n陣列哈希計算：");
  console.log("```solidity");
  console.log("function _hashItems(Item[] memory items) internal pure returns (bytes32) {");
  console.log("    // 1. 計算每個 item 的哈希");
  console.log("    bytes32[] memory itemHashes = new bytes32[](items.length);");
  console.log("    for (uint256 i = 0; i < items.length; i++) {");
  console.log("        itemHashes[i] = _hashItem(items[i]);");
  console.log("    }");
  console.log("    ");
  console.log("    // 2. 將所有哈希打包後再哈希");
  console.log("    return keccak256(abi.encodePacked(itemHashes));");
  console.log("}");
  console.log("```");

  console.log("\n訂單哈希計算：");
  console.log("```solidity");
  console.log("function _hashOrder(Order memory order) internal pure returns (bytes32) {");
  console.log("    return keccak256(abi.encode(");
  console.log("        ORDER_TYPEHASH,");
  console.log("        order.buyer,");
  console.log("        order.seller,");
  console.log("        _hashItems(order.items),  // 陣列先計算哈希");
  console.log("        order.deadline,");
  console.log("        order.nonce");
  console.log("    ));");
  console.log("}");
  console.log("```");

  console.log("\nTypeScript 實現：");
  console.log("```typescript");
  console.log("const types = {");
  console.log("  Order: [");
  console.log("    { name: 'buyer', type: 'address' },");
  console.log("    { name: 'seller', type: 'address' },");
  console.log("    { name: 'items', type: 'Item[]' },     // 注意類型定義");
  console.log("    { name: 'deadline', type: 'uint256' },");
  console.log("    { name: 'nonce', type: 'uint256' }");
  console.log("  ],");
  console.log("  Item: [                                  // 需要定義引用的類型");
  console.log("    { name: 'name', type: 'string' },");
  console.log("    { name: 'price', type: 'uint256' },");
  console.log("    { name: 'quantity', type: 'uint256' }");
  console.log("  ]");
  console.log("};");
  console.log("");
  console.log("const order = {");
  console.log("  buyer: '0x...',");
  console.log("  seller: '0x...',");
  console.log("  items: [");
  console.log("    { name: 'Apple', price: 100n, quantity: 10n },");
  console.log("    { name: 'Orange', price: 80n, quantity: 20n }");
  console.log("  ],");
  console.log("  deadline: Math.floor(Date.now() / 1000) + 3600,");
  console.log("  nonce: 0n");
  console.log("};");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("📦 範例 3：嵌套結構");
  console.log("=".repeat(70));

  console.log("\n結構定義：");
  console.log("```solidity");
  console.log("struct Person {");
  console.log("    string name;");
  console.log("    address wallet;");
  console.log("}");
  console.log("");
  console.log("struct NFTAttributes {");
  console.log("    string name;");
  console.log("    string description;");
  console.log("    Person creator;        // 嵌套結構");
  console.log("    string[] tags;         // string 陣列");
  console.log("    uint256 timestamp;");
  console.log("}");
  console.log("```");

  console.log("\n類型字串：");
  console.log("```");
  console.log('"NFTAttributes(string name,string description,Person creator,');
  console.log('string[] tags,uint256 timestamp)');
  console.log('Person(string name,address wallet)"');
  console.log("```");

  console.log("\n嵌套結構哈希計算：");
  console.log("```solidity");
  console.log("function _hashNFTAttributes(NFTAttributes memory attrs)");
  console.log("    internal pure returns (bytes32)");
  console.log("{");
  console.log("    return keccak256(abi.encode(");
  console.log("        NFT_ATTRIBUTES_TYPEHASH,");
  console.log("        keccak256(bytes(attrs.name)),           // string");
  console.log("        keccak256(bytes(attrs.description)),    // string");
  console.log("        _hashPerson(attrs.creator),             // 嵌套結構");
  console.log("        _hashTags(attrs.tags),                  // string[]");
  console.log("        attrs.timestamp");
  console.log("    ));");
  console.log("}");
  console.log("```");

  console.log("\nTypeScript 實現：");
  console.log("```typescript");
  console.log("const types = {");
  console.log("  NFTAttributes: [");
  console.log("    { name: 'name', type: 'string' },");
  console.log("    { name: 'description', type: 'string' },");
  console.log("    { name: 'creator', type: 'Person' },      // 嵌套類型");
  console.log("    { name: 'tags', type: 'string[]' },");
  console.log("    { name: 'timestamp', type: 'uint256' }");
  console.log("  ],");
  console.log("  Person: [                                   // 需要定義");
  console.log("    { name: 'name', type: 'string' },");
  console.log("    { name: 'wallet', type: 'address' }");
  console.log("  ]");
  console.log("};");
  console.log("");
  console.log("const nftAttrs = {");
  console.log("  name: 'Cool NFT',");
  console.log("  description: 'A very cool NFT',");
  console.log("  creator: {");
  console.log("    name: 'Alice',");
  console.log("    wallet: '0x...'");
  console.log("  },");
  console.log("  tags: ['art', 'collectible', 'rare'],");
  console.log("  timestamp: Math.floor(Date.now() / 1000)");
  console.log("};");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("⚠️  常見錯誤");
  console.log("=".repeat(70));

  console.log("\n❌ 錯誤 1：類型字串有多餘空格");
  console.log("```");
  console.log('// 錯誤：逗號後有空格');
  console.log('"Person(string name, address wallet)"');
  console.log("");
  console.log('// ✅ 正確：沒有空格');
  console.log('"Person(string name,address wallet)"');
  console.log("```");

  console.log("\n❌ 錯誤 2：string/bytes 沒有先哈希");
  console.log("```solidity");
  console.log("// ❌ 錯誤：直接編碼");
  console.log("keccak256(abi.encode(PERSON_TYPEHASH, person.name, person.wallet))");
  console.log("");
  console.log("// ✅ 正確：string 先哈希");
  console.log("keccak256(abi.encode(PERSON_TYPEHASH, keccak256(bytes(person.name)), person.wallet))");
  console.log("```");

  console.log("\n❌ 錯誤 3：陣列處理錯誤");
  console.log("```solidity");
  console.log("// ❌ 錯誤：直接哈希");
  console.log("keccak256(abi.encode(items))");
  console.log("");
  console.log("// ✅ 正確：先計算每個元素的哈希");
  console.log("bytes32[] memory hashes = new bytes32[](items.length);");
  console.log("for (uint i = 0; i < items.length; i++) {");
  console.log("    hashes[i] = _hashItem(items[i]);");
  console.log("}");
  console.log("keccak256(abi.encodePacked(hashes));");
  console.log("```");

  console.log("\n❌ 錯誤 4：引用類型順序錯誤");
  console.log("```");
  console.log('// ❌ 錯誤：引用類型沒按字母順序');
  console.log('"Order(...)Person(...)Item(...)"');
  console.log("");
  console.log('// ✅ 正確：Item 在 Person 前面（字母順序）');
  console.log('"Order(...)Item(...)Person(...)"');
  console.log("```");

  console.log("\n❌ 錯誤 5：忘記定義引用類型");
  console.log("```typescript");
  console.log("// ❌ 錯誤：只定義了 Order");
  console.log("const types = {");
  console.log("  Order: [{ name: 'items', type: 'Item[]' }, ...]");
  console.log("};");
  console.log("");
  console.log("// ✅ 正確：也要定義 Item");
  console.log("const types = {");
  console.log("  Order: [{ name: 'items', type: 'Item[]' }, ...],");
  console.log("  Item: [...]");
  console.log("};");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("🔧 調試技巧");
  console.log("=".repeat(70));

  console.log("\n1️⃣ 比對類型哈希");
  console.log("```typescript");
  console.log("// 前端計算");
  console.log("const typeHash = ethers.keccak256(");
  console.log('  ethers.toUtf8Bytes("Person(string name,address wallet)")');
  console.log(");");
  console.log("");
  console.log("// 合約查詢");
  console.log("const contractTypeHash = await contract.PERSON_TYPEHASH();");
  console.log("");
  console.log("// 應該相等");
  console.log("console.log(typeHash === contractTypeHash);");
  console.log("```");

  console.log("\n2️⃣ 比對 Domain Separator");
  console.log("```typescript");
  console.log("// 前端計算（ethers 會自動處理）");
  console.log("// 合約查詢");
  console.log("const domainSep = await contract.getDomainSeparator();");
  console.log("console.log('Domain Separator:', domainSep);");
  console.log("```");

  console.log("\n3️⃣ 測試簽名恢復");
  console.log("```typescript");
  console.log("const signature = await signer.signTypedData(domain, types, message);");
  console.log("const recoveredAddress = await contract.verifySignature(message, signature);");
  console.log("console.log('Signer:', await signer.getAddress());");
  console.log("console.log('Recovered:', recoveredAddress);");
  console.log("// 應該相等");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("💡 最佳實踐");
  console.log("=".repeat(70));

  console.log("\n1. 文檔化類型字串");
  console.log("```solidity");
  console.log('/// @notice Order 的類型字串');
  console.log('/// "Order(address buyer,address seller,Item[] items,...)Item(...)"');
  console.log("bytes32 private constant ORDER_TYPEHASH = ...");
  console.log("```");

  console.log("\n2. 提供驗證函數");
  console.log("```solidity");
  console.log("function verifyOrder(Order memory order, bytes memory signature)");
  console.log("    public view returns (address signer)");
  console.log("{");
  console.log("    bytes32 digest = _hashTypedDataV4(_hashOrder(order));");
  console.log("    return digest.recover(signature);");
  console.log("}");
  console.log("```");

  console.log("\n3. 測試所有邊界情況");
  console.log("   • 空陣列");
  console.log("   • 大型陣列");
  console.log("   • 特殊字符的 string");
  console.log("   • 嵌套層級");

  console.log("\n4. 使用 OpenZeppelin");
  console.log("```solidity");
  console.log("import '@openzeppelin/contracts/utils/cryptography/EIP712.sol';");
  console.log("import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("🌍 實際應用");
  console.log("=".repeat(70));

  console.log("\n1. OpenSea Seaport");
  console.log("   • 複雜的 NFT 訂單結構");
  console.log("   • 多個 offer 和 consideration");
  console.log("   • 支援批量交易");

  console.log("\n2. Uniswap Permit2");
  console.log("   • 批量代幣授權");
  console.log("   • 複雜的許可結構");

  console.log("\n3. Gnosis Safe");
  console.log("   • 多簽交易");
  console.log("   • 嵌套操作");

  console.log("\n4. DAO 提案系統");
  console.log("   • 提案包含多個操作");
  console.log("   • 投票權重計算");

  console.log("\n" + "=".repeat(70));
  console.log("📚 延伸閱讀");
  console.log("=".repeat(70));
  console.log("• EIP-712 規範: https://eips.ethereum.org/EIPS/eip-712");
  console.log("• OpenZeppelin EIP712 實作");
  console.log("• Seaport 協議文檔");
  console.log("• eth-sig-util 庫");

  console.log("\n" + "=".repeat(70));
  console.log("✅ 演示完成！");
  console.log("=".repeat(70));
  console.log("\n要實際運行此演示，請：");
  console.log("1. 部署 ComplexTypes 合約");
  console.log("2. 取消註解實際代碼部分");
  console.log("3. 測試不同的結構類型\n");
}

/**
 * 實際程式碼範例（需要部署合約後才能執行）
 */
async function actualImplementation() {
  console.log("\n🔧 實際實作（需要真實環境）\n");

  // 取消註解以下代碼來實際執行：
  /*
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const [signer] = await provider.listAccounts();
  
  // 部署合約
  const ComplexTypes = await ethers.getContractFactory("ComplexTypes");
  const contract = await ComplexTypes.deploy();
  await contract.waitForDeployment();
  
  console.log("Contract deployed to:", await contract.getAddress());
  
  // === 範例 1：Order ===
  const domain = {
    name: "ComplexTypes",
    version: "1",
    chainId: (await provider.getNetwork()).chainId,
    verifyingContract: await contract.getAddress()
  };
  
  const types = {
    Order: [
      { name: "buyer", type: "address" },
      { name: "seller", type: "address" },
      { name: "items", type: "Item[]" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" }
    ],
    Item: [
      { name: "name", type: "string" },
      { name: "price", type: "uint256" },
      { name: "quantity", type: "uint256" }
    ]
  };
  
  const order = {
    buyer: signer.address,
    seller: "0x1234567890123456789012345678901234567890",
    items: [
      { name: "Apple", price: 100n, quantity: 10n },
      { name: "Orange", price: 80n, quantity: 20n }
    ],
    deadline: Math.floor(Date.now() / 1000) + 3600,
    nonce: 0n
  };
  
  const signature = await signer.signTypedData(domain, types, order);
  console.log("\n✅ Order 簽名成功！");
  console.log("Signature:", signature);
  
  // 驗證
  const recoveredAddress = await contract.verifyOrder(order, signature);
  console.log("Signer:", signer.address);
  console.log("Recovered:", recoveredAddress);
  */
}

// 執行演示
demonstrateComplexTypes().catch(console.error);

