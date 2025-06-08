# Ethernaut DEX 挑戰

這個專案是 [Ethernaut](https://ethernaut.openzeppelin.com/) 的 DEX 挑戰實現，展示了一個簡單的去中心化交易所 (DEX) 及其相關的安全漏洞。

## 專案概述

本專案包含兩個主要合約：
- **Dex**: 一個簡單的 DEX 合約，允許兩種代幣之間的交換
- **SwappableToken**: 可交換的 ERC20 代幣合約

## 合約功能

### Dex 合約
- **setTokens**: 設定兩個可交換的代幣地址 (僅 owner)
- **addLiquidity**: 添加流動性 (僅 owner)
- **swap**: 在兩個代幣之間進行交換
- **getSwapPrice**: 計算交換價格
- **approve**: 批准代幣花費
- **balanceOf**: 查詢代幣餘額

### SwappableToken 合約
- 標準 ERC20 代幣實現
- 與 DEX 合約整合
- 包含特殊的 approve 邏輯

## 安全考量

⚠️ **警告**: 這個 DEX 實現包含已知的安全漏洞，僅用於教育目的。不應在生產環境中使用。

主要漏洞包括：
1. 價格計算邏輯存在缺陷，可能導致價格操縱
2. 流動性管理不當
3. 缺乏滑點保護

## 安裝與設置

```bash
# 安裝依賴
npm install

# 或使用 yarn
yarn install
```

## 使用方法

### 編譯合約
```bash
npx hardhat compile
```

### 運行測試
```bash
npx hardhat test
```

### 運行本地節點
```bash
npx hardhat node
```

### 部署合約
```bash
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

## 挑戰目標

Ethernaut DEX 挑戰的目標通常是：
1. 理解 DEX 的工作原理
2. 發現價格計算中的漏洞
3. 利用漏洞來操縱代幣價格
4. 學習如何保護 DEX 免受此類攻擊

## 技術棧

- **Solidity**: 智能合約開發語言
- **Hardhat**: 以太坊開發框架
- **OpenZeppelin**: 安全的智能合約庫
- **TypeScript**: 腳本和測試語言

## 檔案結構

```
92-ethernaut-dex/
├── contracts/
│   └── Dex.sol              # DEX 和代幣合約
├── test/                    # 測試文件
├── ignition/               # 部署腳本
├── hardhat.config.ts       # Hardhat 配置
└── package.json           # 項目依賴
```

## 學習資源

- [Ethernaut 官方網站](https://ethernaut.openzeppelin.com/)
- [OpenZeppelin 文檔](https://docs.openzeppelin.com/)
- [Hardhat 文檔](https://hardhat.org/docs)
- [Solidity 文檔](https://docs.soliditylang.org/)

## 貢獻

歡迎提交 issues 和 pull requests 來改進此專案。

## 授權

此專案基於 MIT 授權條款。

---

**免責聲明**: 此代碼僅供教育和學習目的。請勿在生產環境中使用，因為它包含已知的安全漏洞。
