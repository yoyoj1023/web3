# 帳戶抽象（Account Abstraction）入門專案

## 📚 專案簡介

這是一個基於 Hardhat 的 ERC-4337 帳戶抽象入門專案，旨在幫助開發者理解和實踐帳戶抽象技術。帳戶抽象允許用戶使用智能合約作為錢包，而不僅僅是外部擁有帳戶（EOA），提供更靈活的帳戶管理和交易執行方式。

## 🎯 專案特色

- **簡單的帳戶抽象實現**：基於 ERC-4337 標準
- **帳戶工廠模式**：動態創建智能合約帳戶
- **Hardhat 整合**：完整的開發、測試、部署工具鏈
- **多網路支援**：支援本地網路和 Optimism Sepolia 測試網

## 📁 專案結構

```
85-au-account-abstraction/
├── contracts/
│   ├── Account.sol         # 主要的帳戶抽象合約
│   └── Lock.sol           # Hardhat 示例合約
├── test/
│   └── test.ts            # 測試腳本
├── ignition/
│   └── modules/
│       └── Lock.ts        # 部署模組
├── hardhat.config.ts      # Hardhat 配置文件
├── package.json           # 專案依賴
└── README.md              # 專案說明文件
```

## 🛠 技術棧

- **Solidity**: ^0.8.12
- **Hardhat**: ^2.22.19
- **TypeScript**: ^5.8.3
- **Account Abstraction Contracts**: ^0.6.0
- **OpenZeppelin Contracts**: ^4.2.0
- **Ethers.js**: ^6.13.5

## 🚀 快速開始

### 1. 安裝依賴

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 2. 環境配置

創建 `.env` 文件並配置以下變數：

```env
# Optimism Sepolia RPC URL
OP_SEPOLIA_RPC_URL_API_KEY=your_rpc_url_here

# 私鑰（測試網用）
PRIVATE_KEY=your_private_key_here
```

### 3. 編譯合約

```bash
npx hardhat compile
```

### 4. 運行測試

```bash
npx hardhat test
```

### 5. 啟動本地網路

```bash
npx hardhat node
```

### 6. 部署合約

部署到本地網路：
```bash
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost
```

部署到 Optimism Sepolia：
```bash
npx hardhat ignition deploy ./ignition/modules/Lock.ts --network optimismSepolia
```

## 📝 合約說明

### Account.sol

這是主要的帳戶抽象合約，實現了 `IAccount` 介面：

- **功能**：
  - `validateUserOp()`: 驗證用戶操作
  - `increment()`: 示例函數，用於演示合約功能
  - `count`: 公開變數，記錄操作次數
  - `owner`: 帳戶擁有者地址

### AccountFactory.sol

帳戶工廠合約，用於創建新的帳戶抽象合約：

- **功能**：
  - `createAccount(address _owner)`: 為指定擁有者創建新的智能合約帳戶

## 🔧 開發指令

```bash
# 編譯合約
npx hardhat compile

# 運行測試
npx hardhat test

# 檢查 Gas 使用情況
REPORT_GAS=true npx hardhat test

# 啟動本地區塊鏈節點
npx hardhat node

# 部署合約
npx hardhat ignition deploy ./ignition/modules/Lock.ts

# 清理編譯產物
npx hardhat clean

# 查看幫助
npx hardhat help
```

## 🌐 支援的網路

- **Hardhat 本地網路**: Chain ID 31337
- **Optimism Sepolia**: 測試網路
- **自定義網路**: 可在 `hardhat.config.ts` 中配置

## 📖 學習資源

### 帳戶抽象相關

- [ERC-4337 規範](https://eips.ethereum.org/EIPS/eip-4337)
- [Account Abstraction 官方文檔](https://docs.alchemy.com/docs/account-abstraction)
- [Ethereum Foundation AA 資源](https://ethereum.org/developers/docs/accounts/)

### 開發工具

- [Hardhat 文檔](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js 文檔](https://docs.ethers.org/)

## 🤝 貢獻指南

1. Fork 此專案
2. 創建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權條款

此專案採用 [UNLICENSED] 授權條款。

## ⚠️ 免責聲明

此專案僅供學習和測試用途。請勿在主網上部署未經充分測試的合約。在生產環境中使用前，請確保進行全面的安全審計。

## 🆘 支援與協助

如果您在使用過程中遇到問題，請：

1. 查看 [Issues](../../issues) 是否有類似問題
2. 創建新的 Issue 描述您的問題
3. 提供詳細的錯誤資訊和重現步驟

---

**祝您學習愉快！🎉**
