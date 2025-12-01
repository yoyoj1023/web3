# 簡單條件代幣 (Simple Conditional Tokens) 學習指南

## 📚 什麼是條件代幣？

條件代幣（Conditional Tokens）是一種預測市場的實現方式，允許用戶對未來事件的結果進行投注。這個簡化版本展示了核心概念：

- **YES 代幣**：代表你認為事件會發生（例如：BTC 會超過 10 萬美元）
- **NO 代幣**：代表你認為事件不會發生
- **分割（Split）**：存入 ETH，同時獲得等量的 YES 和 NO 代幣
- **贖回（Redeem）**：當結果揭曉後，持有正確結果代幣的人可以換回 ETH

## 🎯 核心概念

### 1. ERC-1155 多代幣標準

這個合約使用 **ERC-1155** 標準，這是一個強大的多代幣標準，允許：
- 在單一合約中管理多種不同的代幣
- 一次交易鑄造或轉移多種代幣（批量操作）
- 節省 Gas 費用

### 2. Token ID 設計邏輯

代幣 ID 的計算方式：`questionId * 10 + outcome`

```
問題 0：
  - NO 代幣 ID = 0 * 10 + 0 = 0
  - YES 代幣 ID = 0 * 10 + 1 = 1

問題 1：
  - NO 代幣 ID = 1 * 10 + 0 = 10
  - YES 代幣 ID = 1 * 10 + 1 = 11
```

### 3. 工作流程

```
1. 創建問題 (createQuestion)
   ↓
2. 用戶下注 (splitPosition) - 存入 ETH，獲得 YES + NO 代幣
   ↓
3. 等待事件發生...
   ↓
4. 開獎 (resolveQuestion) - 合約擁有者設定結果
   ↓
5. 贖回 (redeem) - 持有贏家代幣的人換回 ETH
```

## 🔧 合約功能詳解

### 功能 1: 創建問題 (`createQuestion`)

```solidity
function createQuestion(string memory _description) external onlyOwner
```

- **功能**：合約擁有者創建一個新的預測問題
- **參數**：問題描述（例如："Will BTC > 100k?"）
- **權限**：只有合約擁有者可以調用
- **結果**：創建一個新的問題，分配一個新的 `questionId`

**範例**：
```javascript
// 創建問題："比特幣會在 2024 年底超過 10 萬美元嗎？"
await contract.createQuestion("Will BTC > 100k by end of 2024?");
```

### 功能 2: 分割位置/下注 (`splitPosition`)

```solidity
function splitPosition(uint256 _questionId) external payable
```

- **功能**：用戶存入 ETH，同時獲得等量的 YES 和 NO 代幣
- **參數**：問題 ID
- **支付**：必須發送 ETH（`msg.value > 0`）
- **結果**：獲得 `msg.value` 數量的 YES 代幣和 `msg.value` 數量的 NO 代幣

**範例**：
```javascript
// 對問題 0 下注 1 ETH
await contract.splitPosition(0, { value: ethers.parseEther("1.0") });
// 結果：獲得 1 個 YES 代幣（ID=1）和 1 個 NO 代幣（ID=0）
```

**為什麼要同時獲得兩種代幣？**
- 這是一種「分割」機制，確保市場的流動性
- 如果你只想要 YES 代幣，可以稍後賣掉 NO 代幣給其他人
- 如果你只想要 NO 代幣，可以稍後賣掉 YES 代幣給其他人

### 功能 3: 決議/開獎 (`resolveQuestion`)

```solidity
function resolveQuestion(uint256 _questionId, uint256 _winningOutcome) external onlyOwner
```

- **功能**：合約擁有者設定問題的結果
- **參數**：
  - `_questionId`：問題 ID
  - `_winningOutcome`：贏家結果（0 = NO，1 = YES）
- **權限**：只有合約擁有者可以調用
- **結果**：問題標記為已解決，設定贏家結果

**範例**：
```javascript
// 設定問題 0 的結果為 YES（比特幣確實超過 10 萬）
await contract.resolveQuestion(0, 1);
```

### 功能 4: 贖回 (`redeem`)

```solidity
function redeem(uint256 _questionId) external
```

- **功能**：持有贏家代幣的用戶可以換回 ETH
- **參數**：問題 ID
- **條件**：問題必須已經開獎，且用戶必須持有贏家代幣
- **結果**：銷毀贏家代幣，發送等量的 ETH 給用戶

**範例**：
```javascript
// 如果你持有問題 0 的 YES 代幣，且結果是 YES
await contract.redeem(0);
// 結果：銷毀 YES 代幣，獲得 ETH
```

## 💡 學習重點

### 1. ERC-1155 的批量操作

注意 `splitPosition` 函數中如何使用 `_mintBatch`：

```solidity
uint256[] memory ids = new uint256[](2);
ids[0] = noTokenId;
ids[1] = yesTokenId;

uint256[] memory amounts = new uint256[](2);
amounts[0] = msg.value;
amounts[1] = msg.value;

_mintBatch(msg.sender, ids, amounts, "");
```

這是一次交易鑄造兩種不同的代幣，比分別鑄造兩次更節省 Gas。

### 2. 狀態管理

合約使用 `Question` 結構來追蹤每個問題的狀態：
- `resolved`：是否已開獎
- `winningOutcome`：贏家結果
- `description`：問題描述

### 3. 權限控制

使用 OpenZeppelin 的 `Ownable` 合約來控制：
- 只有擁有者可以創建問題
- 只有擁有者可以開獎（在實際應用中，這應該由預言機或去中心化機制處理）

### 4. 安全考量

這個簡化版本有一些限制（實際應用需要改進）：
- ⚠️ 開獎由單一擁有者控制（應該使用預言機）
- ⚠️ 沒有交易市場（無法直接買賣單一結果代幣）
- ⚠️ 沒有價格發現機制（YES 和 NO 代幣價格應該根據市場需求變化）

## 🧪 測試與部署

### 安裝依賴

```bash
npm install
```

### 編譯合約

```bash
npx hardhat compile
```

### 運行測試

```bash
# 運行所有測試
npx hardhat test

# 只運行 Solidity 測試
npx hardhat test solidity

# 只運行 TypeScript 測試
npx hardhat test nodejs
```

### 部署合約

```bash
# 部署到本地網絡
npx hardhat ignition deploy ignition/modules/SimpleConditionalTokens.ts

# 部署到 Sepolia 測試網
# 首先設置私鑰
npx hardhat keystore set SEPOLIA_PRIVATE_KEY

# 然後部署
npx hardhat ignition deploy --network sepolia ignition/modules/SimpleConditionalTokens.ts
```

## 📖 延伸學習

### 進階主題

1. **預言機整合**：使用 Chainlink 或其他預言機自動開獎
2. **自動做市商（AMM）**：實現 YES/NO 代幣的交易市場
3. **組合代幣**：支援多個結果的問題（不只是 YES/NO）
4. **部分贖回**：允許用戶部分贖回代幣
5. **手續費機制**：向用戶收取手續費

### 相關資源

- [ERC-1155 標準文檔](https://eips.ethereum.org/EIPS/eip-1155)
- [OpenZeppelin Contracts 文檔](https://docs.openzeppelin.com/contracts)
- [Gnosis Conditional Tokens](https://docs.gnosis.io/conditionaltokens/) - 實際應用的條件代幣系統

## 🎓 練習建議

1. **理解代幣 ID 計算**：嘗試計算不同問題的代幣 ID
2. **模擬完整流程**：創建問題 → 下注 → 開獎 → 贖回
3. **測試邊界情況**：嘗試在已開獎的問題上下注、贖回錯誤的代幣等
4. **擴展功能**：嘗試添加查詢餘額、查詢問題資訊等功能

## ⚠️ 注意事項

這是一個**簡化版本**的條件代幣系統，僅用於學習目的。實際應用需要考慮：
- 安全性審計
- Gas 優化
- 去中心化開獎機制
- 流動性管理
- 價格發現機制

---

**祝學習愉快！** 🚀
