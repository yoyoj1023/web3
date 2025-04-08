# Hardhat & 前端示例專案

這個專案展示了一個基本的 Hardhat 用例，內含一個範例合約、一個針對該合約的測試，以及一個用於部署合約的 Hardhat Ignition 模組。

請嘗試執行以下 Hardhat 指令：
```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

## 前端 (React + Vite)

此目錄包含一個由 Vite 啟動的 React 專案，展示一個簡單的 HelloWorld 畫面。

### 前置需求
- Node.js 14 或以上版本
- npm 或 yarn

### 環境設置與執行

1. 切換到 frontend 目錄：
   ```shell
   cd frontend
   ```
2. 安裝所需依賴：
   ```shell
   npm install
   ```
3. 啟動開發伺服器：
   ```shell
   npm run dev
   ```
4. 使用瀏覽器開啟提供的 URL（通常為 http://localhost:3000）以檢視 HelloWorld 畫面。

### 生產環境編譯
1. 編譯專案：
   ```shell
   npm run build
   ```
2. 預覽生產版本：
   ```shell
   npm run preview
   ```
