# Windows 第一個 nginx

本專案內含 **nginx 1.30.0**（Windows 版），已附預設設定與範例靜態頁面。依照下列步驟，即可在本機啟動 Web 伺服器並在瀏覽器看到預設歡迎頁。

## 需求

- Windows 10 / 11
- 終端機：**PowerShell** 或 **命令提示字元（cmd）**
- 本機 **80 埠** 未被其他程式佔用（常見佔用者：IIS、Skype、其他 Web 伺服器）

若 80 埠無法使用，可改聽其他埠（見文末「常見問題」）。

---

## 流程總覽

1. 進入 nginx 安裝目錄（`nginx-1.30.0`）
2. 檢查設定檔語法（`nginx -t`）
3. 啟動 nginx
4. 瀏覽器開啟 `http://localhost/` 驗證
5. 需要時重新載入設定或停止服務

---

## 1. 進入 nginx 目錄

**路徑中的相對設定**（例如 `root html`、`logs/`）是相對於 **`nginx.exe` 所在目錄** 解析的，請務必先 `cd` 到該目錄再執行指令。

**PowerShell：**

```powershell
cd c:\VScode\web3\179-hello-nginx\nginx-1.30.0
```

**命令提示字元（cmd）：**

```cmd
cd /d c:\VScode\web3\179-hello-nginx\nginx-1.30.0
```

---

## 2. 檢查設定檔

啟動前先確認 `conf\nginx.conf` 沒有語法錯誤：

```powershell
.\nginx.exe -t
```

成功時會類似顯示：

```text
nginx: the configuration file .../conf/nginx.conf syntax is ok
nginx: configuration file .../conf/nginx.conf test is successful
```

若有錯誤，請依終端機訊息修正 `conf\nginx.conf` 後再執行一次。

---

## 3. 啟動 nginx

仍在 `nginx-1.30.0` 目錄下執行：

```powershell
.\nginx.exe
```

- 預設會讀取 **`conf\nginx.conf`**
- 預設監聽 **80 埠**，主機名稱為 **`localhost`**
- 成功啟動後，終端機通常**不會**持續輸出日誌（nginx 在背景執行）

若要明確指定設定檔路徑：

```powershell
.\nginx.exe -c conf\nginx.conf
```

---

## 4. 瀏覽器驗證

在瀏覽器開啟：

- **首頁**：<http://localhost/>

若看到 **「Welcome to nginx!」** 頁面，代表靜態網站已正常由 `html\index.html` 提供。

本專案根目錄另有 `hellofile.txt`（純文字範例），若要透過 nginx 提供，需自行在 `conf\nginx.conf` 新增對應的 `location` 或把檔案放到 `html` 目錄。

---

## 5. 常用管理指令

以下指令皆需在 **`nginx-1.30.0` 目錄**、且 nginx **已在執行** 時使用：

| 指令 | 說明 |
|------|------|
| `.\nginx.exe -s reload` | 重新載入設定（不中斷服務） |
| `.\nginx.exe -s stop` | 優雅停止 |
| `.\nginx.exe -s quit` | 優雅停止（處理完現有連線後結束） |

修改 `conf\nginx.conf` 或 `html\` 內容後，建議先 `.\nginx.exe -t`，再 `.\nginx.exe -s reload`。

---

## 預設設定在做什麼？

主要設定在 `nginx-1.30.0\conf\nginx.conf`：

| 設定 | 意義 |
|------|------|
| `listen 80` | 在本機 80 埠提供 HTTP |
| `server_name localhost` | 以 `localhost` 為此虛擬主機名稱 |
| `location /` + `root html` | 網址 `/` 對應到目錄 `html\` |
| `index index.html index.htm` | 目錄請求時預設找這兩個檔名 |

自訂首頁：編輯 `nginx-1.30.0\html\index.html`，存檔後重新整理瀏覽器；若已改設定檔，執行 `.\nginx.exe -s reload`。

---

## 日誌與除錯

| 檔案 | 用途 |
|------|------|
| `logs\access.log` | 存取紀錄 |
| `logs\error.log` | 錯誤與啟動失敗訊息 |
| `logs\nginx.pid` | 目前 master 行程 PID |

連不上或啟動失敗時，優先查看 **`logs\error.log`**。

---

## 常見問題

**啟動後瀏覽器無法連線 / `bind() failed`**  
- 80 埠可能被佔用。在 PowerShell 查詢：`netstat -ano | findstr :80`  
- 可暫時關閉佔用程式，或修改 `nginx.conf` 將 `listen 80` 改為例如 `listen 8080`，再以 <http://localhost:8080/> 測試。

**必須用系統管理員嗎？**  
- 監聽 **1024 以下** 埠（含 80）時，部分環境需要**以系統管理員身分**開啟終端機再執行 `nginx.exe`。改用 **8080** 等較高端口通常不需要。

**從錯誤目錄執行 `nginx.exe`**  
- 會找不到 `html` 或 `logs`。請一律先 `cd` 到 `nginx-1.30.0`，或改用前綴參數：  
  `.\nginx.exe -p C:\VScode\web3\179-hello-nginx\nginx-1.30.0`

**重複啟動**  
- 若已有 nginx 在跑，再次執行 `.\nginx.exe` 可能失敗。先 `.\nginx.exe -s stop`，或工作管理員結束 `nginx.exe` 行程後再啟動。

**修改設定後沒生效**  
- 執行 `.\nginx.exe -t` 確認無誤後，執行 `.\nginx.exe -s reload`。

---

## 專案結構

```
179-hello-nginx/
├── README.md              # 本說明
├── hellofile.txt          # 範例文字檔（預設未由 nginx 直接提供）
└── nginx-1.30.0/
    ├── nginx.exe          # Windows 執行檔
    ├── conf/
    │   ├── nginx.conf     # 主要設定
    │   └── mime.types     # MIME 類型對照
    ├── html/
    │   ├── index.html     # 預設首頁
    │   └── 50x.html       # 5xx 錯誤頁
    └── logs/              # 執行後產生的日誌與 pid
```

---

## 延伸閱讀

- 官方文件：<https://nginx.org/en/docs/>
- Windows 下載頁：<https://nginx.org/en/download.html>

後續可在此設定檔中加入 **反向代理**（例如轉發到本機 FastAPI 的 `127.0.0.1:8000`），作為 API 前的靜態檔與負載入口。
