import { ethers } from "ethers";

/**
 * Meta Transaction 演示
 * 展示如何使用 ERC-2771 實現 gasless 交易
 */

/**
 * 簽署 ForwardRequest
 */
async function signForwardRequest(
  forwarder: any,
  request: {
    from: string;
    to: string;
    value: bigint;
    gas: bigint;
    nonce: bigint;
    deadline: number;
    data: string;
  },
  signer: any
): Promise<string> {
  console.log("\n📝 準備簽名元交易:");
  console.log("From:", request.from);
  console.log("To:", request.to);
  console.log("Value:", ethers.formatEther(request.value), "ETH");
  console.log("Gas:", request.gas.toString());
  console.log("Nonce:", request.nonce.toString());
  console.log("Deadline:", new Date(request.deadline * 1000).toLocaleString());
  console.log("Data:", request.data);

  // 1. 構建 EIP-712 domain
  const domain = {
    name: "Forwarder",
    version: "1",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await forwarder.getAddress(),
  };

  // 2. 定義類型
  const types = {
    ForwardRequest: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "gas", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
  };

  // 3. 簽名
  const signature = await signer.signTypedData(domain, types, request);

  console.log("\n✅ 簽名完成:");
  console.log("Signature:", signature);

  return signature;
}

/**
 * 演示元交易功能
 */
async function demonstrateMetaTransaction() {
  console.log("\n🚀 開始 Meta Transaction 演示\n");
  console.log("=".repeat(70));

  console.log("\n⚙️  設定環境...");
  console.log("提示：請確保已啟動本地 Hardhat 節點");
  console.log("指令：npx hardhat node");

  console.log("\n" + "=".repeat(70));
  console.log("💡 什麼是元交易（Meta Transaction）？");
  console.log("=".repeat(70));

  console.log("\n元交易允許使用者：");
  console.log("✅ 簽署交易意圖，而不是真實交易");
  console.log("✅ 完全不需要持有 gas 代幣（如 ETH）");
  console.log("✅ 由中繼者（Relayer）代為支付 gas 費用");
  console.log("✅ 實現真正的 gasless 體驗");

  console.log("\n" + "=".repeat(70));
  console.log("🎭 角色說明");
  console.log("=".repeat(70));

  console.log("\n👤 使用者（User）");
  console.log("   • 想要執行某個操作（如增加計數器）");
  console.log("   • 但沒有 ETH 支付 gas");
  console.log("   • 只需要離線簽署交易意圖");

  console.log("\n🤖 中繼者（Relayer）");
  console.log("   • 接收使用者的簽名");
  console.log("   • 代為提交到區塊鏈");
  console.log("   • 支付所有 gas 費用");
  console.log("   • 可以向使用者收費（以其他方式）");

  console.log("\n📮 轉發器合約（Forwarder）");
  console.log("   • 驗證使用者簽名");
  console.log("   • 執行實際的交易");
  console.log("   • 確保安全性（防重放、檢查過期）");

  console.log("\n🎯 目標合約（Target Contract）");
  console.log("   • 實際執行業務邏輯");
  console.log("   • 從 calldata 中提取真實發送者");
  console.log("   • 信任特定的轉發器");

  console.log("\n" + "=".repeat(70));
  console.log("🔄 元交易流程");
  console.log("=".repeat(70));

  console.log("\n步驟 1️⃣：使用者構建 ForwardRequest");
  console.log("```");
  console.log("ForwardRequest {");
  console.log("  from: user.address,        // 真實發送者");
  console.log("  to: targetContract,        // 目標合約");
  console.log("  value: 0,                  // 發送的 ETH（通常為0）");
  console.log("  gas: 100000,               // gas 限制");
  console.log("  nonce: 0,                  // 當前 nonce");
  console.log("  deadline: timestamp,       // 過期時間");
  console.log("  data: encodedFunctionCall  // 要執行的函數");
  console.log("}");
  console.log("```");

  console.log("\n步驟 2️⃣：使用者簽署 ForwardRequest");
  console.log("   • 使用 EIP-712 結構化簽名");
  console.log("   • 完全離線，不需要 gas");
  console.log("   • 簽名包含所有交易細節");

  console.log("\n步驟 3️⃣：使用者提交簽名給中繼者");
  console.log("   • 透過 HTTP API、WebSocket 等");
  console.log("   • 中繼者可以是：");
  console.log("     - 專業的 Relayer 服務（如 Biconomy、OpenGSN）");
  console.log("     - DApp 自己的後端");
  console.log("     - 任何願意支付 gas 的第三方");

  console.log("\n步驟 4️⃣：中繼者調用 Forwarder.execute()");
  console.log("   • Forwarder 驗證簽名");
  console.log("   • 檢查 nonce（防重放）");
  console.log("   • 檢查 deadline（防過期）");
  console.log("   • 調用目標合約");

  console.log("\n步驟 5️⃣：目標合約執行邏輯");
  console.log("   • 從 calldata 提取真實發送者");
  console.log("   • 執行業務邏輯");
  console.log("   • 使用真實發送者作為 msg.sender");

  console.log("\n" + "=".repeat(70));
  console.log("📋 ForwardRequest 結構");
  console.log("=".repeat(70));

  console.log("\n```solidity");
  console.log("struct ForwardRequest {");
  console.log("    address from;      // 原始發送者");
  console.log("    address to;        // 目標合約");
  console.log("    uint256 value;     // 發送的 ETH 數量");
  console.log("    uint256 gas;       // Gas 限制");
  console.log("    uint256 nonce;     // 防重放 nonce");
  console.log("    uint256 deadline;  // 過期時間");
  console.log("    bytes data;        // 調用數據");
  console.log("}");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("💻 程式碼示例");
  console.log("=".repeat(70));

  console.log("\n// 1. 編碼函數調用");
  console.log(`const data = counter.interface.encodeFunctionData("increment", [1]);`);

  console.log("\n// 2. 構建 ForwardRequest");
  console.log(`const request = {
  from: user.address,
  to: await counter.getAddress(),
  value: 0n,
  gas: 100000n,
  nonce: await forwarder.getNonce(user.address),
  deadline: Math.floor(Date.now() / 1000) + 3600,
  data: data
};`);

  console.log("\n// 3. 簽名");
  console.log(`const signature = await signForwardRequest(forwarder, request, user);`);

  console.log("\n// 4. 中繼者執行（支付 gas）");
  console.log(`await forwarder.connect(relayer).execute(request, signature);`);

  console.log("\n" + "=".repeat(70));
  console.log("🔐 安全機制");
  console.log("=".repeat(70));

  console.log("\n1️⃣ Nonce 防重放");
  console.log("```solidity");
  console.log("require(nonces[req.from] == req.nonce, \"Invalid nonce\");");
  console.log("nonces[req.from]++;");
  console.log("```");
  console.log("防止：同一個簽名被重複使用");

  console.log("\n2️⃣ Deadline 時效性");
  console.log("```solidity");
  console.log("require(block.timestamp <= req.deadline, \"Request expired\");");
  console.log("```");
  console.log("防止：過期的簽名被使用");

  console.log("\n3️⃣ 簽名驗證");
  console.log("```solidity");
  console.log("address signer = _hashTypedDataV4(hash).recover(signature);");
  console.log("require(signer == req.from, \"Signature mismatch\");");
  console.log("```");
  console.log("防止：偽造的簽名");

  console.log("\n4️⃣ 可信轉發器");
  console.log("```solidity");
  console.log("address public trustedForwarder;");
  console.log("require(msg.sender == trustedForwarder, \"Untrusted forwarder\");");
  console.log("```");
  console.log("防止：惡意轉發器");

  console.log("\n5️⃣ 提取真實發送者");
  console.log("```solidity");
  console.log("function _msgSender() internal view returns (address) {");
  console.log("    if (msg.sender == trustedForwarder) {");
  console.log("        // 從 calldata 末尾提取 20 字節地址");
  console.log("        return address(bytes20(msg.data[msg.data.length-20:]));");
  console.log("    }");
  console.log("    return msg.sender;");
  console.log("}");
  console.log("```");

  console.log("\n" + "=".repeat(70));
  console.log("🌍 實際應用案例");
  console.log("=".repeat(70));

  console.log("\n1. 區塊鏈遊戲");
  console.log("   • 玩家無需持有 gas");
  console.log("   • 遊戲公司代為支付");
  console.log("   • 降低進入門檻");

  console.log("\n2. DApp Onboarding");
  console.log("   • 新用戶註冊時無需 ETH");
  console.log("   • 更友善的用戶體驗");
  console.log("   • 提高轉換率");

  console.log("\n3. NFT Minting");
  console.log("   • 用戶可以用信用卡購買");
  console.log("   • 後端代為鑄造");
  console.log("   • 用戶無感知區塊鏈");

  console.log("\n4. DAO 治理");
  console.log("   • 投票無需 gas");
  console.log("   • 提高參與率");
  console.log("   • 更公平的治理");

  console.log("\n" + "=".repeat(70));
  console.log("⚠️  常見陷阱");
  console.log("=".repeat(70));

  console.log("\n❌ 陷阱 1：信任 msg.sender");
  console.log("```solidity");
  console.log("// 錯誤：直接使用 msg.sender");
  console.log("function increment() external {");
  console.log("    counts[msg.sender]++;  // ❌ 會記錄到 Forwarder 而不是用戶");
  console.log("}");
  console.log("```");
  console.log("✅ 解決：使用 _msgSender()");

  console.log("\n❌ 陷阱 2：不檢查 nonce");
  console.log("✅ 解決：始終檢查並遞增 nonce");

  console.log("\n❌ 陷阱 3：不限制 gas");
  console.log("✅ 解決：設定 gas 上限，防止中繼者損失");

  console.log("\n❌ 陷阱 4：信任任意轉發器");
  console.log("✅ 解決：只信任特定的 trustedForwarder");

  console.log("\n" + "=".repeat(70));
  console.log("🆚 Permit vs Meta Transaction");
  console.log("=".repeat(70));

  console.log("\n| 特性 | Permit | Meta Transaction |");
  console.log("|------|--------|------------------|");
  console.log("| 用途 | 代幣授權 | 任意函數調用 |");
  console.log("| 標準 | EIP-2612 | ERC-2771 |");
  console.log("| 複雜度 | 簡單 | 中等 |");
  console.log("| 適用範圍 | ERC20 | 任意合約 |");
  console.log("| Gas 節省 | 一筆交易 | 用戶完全無需 gas |");
  console.log("| 中繼者 | 不需要 | 需要 |");

  console.log("\n" + "=".repeat(70));
  console.log("🔧 實作關鍵點");
  console.log("=".repeat(70));

  console.log("\n合約端：");
  console.log("1. 實作 _msgSender() 提取真實發送者");
  console.log("2. 設定 trustedForwarder");
  console.log("3. 所有需要 msg.sender 的地方改用 _msgSender()");

  console.log("\n轉發器端：");
  console.log("1. 驗證簽名");
  console.log("2. 管理 nonce");
  console.log("3. 檢查 deadline");
  console.log("4. 執行調用並附加 from 地址");

  console.log("\n前端：");
  console.log("1. 構建 ForwardRequest");
  console.log("2. 使用 EIP-712 簽名");
  console.log("3. 提交給中繼者");

  console.log("\n中繼者服務：");
  console.log("1. 驗證請求合法性");
  console.log("2. 調用 Forwarder.execute()");
  console.log("3. 監控 gas 消耗");
  console.log("4. 可選：向用戶收費");

  console.log("\n" + "=".repeat(70));
  console.log("🚀 現有的 Meta Transaction 方案");
  console.log("=".repeat(70));

  console.log("\n1. OpenGSN (Gas Station Network)");
  console.log("   • 開源的去中心化中繼網絡");
  console.log("   • https://opengsn.org/");

  console.log("\n2. Biconomy");
  console.log("   • 商業化的 gasless 解決方案");
  console.log("   • 簡單易用的 SDK");
  console.log("   • https://www.biconomy.io/");

  console.log("\n3. Gelato Network");
  console.log("   • 自動化執行網絡");
  console.log("   • 支援元交易");

  console.log("\n4. ERC-2771 標準實作");
  console.log("   • OpenZeppelin 提供基礎合約");
  console.log("   • 可以自建中繼者服務");

  console.log("\n" + "=".repeat(70));
  console.log("📚 延伸閱讀");
  console.log("=".repeat(70));
  console.log("• ERC-2771 規範: https://eips.ethereum.org/EIPS/eip-2771");
  console.log("• OpenZeppelin ERC2771Context");
  console.log("• Biconomy 文檔");
  console.log("• OpenGSN 文檔");

  console.log("\n" + "=".repeat(70));
  console.log("✅ 演示完成！");
  console.log("=".repeat(70));
  console.log("\n要實際運行此演示，請：");
  console.log("1. 部署 Forwarder 和 SimpleCounter 合約");
  console.log("2. 取消註解實際代碼部分");
  console.log("3. 配置正確的 RPC 端點");
  console.log("4. 執行：npx ts-node meta-tx-demo.ts\n");
}

/**
 * 實際程式碼範例（需要部署合約後才能執行）
 */
async function actualImplementation() {
  console.log("\n🔧 實際實作（需要真實環境）\n");

  // 取消註解以下代碼來實際執行：
  /*
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const [user, relayer] = await provider.listAccounts();
  
  // 部署 Forwarder
  const Forwarder = await ethers.getContractFactory("Forwarder");
  const forwarder = await Forwarder.deploy();
  await forwarder.waitForDeployment();
  
  // 部署 SimpleCounter
  const SimpleCounter = await ethers.getContractFactory("SimpleCounter");
  const counter = await SimpleCounter.deploy(await forwarder.getAddress());
  await counter.waitForDeployment();
  
  console.log("Forwarder:", await forwarder.getAddress());
  console.log("Counter:", await counter.getAddress());
  
  // 1. 編碼函數調用
  const data = counter.interface.encodeFunctionData("increment", [5]);
  
  // 2. 獲取 nonce
  const nonce = await forwarder.getNonce(user.address);
  
  // 3. 構建 ForwardRequest
  const request = {
    from: user.address,
    to: await counter.getAddress(),
    value: 0n,
    gas: 100000n,
    nonce: nonce,
    deadline: Math.floor(Date.now() / 1000) + 3600,
    data: data
  };
  
  // 4. 簽名
  const signature = await signForwardRequest(forwarder, request, user);
  
  // 5. 中繼者執行（支付 gas）
  const tx = await forwarder.connect(relayer).execute(request, signature);
  await tx.wait();
  
  console.log("\n✅ 元交易執行成功！");
  console.log("用戶計數:", (await counter.getUserCount(user.address)).toString());
  console.log("總計數:", (await counter.counter()).toString());
  */
}

// 執行演示
demonstrateMetaTransaction().catch(console.error);

