# 以太坊區塊瀏覽器

這是一個使用 React 和 AlchemySDK 構建的以太坊區塊瀏覽器，可以讓使用者瀏覽以太坊區塊鏈上的區塊、交易和地址資訊。

![示例圖片](https://github.com/yoyoj1023/dapps/blob/main/08-au-blockexplorer/sample1.png)

![示例圖片](https://github.com/yoyoj1023/dapps/blob/main/08-au-blockexplorer/sample2.png)

## 功能特點

- 顯示最新的以太坊區塊和交易
- 區塊詳情頁面，包含區塊的完整資訊和交易列表
- 交易詳情頁面，包含交易的詳細資訊和事件日誌
- 地址頁面，顯示 ETH 餘額和 ERC-20 代幣餘額
- 搜尋功能，支援區塊號碼、交易雜湊和地址
- 響應式設計，適用於各種裝置

## 技術棧

- React.js - 前端框架
- React Router - 前端路由
- AlchemySDK - 與以太坊區塊鏈交互
- ethers.js - 以太坊工具庫
- date-fns - 日期時間格式化工具

## 安裝與運行

### 前置需求

- Node.js 和 npm/yarn
- Alchemy API 金鑰 (免費註冊獲取)

### 設置步驟

1. 複製此專案到本地：

```bash
git clone <專案URL>
cd ethereum-block-explorer
```

2. 安裝依賴：

```bash
yarn install
# 或
npm install
```

3. 在根目錄創建 `.env` 檔案，並添加你的 Alchemy API 金鑰：

```
REACT_APP_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
```

4. 啟動應用程式：

```bash
yarn start
# 或
npm start
```

5. 在瀏覽器中開啟 [http://localhost:3000](http://localhost:3000) 查看應用程式

## 使用指南

### 瀏覽區塊與交易

- 首頁顯示最新的區塊和交易
- 點擊區塊號碼可查看區塊詳情
- 點擊交易雜湊可查看交易詳情
- 點擊地址可查看地址資訊

### 搜尋功能

支援三種搜尋方式：
- 區塊號碼：輸入數字 (例如 `17525775`)
- 交易雜湊：輸入以 0x 開頭的 66 字元雜湊值
- 地址：輸入以 0x 開頭的 42 字元以太坊地址

## 架構說明

- `App.js` - 應用程式主入口，設定路由和 Alchemy SDK
- `components/` - 應用程式的各個組件
  - `Home.js` - 首頁，顯示最新區塊和交易
  - `BlockDetails.js` - 區塊詳情頁
  - `TransactionDetails.js` - 交易詳情頁
  - `Address.js` - 地址詳情頁
  - `SearchBar.js` - 搜尋功能組件

## 延伸功能

未來可考慮添加的功能：
- 顯示 ERC-721 (NFT) 資訊
- 交易監控與通知
- 合約源碼驗證與互動
- Gas 價格追蹤器
- ENS (以太坊域名服務) 支援

## 注意事項

- 本應用程式使用 Alchemy API 連接以太坊網路，對 API 請求次數有限制
- 為避免超過 API 限制，部分功能（如歷史交易數據）有所限制
- 若需要完整的交易歷史數據，請考慮使用付費版 API 或存取自託管節點

## 授權協議

MIT License

---

*此專案是作為學習以太坊區塊鏈開發的一部分而創建的，靈感來自 Etherscan 等區塊瀏覽器。*
