# MetaMask 連結器

此專案提供一個前端應用程式，用來連結 MetaMask（狐狸錢包），並可切換至 Optimism Sepolia 網路，同時查詢當前 ETH 與 ERC20 代幣（LPT）的餘額。

## 功能
- 透過 MetaMask 連線錢包
- 自動切換至 Optimism Sepolia 網路
- 查詢 ETH 餘額
- 查詢 LPT 代幣餘額

## 使用說明

### 環境準備
1. 安裝 [Node.js](https://nodejs.org/)：
- 請下載並安裝 Node.js 的 LTS 版本。
- 安裝完成後，打開終端機並輸入以下指令以確認安裝成功：
    ```bash
    node -v
    npm -v
    ```
    若能看到版本號，表示安裝成功。

### 啟動應用程式
1. 開啟終端機並進入 `frontend` 目錄：
   ```bash
   cd .\frontend
   ```

2. 啟動本地 HTTP 伺服器：
   ```bash
   npx http-server -c-1
   ```

3. 在瀏覽器中輸入網址：[http://127.0.0.1:8080/](http://127.0.0.1:8080/) 以訪問前端應用程式。

## 附加說明
- 請確保已安裝 MetaMask 插件。
- 若遇到連接問題，請檢查瀏覽器主控台訊息以獲得更多資訊。