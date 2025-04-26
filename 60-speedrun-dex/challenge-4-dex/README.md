# 🏗 Scaffold-ETH Challenge 4: Build a DEX (去中心化交易所)

## 🚩 挑戰詳情

在這個挑戰中，我們建立了一個去中心化交易所 (DEX)，讓使用者可以在 ETH 和自定義 ERC20 代幣 (BAL) 之間進行交換。

![示例圖片](https://github.com/yoyoj1023/dapps/blob/main/05-dice-game/sample.png)

![示例圖片](https://github.com/yoyoj1023/dapps/blob/main/05-dice-game/sample2.png)

- 部署網址： [網站連結](https://60-speedrun-dex.vercel.app/)
- 部署合約： [已驗證合約地址](https://sepolia-optimism.etherscan.io/address/0x0EA37cc43567dF4BA5C332df9c0922527E121fe7)


## ⚔️ 攻略流程

### 1. 理解 DEX 合約

首先需要理解 `DEX.sol` 合約的核心功能：
- 初始化流動性池 (`init`)
- 交換 ETH 到代幣 (`ethToToken`)
- 交換代幣到 ETH (`tokenToEth`)
- 提供流動性 (`deposit`)
- 移除流動性 (`withdraw`)

### 2. 實現合約功能

DEX 合約需要實現以下關鍵功能：

- **自動市場機制 (AMM)** - 使用恆定乘積公式 `x * y = k`，這是 Uniswap V2 的核心機制
- **流動性提供者代幣 (LP tokens)** - 追蹤流動性提供者的貢獻份額
- **價格預測** - 使用恆定乘積公式計算交換比率
- **互換功能** - 實現代幣與 ETH 之間的互換

### 3. 前端整合

將合約功能與前端連接，提供友好的使用者界面，包括：
- 查看池子資訊
- 交換代幣界面
- 提供/移除流動性界面

## 🔍 解題關鍵

1. **恆定乘積公式 (x * y = k)**
   - 這是自動做市商的核心，確保池子中 ETH 和代幣的乘積在每次交易後保持不變
   - 公式： `tokenReserve * ethReserve = k`

2. **滑點管理**
   - 大量交易會導致價格滑點，合約計算公式需考慮這一點
   - 計算公式：`tokenOutput = (ethInput * tokenReserve) / (ethReserve + ethInput)`

3. **流動性提供機制**
   - 確保使用者提供的代幣與 ETH 比例符合當前池中比例
   - 流動性代幣數量計算：`liquidityMinted = (msg.value * totalLiquidity) / ethReserve`

4. **重入攻擊防護**
   - 使用 `lock` 修飾器防止重入攻擊

## 💡 主要功能介紹

### 1. 自動做市商 (AMM)
- 基於恆定乘積公式自動計算交換比率
- 不需要訂單簿或對手方，流動性永遠可用

### 2. 流動性池
- 使用者可以提供 ETH 和 BAL 代幣到流動性池
- 流動性提供者獲得代表其池份額的流動性代幣

### 3. 代幣交換
- 使用者可以交換 ETH 到 BAL 代幣 (ethToToken)
- 使用者可以交換 BAL 代幣到 ETH (tokenToEth)

### 4. 流動性管理
- 提供流動性 (deposit)
- 移除流動性 (withdraw)

## 📝 使用說明

### 環境設置

```bash
# 安裝依賴
yarn install

# 在一個終端啟動本地鏈
yarn chain

# 在另一個終端部署合約
yarn deploy

# 啟動前端
yarn start
```

### 初始化 DEX

1. 點擊 "Mint" 按鈕以獲取 BAL 代幣
2. 點擊 "Approve" 按鈕允許 DEX 合約使用您的 BAL 代幣
3. 點擊 "Init DEX" 按鈕使用相同數量的 ETH 和 BAL 代幣初始化 DEX

### 交換代幣

1. 在 "Swap" 部分，輸入您要交換的數量
2. 點擊 "Swap ETH to BAL" 或 "Swap BAL to ETH" 按鈕完成交換

### 提供流動性

1. 在 "Liquidity" 部分，輸入您要提供的 ETH 數量
2. 系統會自動計算需要的 BAL 代幣數量
3. 點擊 "Deposit" 按鈕提供流動性

### 移除流動性

1. 輸入您要移除的流動性百分比
2. 點擊 "Withdraw" 按鈕移除流動性並收回相應的 ETH 和 BAL 代幣

## 📚 學習要點

- 了解自動做市商 (AMM) 的工作原理
- 流動性池的管理和流動性代幣的分配
- 恆定乘積公式和價格影響
- Solidity 合約安全性（重入攻擊防護等）

## 🧪 測試

```bash
cd packages/hardhat
yarn test
```

## 💬 支援

如果您對此 DEX 有任何問題或建議，請在 [Speedrun Ethereum Discord](https://discord.gg/N7JMnYGu)中提問。

---

該挑戰由 [Scaffold-ETH](https://github.com/scaffold-eth/scaffold-eth) 和 [SpeedRunEthereum.com](https://speedrunethereum.com) 提供。
