# 🔧 環境變數設置說明

## 必需的環境變數

為了讓 ENS 搜尋器正常工作，您需要設置 Alchemy API Key。

### 1. 獲取 Alchemy API Key

1. 前往 [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. 登錄或註冊帳戶
3. 創建新的應用程式
4. 選擇網路（支援以太坊主網和 Sepolia）
5. 複製您的 API Key

### 2. 設置環境變數

在 `packages/nextjs/` 目錄下創建 `.env.local` 檔案：

```bash
# Alchemy API Key (必需)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Wallet Connect Project ID (可選)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
```

### 3. 重啟開發伺服器

設置完環境變數後，重新啟動開發伺服器：

```bash
cd packages/nextjs
npm run dev
```

## 🧪 測試設置

在 ENS 搜尋頁面上，您可以使用「測試 Alchemy 連接」按鈕來驗證您的 API Key 是否正確設置。

## 📝 注意事項

- 請確保 API Key 有效且有足夠的配額
- ENS 主要註冊在以太坊主網上，建議使用主網進行搜尋
- 如果遇到問題，請檢查瀏覽器的開發者工具控制台獲取更多除錯資訊 