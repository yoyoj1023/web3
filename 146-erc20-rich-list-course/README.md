# ERC20 富豪榜開發課程

> 使用 Scaffold-Alchemy 打造 ERC20 代幣富豪榜應用

## 📚 課程概述

本課程將帶領學員從零開始，使用當前熱門的 Web3 開發框架 `scaffold-alchemy`，親手部署一個 ERC20 代幣至 Optimism Sepolia 測試網路。更進一步，我們將學習如何利用 Alchemy 提供的強大 API，打造一個動態前端應用程式，用以查詢並展示任何 ERC20 代幣的富豪榜（Top Holders）。

## 🎯 學習目標

完成本課程後，學員將能夠：

- ✅ 獨立設定並運行 `scaffold-alchemy` 開發環境
- ✅ 編寫並使用 Hardhat 將 ERC20 智能合約部署到 Layer 2 網路 (Optimism Sepolia)
- ✅ 熟悉 `scaffold-alchemy` 的專案結構，並能客製化其前端介面
- ✅ 整合 Alchemy 的 Token API，高效獲取鏈上代幣持有者數據
- ✅ 運用 `scaffold-alchemy` 內建的 React Hooks 進行鏈上數據的讀取與狀態管理
- ✅ 使用內建的 UI 元件庫，快速建構美觀且功能完善的前端頁面

## 📖 課程結構

### 單元一：課程介紹與環境設定

#### [第一課：課程介紹與目標](./單元一/1-課程介紹與目標.md)
- 🎯 課程總覽與最終成品展示
- 🚀 技術亮點和學習收穫
- 🌟 為什麼選擇這個專案

#### [第二課：Scaffold-Alchemy 框架介紹](./單元一/2-Scaffold-Alchemy框架介紹.md)
- 🏗️ 核心架構與特色功能
- 🚀 開發效率提升 10x
- 🔮 與其他框架的比較

#### [第三課：專案初始化與環境設定](./單元一/3-專案初始化與環境設定.md)
- 🛠️ 環境準備檢查清單
- 🚀 專案初始化步驟
- ⚙️ 環境變數設定

### 單元二：ERC20 智能合約的部署

#### [第一課：編寫你的第一個 ERC20 代幣](./單元二/1-編寫ERC20智能合約.md)
- 📚 ERC20 標準簡介
- 🛠️ 使用 OpenZeppelin 建立代幣合約
- 🔒 安全特性與最佳實踐
- 🧪 完整的合約測試

#### [第二課：設定 Hardhat 部署腳本](./單元二/2-設定Hardhat部署腳本.md)
- ⚙️ 配置 Hardhat 網路設定
- 📜 編寫自動化部署腳本
- 🧪 測試數據生成腳本

#### [第三課：執行部署與鏈上驗證](./單元二/3-執行部署與鏈上驗證.md)
- 🚀 執行實際部署流程
- 🔍 區塊鏈瀏覽器驗證
- 🧪 測試合約功能
- 📊 驗證部署資訊

### 單元三：前端基礎建設 - 打造查詢介面

#### [第一課：Scaffold-Alchemy 前端元件介紹](./單元三/1-Scaffold-Alchemy前端元件介紹.md)
- 🧩 元件庫架構概覽
- 🔍 核心輸入元件詳解
- 🖼️ 顯示元件詳解
- 🎨 樣式客製化技巧

#### [第二課：建立富豪榜查詢頁面](./單元三/2-建立富豪榜查詢頁面.md)
- 🏗️ 頁面架構設計
- 📝 實作頁面組件
- 🔗 自定義 Hook 實作
- 📱 移動端優化

## 🛠️ 技術棧

### 前端技術
- **Next.js 13+**: App Router, 伺服器端渲染
- **React 18**: Hooks, Suspense, 並發特性
- **TypeScript**: 類型安全和更好的開發體驗
- **Tailwind CSS**: 實用優先的 CSS 框架

### 區塊鏈技術
- **Hardhat**: 智能合約開發環境
- **Viem**: 現代化的 Web3 客戶端
- **Wagmi**: React Hooks for Ethereum
- **Alchemy**: 企業級區塊鏈 API

### 開發工具
- **ESLint + Prettier**: 代碼品質和格式化
- **Husky**: Git hooks 自動化
- **Jest**: 單元測試框架

## 🚀 快速開始

### 先決條件

- Node.js v18+ 
- Yarn v1.22+
- Git
- MetaMask 或其他 Web3 錢包
- Alchemy 帳戶和 API Key

### 安裝步驟

1. **建立新專案**
   ```bash
   npx create-web3-dapp erc20-rich-list
   cd erc20-rich-list
   ```

2. **安裝依賴**
   ```bash
   yarn install
   ```

3. **設定環境變數**
   ```bash
   # 在 packages/hardhat/.env
   DEPLOYER_PRIVATE_KEY=your_private_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   
   # 在 packages/nextjs/.env.local
   NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
   ```

4. **部署合約**
   ```bash
   cd packages/hardhat
   yarn deploy --network optimismSepolia
   ```

5. **啟動前端**
   ```bash
   cd packages/nextjs
   yarn dev
   ```

## 📁 專案結構

```
erc20-rich-list/
├── packages/
│   ├── hardhat/              # 智能合約開發環境
│   │   ├── contracts/        # 智能合約源碼
│   │   ├── deploy/           # 部署腳本
│   │   ├── test/             # 合約測試
│   │   └── scripts/          # 實用腳本
│   └── nextjs/               # 前端應用
│       ├── app/              # Next.js 13+ App Router
│       ├── components/       # React 元件
│       ├── hooks/            # 自定義 Hooks
│       └── utils/            # 工具函數
├── 單元一/                   # 課程內容：環境設定
├── 單元二/                   # 課程內容：合約開發
├── 單元三/                   # 課程內容：前端開發
└── README.md
```

## 🎨 功能特色

### 🏆 富豪榜查詢
- 輸入任何 ERC20 代幣合約地址
- 即時獲取代幣持有者排行榜
- 美觀的數據視覺化展示

### 📊 數據展示
- 持有者地址和餘額
- 佔總供應量的百分比
- 響應式表格設計

### 🔍 智能搜尋
- 地址格式驗證
- ENS 名稱解析支援
- 錯誤處理和用戶反饋

### 📱 響應式設計
- 移動端優化
- 現代化 UI/UX
- 暗色模式支援

## 🌐 支援網路

- **Optimism Sepolia** (測試網)
- **Optimism Mainnet** (生產環境)
- 可擴展至其他 EVM 兼容網路

## 📚 學習資源

### 官方文檔
- [Scaffold-Alchemy](https://scaffoldalchemy.io/)
- [Alchemy API](https://docs.alchemy.com/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [Hardhat](https://hardhat.org/)

### 社群資源
- [Scaffold-Alchemy Discord](https://discord.gg/scaffoldalchemy)
- [Alchemy Discord](https://discord.gg/alchemy)
- [Optimism Discord](https://discord.gg/optimism)

## 🤝 貢獻指南

我們歡迎各種形式的貢獻！

1. **Fork 專案**
2. **建立功能分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **開啟 Pull Request**

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

感謝以下專案和社群的支持：

- [Scaffold-Alchemy](https://scaffoldalchemy.io/) 團隊
- [Alchemy](https://alchemy.com/) 提供的 API 服務
- [OpenZeppelin](https://openzeppelin.com/) 的安全合約庫
- [Optimism](https://optimism.io/) 生態系統

---

## 📞 聯絡資訊

如果你有任何問題或建議，歡迎聯絡我們：

- **Email**: contact@example.com
- **Twitter**: [@YourTwitter](https://twitter.com/YourTwitter)
- **Discord**: 加入我們的 [Discord 社群](https://discord.gg/your-discord)

---

**準備好開始你的 Web3 開發之旅了嗎？讓我們一起建立下一個偉大的 DApp！** 🚀
