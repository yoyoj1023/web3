# PuzzleWallet 攻擊腳本

這個腳本用於攻擊部署在 Optimism Sepolia 上的 PuzzleWallet 合約，地址：`0x762801a5b8496dCDe6aBff8e2420Cc42A0308e12`

## 攻擊原理

這個攻擊利用了兩個主要漏洞：

1. **儲存位置衝突 (Storage Collision)**：
   - `PuzzleProxy.pendingAdmin` (Slot 0) ↔ `PuzzleWallet.owner` (Slot 0)
   - `PuzzleProxy.admin` (Slot 1) ↔ `PuzzleWallet.maxBalance` (Slot 1)

2. **multicall 函數的邏輯缺陷**：
   - `delegatecall` 保持 `msg.value` 不變
   - `depositCalled` 標誌位在遞迴調用時不會被共享

## 攻擊步驟

### 步驟一：成為 owner
- 呼叫 `PuzzleProxy.proposeNewAdmin(攻擊者地址)`
- 這會設置 `pendingAdmin = 攻擊者地址`
- 由於儲存衝突，`PuzzleWallet.owner` 也變成攻擊者地址

### 步驟二：加入白名單
- 現在作為 owner，呼叫 `PuzzleWallet.addToWhitelist(攻擊者地址)`
- 滿足後續函數的 `onlyWhitelisted` 要求

### 步驟三：利用 multicall 漏洞
- 構造兩個調用：
  1. `deposit()` 直接調用
  2. `multicall([deposit()])` 嵌套調用
- 發送等於合約當前餘額的 ETH
- 結果：內部餘額翻倍，但實際餘額只增加一倍

### 步驟四：清空合約餘額
- 使用 `execute()` 函數提取所有 ETH
- 合約餘額變為 0

### 步驟五：成為 admin
- 呼叫 `setMaxBalance(攻擊者地址轉uint256)`
- 由於儲存衝突，這會設置 `PuzzleProxy.admin = 攻擊者地址`

## 使用方法

### 前置要求

1. 安裝依賴：
   ```bash
   npm install
   ```

2. 創建 `.env` 文件並設置環境變數：
   ```bash
   # 創建 .env 文件
   touch .env
   ```
   
   在 `.env` 文件中添加以下內容：
   ```env
   # 私鑰 (不含 0x 前綴)
   PRIVATE_KEY=your_private_key_here
   
   # Sepolia 網路 RPC URL  
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
   
   # Sepolia 私鑰
   SEPOLIA_PRIVATE_KEY=your_sepolia_private_key_here
   
   # Optimism Sepolia RPC URL with API Key
   OP_SEPOLIA_RPC_URL_API_KEY=https://opt-sepolia.g.alchemy.com/v2/your_api_key
   ```

3. 確保你的 `.env` 文件不會被提交到 git：
   ```bash
   echo ".env" >> .gitignore
   ```

### 執行攻擊

```bash
# 安裝依賴
npm install

# 執行攻擊腳本
npx hardhat run scripts/exploit-puzzle-wallet.ts --network optimismSepolia
```

## 重要注意事項

⚠️ **警告**：
- 這個腳本僅用於教育目的和 CTF 挑戰
- 不要在主網或其他人的合約上使用
- 確保你有足夠的 ETH 來支付 gas 費用
- 合約必須有非零餘額才能進行攻擊

## 腳本輸出

腳本會顯示詳細的執行過程，包括：
- 初始狀態檢查
- 每個步驟的交易哈希
- 中間狀態驗證
- 最終攻擊結果

成功攻擊後，你將看到：
```
🎊 攻擊成功！你現在是合約的 admin！
```

## 故障排除

如果攻擊失敗，檢查：
1. 合約是否有餘額（必須 > 0）
2. 網路連接是否正常
3. 私鑰和 RPC URL 是否正確
4. Gas 費用是否足夠
