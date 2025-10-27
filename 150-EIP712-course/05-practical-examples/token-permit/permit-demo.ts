import { ethers } from "ethers";

/**
 * Permit Token 演示
 * 展示如何使用 EIP-2612 進行 gasless 授權
 */

// EIP-2612 Permit 類型定義
const PERMIT_TYPEHASH = ethers.keccak256(
  ethers.toUtf8Bytes(
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
  )
);

/**
 * 生成 Permit 簽名
 */
async function signPermit(
  token: any,
  owner: any,
  spender: string,
  value: bigint,
  deadline: number
): Promise<{ v: number; r: string; s: string }> {
  // 1. 獲取當前 nonce
  const nonce = await token.nonces(owner.address);

  // 2. 獲取 domain separator
  const domainSeparator = await token.DOMAIN_SEPARATOR();

  console.log("\n📝 準備簽名數據:");
  console.log("Owner:", owner.address);
  console.log("Spender:", spender);
  console.log("Value:", ethers.formatEther(value));
  console.log("Nonce:", nonce.toString());
  console.log("Deadline:", new Date(deadline * 1000).toLocaleString());

  // 3. 構建 EIP-712 domain
  const domain = {
    name: await token.name(),
    version: "1",
    chainId: (await ethers.provider.getNetwork()).chainId,
    verifyingContract: await token.getAddress(),
  };

  // 4. 定義類型
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  // 5. 定義值
  const message = {
    owner: owner.address,
    spender: spender,
    value: value,
    nonce: nonce,
    deadline: deadline,
  };

  // 6. 使用 ethers.js 的 signTypedData 進行簽名
  const signature = await owner.signTypedData(domain, types, message);
  const sig = ethers.Signature.from(signature);

  console.log("\n✅ 簽名完成:");
  console.log("Signature:", signature);
  console.log("v:", sig.v);
  console.log("r:", sig.r);
  console.log("s:", sig.s);

  return {
    v: sig.v,
    r: sig.r,
    s: sig.s,
  };
}

/**
 * 演示 Permit 功能
 */
async function demonstratePermit() {
  console.log("\n🚀 開始 Permit Token 演示\n");
  console.log("=".repeat(60));

  // 1. 設定環境（這裡使用本地測試網絡）
  // 實際使用時需要連接到真實網絡或本地節點
  console.log("\n⚙️  設定環境...");
  console.log("提示：請確保已啟動本地 Hardhat 節點");
  console.log("指令：npx hardhat node");

  // 2. 模擬部署（實際需要先部署合約）
  console.log("\n📋 場景說明:");
  console.log("• Alice 想要授權 Bob 花費她的代幣");
  console.log("• 傳統方式：Alice 需要先調用 approve()（花費 gas）");
  console.log("• Permit 方式：Alice 只需離線簽名（完全免費）");

  console.log("\n" + "=".repeat(60));
  console.log("💡 Permit 的優勢");
  console.log("=".repeat(60));
  console.log("✅ Alice 不需要發送鏈上交易");
  console.log("✅ Alice 甚至不需要持有 ETH");
  console.log("✅ Bob 可以在轉帳時一併驗證授權");
  console.log("✅ 節省一筆 approve 交易的 gas 費用");

  console.log("\n" + "=".repeat(60));
  console.log("📖 Permit 工作流程");
  console.log("=".repeat(60));
  console.log("\n步驟 1️⃣：Alice 離線簽署 Permit 訊息");
  console.log("   • 包含：owner, spender, value, nonce, deadline");
  console.log("   • 使用 EIP-712 結構化簽名");
  console.log("   • 完全離線，不消耗 gas");

  console.log("\n步驟 2️⃣：Alice 將簽名傳給 Bob（或中繼者）");
  console.log("   • 可以透過任何方式傳遞");
  console.log("   • 例如：API、WebSocket、QR Code 等");

  console.log("\n步驟 3️⃣：Bob 調用 permit() + transferFrom()");
  console.log("   • permit() 驗證簽名並設定授權");
  console.log("   • transferFrom() 立即轉移代幣");
  console.log("   • Bob 支付所有 gas 費用");

  console.log("\n" + "=".repeat(60));
  console.log("🔐 安全機制");
  console.log("=".repeat(60));
  console.log("• Nonce：防止重放攻擊，每次使用後自動遞增");
  console.log("• Deadline：簽名有時效性，過期自動失效");
  console.log("• Domain Separator：綁定特定鏈和合約");
  console.log("• EIP-712：結構化數據，用戶可清楚看到簽名內容");

  console.log("\n" + "=".repeat(60));
  console.log("💻 程式碼示例");
  console.log("=".repeat(60));

  console.log("\n// 1. 構建 Domain");
  console.log(`const domain = {
  name: "PermitToken",
  version: "1",
  chainId: 1,
  verifyingContract: "0x..."
};`);

  console.log("\n// 2. 定義類型");
  console.log(`const types = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};`);

  console.log("\n// 3. 準備訊息");
  console.log(`const message = {
  owner: alice.address,
  spender: bob.address,
  value: ethers.parseEther("100"),
  nonce: 0,
  deadline: Math.floor(Date.now() / 1000) + 3600
};`);

  console.log("\n// 4. 簽名");
  console.log(
    `const signature = await alice.signTypedData(domain, types, message);`
  );

  console.log("\n// 5. 使用簽名");
  console.log(
    `await token.permit(owner, spender, value, deadline, v, r, s);`
  );
  console.log(`await token.transferFrom(owner, recipient, value);`);

  console.log("\n" + "=".repeat(60));
  console.log("🌍 實際應用案例");
  console.log("=".repeat(60));
  console.log("\n1. Uniswap V2/V3");
  console.log("   • 用戶可以無 gas 授權代幣");
  console.log("   • 在交換時才支付一次 gas");

  console.log("\n2. DEX 聚合器（如 1inch）");
  console.log("   • 批量授權多個代幣");
  console.log("   • 優化用戶體驗");

  console.log("\n3. DeFi 協議");
  console.log("   • 質押、借貸時的代幣授權");
  console.log("   • 新用戶友好（無需先持有 ETH）");

  console.log("\n4. NFT Marketplace");
  console.log("   • 使用 WETH permit 進行 gasless 授權");

  console.log("\n" + "=".repeat(60));
  console.log("⚠️  常見陷阱與解決方案");
  console.log("=".repeat(60));

  console.log("\n❌ 陷阱 1：忘記檢查 deadline");
  console.log("✅ 解決：始終設定合理的過期時間（如 1 小時）");

  console.log("\n❌ 陷阱 2：Nonce 不同步");
  console.log("✅ 解決：簽名前先查詢最新的 nonce");

  console.log("\n❌ 陷阱 3：簽名在錯誤的鏈上使用");
  console.log("✅ 解決：Domain Separator 會自動綁定 chainId");

  console.log("\n❌ 陷阱 4：重複使用同一個簽名");
  console.log("✅ 解決：每次 permit 後 nonce 自動增加，防止重放");

  console.log("\n" + "=".repeat(60));
  console.log("🧪 測試要點");
  console.log("=".repeat(60));
  console.log("1. ✅ 驗證正確的簽名可以授權");
  console.log("2. ✅ 過期的簽名會被拒絕");
  console.log("3. ✅ 錯誤的 nonce 會被拒絕");
  console.log("4. ✅ 簽名只能使用一次");
  console.log("5. ✅ 不同鏈的簽名不能互用");

  console.log("\n" + "=".repeat(60));
  console.log("📚 延伸閱讀");
  console.log("=".repeat(60));
  console.log("• EIP-2612 規範: https://eips.ethereum.org/EIPS/eip-2612");
  console.log("• OpenZeppelin ERC20Permit 文檔");
  console.log("• Uniswap Permit2 (進階版本)");

  console.log("\n" + "=".repeat(60));
  console.log("✅ 演示完成！");
  console.log("=".repeat(60));
  console.log("\n要實際運行此演示，請：");
  console.log("1. 部署 PermitToken 合約");
  console.log("2. 取消註解實際代碼部分");
  console.log("3. 配置正確的 RPC 端點");
  console.log("4. 執行：npx ts-node permit-demo.ts\n");
}

/**
 * 實際程式碼範例（需要部署合約後才能執行）
 */
async function actualImplementation() {
  console.log("\n🔧 實際實作（需要真實環境）\n");

  // 取消註解以下代碼來實際執行：
  /*
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const [owner, spender, recipient] = await provider.listAccounts();
  
  // 部署合約
  const PermitToken = await ethers.getContractFactory("PermitToken");
  const token = await PermitToken.deploy(ethers.parseEther("1000000"));
  await token.waitForDeployment();
  
  console.log("Token deployed to:", await token.getAddress());
  
  // 授權金額
  const amount = ethers.parseEther("100");
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 小時後過期
  
  // 簽名
  const { v, r, s } = await signPermit(
    token,
    owner,
    spender.address,
    amount,
    deadline
  );
  
  // 使用 permit
  const tx = await token.connect(spender).permitAndTransfer(
    owner.address,
    spender.address,
    amount,
    deadline,
    v,
    r,
    s,
    recipient.address
  );
  
  await tx.wait();
  console.log("\n✅ Permit 授權並轉帳成功！");
  console.log("接收者餘額:", ethers.formatEther(await token.balanceOf(recipient.address)));
  */
}

// 執行演示
demonstratePermit().catch(console.error);

