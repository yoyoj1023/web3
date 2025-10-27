# Token Permit (EIP-2612)

> 實現 ERC20 的 gasless 授權

## 📖 什麼是 Permit？

Permit 是 EIP-2612 定義的標準，允許代幣擁有者透過離線簽名來授權他人使用自己的代幣，而不需要發送鏈上交易。

### 傳統授權流程

```
使用者 → approve(spender, amount) → 鏈上交易 → 消耗 gas
      ↓
spender → transferFrom(user, to, amount) → 鏈上交易 → 消耗 gas
```

**總共需要：2 筆交易，2 次 gas 費用**

### Permit 授權流程

```
使用者 → 離線簽名 permit 訊息 → 0 gas
      ↓
      簽名傳給 spender
      ↓
spender → permit() + transferFrom() → 鏈上交易 → 1 次 gas
```

**總共需要：1 筆交易，1 次 gas 費用（由 spender 支付）**

## 🎯 核心優勢

### 1. 節省 Gas
- 減少一筆 `approve()` 交易
- 使用者節省 ~45,000 gas

### 2. 更好的 UX
- 使用者不需要先發送交易等待確認
- 可以在一筆交易內完成授權和轉移

### 3. Gasless 體驗
- 使用者甚至不需要持有 ETH
- 適合新用戶 onboarding

### 4. 安全性
- 簽名有時效性（deadline）
- nonce 防止重放攻擊
- EIP-712 結構化簽名，用戶可清楚看到內容

## 🔑 Permit 訊息結構

```solidity
struct Permit {
    address owner;      // 代幣擁有者
    address spender;    // 被授權者
    uint256 value;      // 授權金額
    uint256 nonce;      // 當前 nonce（防重放）
    uint256 deadline;   // 過期時間戳
}
```

### 類型字串

```
Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)
```

## 💻 實作說明

### 合約實現

查看 [PermitToken.sol](./PermitToken.sol)

關鍵要點：

1. **繼承 ERC20Permit**
```solidity
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract PermitToken is ERC20, ERC20Permit {
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {}
}
```

2. **Permit 函數**
```solidity
function permit(
    address owner,
    address spender,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
) public
```

3. **Nonce 管理**
```solidity
mapping(address => uint256) public nonces;
```

### 前端實現

查看 [permit-demo.ts](./permit-demo.ts)

關鍵步驟：

1. **獲取 nonce**
```typescript
const nonce = await token.nonces(owner.address);
```

2. **構建 Domain**
```typescript
const domain = {
  name: await token.name(),
  version: "1",
  chainId: (await provider.getNetwork()).chainId,
  verifyingContract: await token.getAddress()
};
```

3. **簽名**
```typescript
const signature = await signer.signTypedData(domain, types, message);
```

4. **使用簽名**
```typescript
await token.permit(owner, spender, value, deadline, v, r, s);
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install ethers @openzeppelin/contracts
```

### 2. 運行演示

```bash
# 啟動本地節點
npx hardhat node

# 部署合約（另一個終端）
npx hardhat run scripts/deploy-permit-token.ts --network localhost

# 運行演示
npx ts-node 05-practical-examples/token-permit/permit-demo.ts
```

### 3. 測試合約

```bash
npx hardhat test test/PermitToken.test.ts
```

## 📝 使用範例

### 基本 Permit 流程

```typescript
import { ethers } from "ethers";

// 1. 準備數據
const owner = await signer.getAddress();
const spender = "0x...";
const value = ethers.parseEther("100");
const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小時後過期

// 2. 獲取 nonce
const nonce = await token.nonces(owner);

// 3. 構建 EIP-712 domain
const domain = {
  name: "PermitToken",
  version: "1",
  chainId: 1,
  verifyingContract: tokenAddress
};

// 4. 定義類型
const types = {
  Permit: [
    { name: "owner", type: "address" },
    { name: "spender", type: "address" },
    { name: "value", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" }
  ]
};

// 5. 構建訊息
const message = { owner, spender, value, nonce, deadline };

// 6. 簽名
const signature = await signer.signTypedData(domain, types, message);
const { v, r, s } = ethers.Signature.from(signature);

// 7. 調用 permit
await token.permit(owner, spender, value, deadline, v, r, s);
```

### 一鍵授權並轉帳

```typescript
// 使用我們的便利函數
await token.permitAndTransfer(
  owner,
  spender,
  value,
  deadline,
  v, r, s,
  recipient  // 實際接收者
);
```

## 🔒 安全考量

### 1. Deadline 檢查

```solidity
require(block.timestamp <= deadline, "Permit expired");
```

**最佳實踐：**
- 前端：設定合理的過期時間（如 1 小時）
- 合約：嚴格檢查 deadline

### 2. Nonce 管理

```solidity
require(nonces[owner] == nonce, "Invalid nonce");
nonces[owner]++;
```

**防止：**
- ✅ 重放攻擊
- ✅ 簽名重複使用

### 3. 簽名驗證

```solidity
address recoveredAddress = ecrecover(digest, v, r, s);
require(recoveredAddress == owner, "Invalid signature");
```

**注意：**
- 檢查 `s` 值防止簽名可塑性
- 使用 OpenZeppelin 的 ECDSA 庫

### 4. Domain Separator

```solidity
DOMAIN_SEPARATOR = keccak256(
    abi.encode(
        TYPE_HASH,
        NAME_HASH,
        VERSION_HASH,
        block.chainid,
        address(this)
    )
);
```

**防止：**
- ✅ 跨鏈重放
- ✅ 跨合約重放

## 🌍 實際應用案例

### 1. Uniswap V2/V3

- 使用 Permit 進行無 gas 授權
- 用戶體驗：一鍵完成授權和交換

### 2. DEX 聚合器

- 1inch、Matcha 等都支援 Permit
- 批量授權多個代幣

### 3. Uniswap Permit2

- 進化版的 Permit
- 支援批量授權和更多功能

### 4. DeFi 協議

- Aave、Compound 等借貸協議
- MakerDAO 的 DAI 代幣
- 質押和流動性挖礦

## ⚠️ 常見陷阱

### 1. ❌ 忘記檢查 deadline

```solidity
// 錯誤：沒有檢查過期時間
function permit(..., uint256 deadline) {
    // 忘記檢查
}

// ✅ 正確
function permit(..., uint256 deadline) {
    require(block.timestamp <= deadline, "Permit expired");
}
```

### 2. ❌ Nonce 同步問題

```typescript
// 錯誤：使用硬編碼的 nonce
const nonce = 0;

// ✅ 正確：總是查詢最新的 nonce
const nonce = await token.nonces(owner);
```

### 3. ❌ 簽名可塑性

```solidity
// ✅ 使用 OpenZeppelin 的 ECDSA 庫
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
using ECDSA for bytes32;

address signer = digest.recover(signature);
```

### 4. ❌ 不支援 Permit 的代幣

```typescript
// 檢查代幣是否支援 Permit
const supportsPermit = await token.DOMAIN_SEPARATOR().catch(() => false);
if (!supportsPermit) {
    // 降級為傳統 approve
    await token.approve(spender, amount);
}
```

## 🧪 測試案例

### 基本功能測試

```typescript
describe("PermitToken", () => {
  it("should permit with valid signature", async () => {
    // 測試正常的 permit 流程
  });

  it("should reject expired permit", async () => {
    // 測試過期的簽名
  });

  it("should reject invalid nonce", async () => {
    // 測試錯誤的 nonce
  });

  it("should prevent replay attacks", async () => {
    // 測試重放攻擊防護
  });
});
```

## 📚 延伸閱讀

### 規範文檔
- [EIP-2612: Permit Extension for EIP-20](https://eips.ethereum.org/EIPS/eip-2612)
- [EIP-712: Typed Structured Data](https://eips.ethereum.org/EIPS/eip-712)

### 實作參考
- [OpenZeppelin ERC20Permit](https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#ERC20Permit)
- [Uniswap V2 Permit](https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2ERC20.sol)

### 進階主題
- [Uniswap Permit2](https://github.com/Uniswap/permit2)
- [Gasless Transactions](https://docs.openzeppelin.com/contracts/4.x/api/metatx)

## 🎓 練習題

### 初級

1. 部署一個支援 Permit 的代幣
2. 使用 Permit 進行一次授權
3. 驗證 nonce 增加

### 中級

4. 實現 permitAndTransfer 函數
5. 測試過期簽名的處理
6. 處理不同 chainId 的情況

### 高級

7. 實現批量 permit（類似 Permit2）
8. 添加 EIP-1271 智能合約簽名支援
9. 優化 gas 消耗

---

[返回第五章目錄](../README.md)

