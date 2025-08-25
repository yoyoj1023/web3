# 實作範例檔案說明

這個資料夾包含了課程中會用到的各種範例檔案，幫助您進行 IPFS 的實作練習。

## 檔案清單

### 📄 基礎測試檔案
- **message.txt** - 簡單的文字檔案，適合第一次上傳練習
- **message.json** - JSON 格式的結構化資料範例
- **cli-test.txt** - 專門用於命令列操作練習的檔案

### ⚙️ 應用配置檔案
- **dapp-config.json** - 完整的 DApp 配置檔案範例
- **sample-message.txt** - 模擬留言板訊息的範例

### 📁 資料夾結構範例
- **folder-example/** - 完整的專案資料夾結構
  - `config/` - 配置檔案目錄
  - `messages/` - 訊息範例目錄
  - `docs/` - 文件目錄

## 使用指南

### 🎯 模組二第二課 - IPFS Desktop 練習

1. **基礎上傳練習**
   ```
   使用檔案：message.txt, message.json
   目標：熟悉 IPFS Desktop 的檔案上傳介面
   ```

2. **CLI 操作練習**
   ```bash
   ipfs add cli-test.txt
   ipfs cat [返回的CID]
   ```

3. **資料夾上傳練習**
   ```
   上傳整個 folder-example 資料夾
   體驗 IPFS 的目錄結構處理
   ```

### 🎯 模組二第三課 - Pinata 練習

1. **Web 介面上傳**
   ```
   使用檔案：dapp-config.json, sample-message.txt
   練習添加元資料和標籤
   ```

2. **批量操作練習**
   ```
   選擇多個檔案進行批量上傳
   練習檔案管理和組織
   ```

## 檔案特色說明

### 🔧 內容設計特點

1. **多樣化格式**
   - 純文字 (.txt)
   - JSON 資料 (.json)
   - Markdown 文件 (.md)

2. **不同大小**
   - 小檔案：適合快速測試
   - 中型檔案：模擬真實應用場景

3. **中文內容**
   - 測試 UTF-8 編碼
   - 展示多語言支援

4. **結構化內容**
   - 展示 JSON 資料的 IPFS 儲存
   - 模擬真實的 DApp 資料結構

### 📊 預期的 CID 特性

每個檔案都有獨特的 CID，您可以透過以下方式驗證：

```bash
# 計算檔案的 IPFS Hash
ipfs add --only-hash message.txt

# 比較不同檔案的 CID
ipfs add --only-hash message.txt message.json
```

## 練習建議

### 🚀 初級練習

1. **單檔案上傳**
   - 依序上傳每個檔案
   - 記錄每個檔案的 CID
   - 透過不同 Gateway 存取

2. **內容驗證**
   - 確認上傳的內容與原檔案一致
   - 測試 CID 的不變性

### 🎯 中級練習

1. **批量管理**
   - 同時上傳多個檔案
   - 使用標籤和元資料組織檔案
   - 練習搜尋和篩選功能

2. **資料夾操作**
   - 上傳 folder-example 整個目錄
   - 透過 CID 存取特定子檔案
   - 理解目錄結構的 CID 關係

### 🏆 進階練習

1. **API 準備**
   - 為每個檔案添加詳細的元資料
   - 建立檔案分類系統
   - 準備 API Key 進行程式化操作

2. **整合測試**
   - 比較 IPFS Desktop 和 Pinata 的上傳結果
   - 測試跨平台的檔案存取
   - 驗證去中心化特性

## 故障排除

### ❗ 常見問題

**Q: 上傳後無法通過 Gateway 存取？**
A: 等待幾分鐘讓檔案在網路中傳播，或嘗試不同的 Gateway。

**Q: 中文內容顯示亂碼？**
A: 確認檔案使用 UTF-8 編碼，大多數現代編輯器預設使用此編碼。

**Q: 資料夾上傳後結構不對？**
A: 確認您上傳的是整個資料夾，而不是資料夾內的檔案。

### 🔧 驗證方法

```bash
# 驗證檔案完整性
ipfs cat [CID] > downloaded_file.txt
diff original_file.txt downloaded_file.txt

# 檢查檔案在網路中的分佈
ipfs dht findprovs [CID]
```

## 擴展練習

### 💡 自訂練習建議

1. **建立您自己的檔案**
   - 建立個人簡介 JSON
   - 寫一篇關於 IPFS 學習心得的文章
   - 設計您的 DApp 配置檔案

2. **實驗 CID 變化**
   - 修改檔案中的一個字元
   - 觀察 CID 的變化
   - 理解內容定址的原理

3. **效能測試**
   - 上傳不同大小的檔案
   - 比較不同 Gateway 的存取速度
   - 記錄您的觀察結果

---

**提示**：這些範例檔案是您 IPFS 學習旅程的起點。透過實際操作這些檔案，您將建立對 IPFS 工作原理的直觀理解。
