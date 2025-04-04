# MetaMask 連接器

這是一個前端應用程式，提供用戶與 MetaMask 錢包連接的功能。用戶可以透過此應用程式切換到 Optimism Sepolia 測試網路，並查看目前的測試以太幣餘額。

## 功能

1. **連接 MetaMask**：檢查是否安裝 MetaMask，並請求用戶授權連接。
2. **切換網路**：切換到 Optimism Sepolia 測試網路，若該網路不存在，則自動添加。
3. **查看餘額**：顯示當前帳戶在 Optimism Sepolia 測試網路上的以太幣餘額。

## 執行環境

本專案使用 [http-server](https://www.npmjs.com/package/http-server) 啟動本地伺服器。

### 安裝與啟動

1. 確保已安裝 [Node.js](https://nodejs.org/) 和 npm。
2. 在專案目錄下安裝 `http-server`：
   ```bash
   npm install -g http-server
   ```

3. 啟動本地伺服器：
    ```bash
    npx http-server -c-1
    ```

4. 在瀏覽器中輸入以下網址進入前端網頁首頁：
    ```
    http://localhost:8080/
    ```

### 使用說明

1. 開啟網頁後，點擊 連接 MetaMask 按鈕，授權應用程式連接您的 MetaMask 錢包。
2. 點擊 切換到 Optimism Sepolia 網路 按鈕，切換到 Optimism Sepolia 測試網路。
3. 點擊 查看餘額 按鈕，檢視您在 Optimism Sepolia 測試網路上的以太幣餘額。

### 注意事項

- 請確保已安裝 MetaMask 並在瀏覽器中啟用。
- 本應用程式僅支援 Optimism Sepolia 測試網路。
- 若切換網路或查看餘額時出現錯誤，請檢查您的 MetaMask 是否正確配置。

### 技術細節

- 使用 ethers.js 與 MetaMask 進行互動。
- 提供網路切換與餘額查詢功能，確保用戶體驗流暢。

### 開發者

- 歡迎對此專案進行改進或提交問題回報！如有任何疑問，請聯繫開發者。