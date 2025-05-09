# 加密貨幣價格查詢應用

這是一個基於 Scaffold-ETH 2 框架開發的 Web3 應用程式，允許用戶查詢 BTC 和 ETH 的即時價格資訊。應用使用 Chainlink 預言機來獲取可靠的加密貨幣價格數據。

![示例圖片](https://github.com/yoyoj1023/dapps/blob/main/07-scaffold-prices-getter/sample.png)

- 部署網址： [網站連結](https://prices-getter.vercel.app/prices)
- 部署合約： [已驗證合約地址](https://sepolia-optimistic.etherscan.io/address/0xF2AAAf372B1c91Ba025d6BDA464431Dfe1B4B504#code)

## 功能特點

- 🔍 查詢比特幣 (BTC) 實時價格
- 💰 查詢以太幣 (ETH) 實時價格 
- ⏱️ 顯示價格更新時間戳
- 🔄 視覺化更新動畫效果
- 🌐 可部署在多種以太坊網絡 (支援測試網和主網)

## 技術棧

- **前端框架**: Next.js 15.x
- **UI 組件**: Tailwind CSS, DaisyUI
- **區塊鏈交互**: wagmi, viem, ethers.js
- **智能合約**: Solidity 0.8.x
- **開發環境**: Hardhat
- **Oracle 服務**: Chainlink 預言機

## 前置需求

開始前，請確保你的環境已安裝：

- [Node.js](https://nodejs.org/) (>= 20.18.3)
- [Yarn](https://yarnpkg.com/) (>= 3.2.3)
- [Git](https://git-scm.com/)

## 安裝指南

1. 克隆專案儲存庫：

```bash
git clone https://github.com/yourusername/73-scaffold-btc-price.git
cd 73-scaffold-btc-price/get-btc-price
```

2. 安裝依賴：

```bash
yarn install
```

3. 環境設置：

複製 `.env.example` 為 `.env.local`，並根據需要修改環境變數。

```bash
cp .env.example .env.local
```

## 運行方式

### 本地開發

1. 啟動本地以太坊網絡

```bash
yarn chain
```

2. 在新的終端視窗中，部署智能合約

```bash
yarn deploy
```

3. 啟動前端應用程式

```bash
yarn start
```

4. 訪問應用程式

打開瀏覽器，訪問 [http://localhost:3000](http://localhost:3000)

### 部署到測試網

1. 配置網絡設置

編輯 `packages/hardhat/hardhat.config.ts` 檔案，確保你已經設置了正確的測試網絡 (如 OP Sepolia)。

2. 設置錢包私鑰

將你的錢包私鑰加入到 `.env.local` 檔案中：

```
DEPLOYER_PRIVATE_KEY=your_private_key_here
```

3. 部署合約到測試網

```bash
yarn deploy --network optimismSepolia
```

4. 啟動前端

```bash
yarn start
```

## 項目結構

```
get-btc-price/
├── packages/
│   ├── hardhat/                # 智能合約及區塊鏈相關
│   │   ├── contracts/          # Solidity 合約檔案
│   │   │   └── PriceFeed.sol   # 價格查詢合約
│   │   ├── deploy/             # 部署腳本
│   │   └── ...
│   └── nextjs/                 # 前端應用
│       ├── app/                # Next.js 頁面
│       │   ├── prices/         # 價格查詢頁面
│       │   └── ...
│       ├── components/         # 共用組件
│       └── ...
├── package.json
└── README.md
```

## 智能合約說明

### PriceFeed.sol

`PriceFeed.sol` 合約用於與 Chainlink 預言機交互，獲取 BTC 和 ETH 的實時價格數據。

主要功能:
- `getBTCPrice()`: 獲取 BTC/USD 價格
- `getETHPrice()`: 獲取 ETH/USD 價格
- `getBTCDecimals()`: 獲取 BTC 價格的小數位數
- `getETHDecimals()`: 獲取 ETH 價格的小數位數

## 前端功能說明

- **Header**: 導航欄包含 "Home", "Debug Contracts" 和 "get prices" 三個主要頁面鏈接
- **Prices Page**: 顯示 BTC 和 ETH 的價格查詢介面，包括:
  - 價格顯示區域
  - 查詢按鈕
  - 最後更新時間戳
  - 視覺化更新動畫

## 注意事項

- 在測試網上使用時，請確保你的錢包中有足夠的測試網代幣支付交易費用
- Chainlink 預言機在不同網絡上的地址可能不同，請根據部署的目標網絡調整 `PriceFeed.sol` 中的預言機地址
- 預言機數據有更新週期，短時間內多次查詢可能返回相同的價格數據

## 貢獻指南

歡迎提交 Pull Request 或建立 Issue 來改進這個專案。

## 授權

本專案採用 MIT 授權條款。
