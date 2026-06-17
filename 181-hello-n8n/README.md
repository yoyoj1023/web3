# 本機第一個 n8n

本專案使用 **Docker Compose** 在本機啟動 **n8n** 工作流自動化平台，並搭配 **PostgreSQL** 作為後端資料庫。依照下列步驟，即可在瀏覽器開啟 n8n Web UI，並建立第一個工作流。

## 需求

- Windows 10 / 11，已安裝 **Docker Desktop**（或 WSL2 內的 Docker）
- **Docker Compose** 可用（Docker Desktop 已內建）
- 建議分配至少 **2 GB 記憶體** 給 Docker
- 本機 **5678 埠** 未被其他程式佔用

確認 Docker 可用：

```powershell
docker --version
docker compose version
```

---

## 流程總覽

1. 進入專案目錄
2. （建議）複製 `.env.example` 為 `.env` 並設定加密金鑰
3. 執行 `docker compose up -d` 啟動服務
4. 瀏覽器開啟 `http://localhost:5678` 建立擁有者帳號
5. 建立第一個工作流並手動執行

---

## 1. 進入專案目錄

**PowerShell：**

```powershell
cd c:\VScode\web3\181-hello-n8n
```

若使用 WSL2 且專案放在 Windows 磁碟：

```bash
cd /mnt/c/VScode/web3/181-hello-n8n
```

---

## 2. 建立環境變數檔 `.env`

n8n 會用 `N8N_ENCRYPTION_KEY` 加密儲存在資料庫中的 API 金鑰與 OAuth 憑證。**首次啟動前**建議設定，且之後請勿更換，否則已儲存的憑證將無法解密。

```powershell
Copy-Item .env.example .env
```

編輯 `.env`，將 `N8N_ENCRYPTION_KEY` 改為至少 32 字元的隨機字串。PowerShell 產生範例：

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

若已啟動過 n8n 且未設定自訂金鑰，可暫時沿用預設值繼續本機學習；正式環境務必更換。

---

## 3. 啟動 n8n

首次啟動會下載映像檔（n8n 約 300 MB+），可能需要數分鐘：

```powershell
docker compose up -d
```

查看容器狀態：

```powershell
docker compose ps
```

預期會看到以下服務，且狀態皆為 **healthy**：

| 服務 | 說明 |
|------|------|
| `postgres` | 儲存 workflow、執行紀錄、憑證等資料 |
| `n8n` | Web UI 與工作流引擎，對外 **5678** 埠 |

查看即時日誌：

```powershell
docker compose logs -f n8n
```

---

## 4. 瀏覽器驗證

在瀏覽器開啟：

- **n8n Web UI**：<http://localhost:5678>

首次進入會引導建立 **Owner account**（擁有者帳號），請自行設定電子郵件與密碼。登入後應看到首頁 **「What do you want to build」**，可點選 **Build a workflow** 開始建立工作流。

---

## 5. 第一個工作流：Hello World

以下在 UI 中操作，無需額外安裝套件。

### 步驟

1. 點選 **Build a workflow**（或左側 **+**）建立新工作流
2. 點選畫布上的 **Add first step**，搜尋並加入 **Manual Trigger**（手動觸發）
3. 點選 **Manual Trigger** 右側的 **+**，搜尋並加入 **Set** 節點
4. 在 **Set** 節點中新增欄位：
   - **Name**：`message`
   - **Value**：`Hello from n8n!`
5. 點選右上角 **Save**，工作流名稱可設為 `hello_n8n`
6. 點選 **Test workflow** 或 **Execute workflow** 執行
7. 點選 **Set** 節點，在右側 **OUTPUT** 面板應看到 `message: Hello from n8n!`

恭喜，這就是你的第一個 n8n 工作流。

### 概念速覽

| 名詞 | 說明 |
|------|------|
| **Workflow** | 一條自動化流程，由多個節點串接而成 |
| **Node** | 單一步驟，例如觸發、發送 HTTP、寫入資料庫 |
| **Trigger** | 啟動工作流的起點（手動、定時、Webhook 等） |
| **Execution** | 工作流每次執行的紀錄，可在左側 **Executions** 查看 |

---

## 6. 常用管理指令

| 指令 | 說明 |
|------|------|
| `docker compose up -d` | 背景啟動所有服務 |
| `docker compose ps` | 查看容器狀態 |
| `docker compose logs -f n8n` | 持續輸出 n8n 日誌 |
| `docker compose stop` | 停止服務（保留資料） |
| `docker compose start` | 再次啟動已停止的服務 |
| `docker compose down` | 停止並移除容器（PostgreSQL 資料保留在 volume） |
| `docker compose down --volumes` | 停止並**清除所有資料**（完全重置） |
| `docker compose pull` | 更新映像檔版本 |
| `docker compose config` | 檢查 compose 設定是否有效 |

修改 `docker-compose.yml` 後，通常需重新建立容器：

```powershell
docker compose down
docker compose up -d
```

---

## 專案結構

```
181-hello-n8n/
├── README.md              # 本說明
├── docker-compose.yml     # Docker Compose 設定
├── .env.example           # 環境變數範例
└── .env                   # 實際環境變數（需自行建立，勿提交敏感資訊）
```

工作流、憑證等資料儲存在 Docker volume（`n8n_data`、`postgres_data`），不在專案目錄內。

---

## 設定說明

`docker-compose.yml` 主要設定如下：

| 設定 | 意義 |
|------|------|
| `DB_TYPE: postgresdb` | 使用 PostgreSQL，適合長期學習與使用 |
| `N8N_ENCRYPTION_KEY` | 加密 API 金鑰／OAuth 憑證 |
| `WEBHOOK_URL` | Webhook 對外 URL（本機預設 `http://localhost:5678/`） |
| `GENERIC_TIMEZONE: Asia/Taipei` | 排程與時間相關節點的預設時區 |
| `ports: "5678:5678"` | Web UI 對外埠 |

n8n 映像版本已鎖定為 **2.25.6**（見 `docker-compose.yml` 的 `image` 欄位）。若要升級，請直接修改該 tag 後執行 `docker compose pull && docker compose up -d`。

---

## 常見問題

**5678 埠已被佔用**

- 在 `.env` 將 `N8N_PORT` 改為其他埠（例如 `5679`），並同步修改 `WEBHOOK_URL`，再執行 `docker compose down && docker compose up -d`

**容器一直重啟或無法 healthy**

- 查看日誌：`docker compose logs n8n`
- 確認 postgres 已 healthy：`docker compose ps`
- 首次啟動請多等 1～2 分鐘

**忘記擁有者密碼**

- 本機學習環境可完全重置：
  ```powershell
  docker compose down --volumes
  docker compose up -d
  ```
- 注意：這會清除所有工作流與憑證

**Webhook 從外網無法觸發**

- 本機 `localhost` 僅供本機測試。若要從外部服務（如 GitHub、Telegram）觸發 Webhook，需將 n8n 暴露到公網或使用 ngrok 等隧道工具，並更新 `WEBHOOK_URL`

**更換 `N8N_ENCRYPTION_KEY` 後憑證失效**

- 加密金鑰在首次儲存憑證後不可更換。若已更換，只能 `docker compose down --volumes` 重置環境

**Docker Desktop 記憶體不足**

- 至 Docker Desktop → Settings → Resources，將 Memory 調高至至少 4 GB

---

## 延伸練習

完成 Hello World 後，可嘗試：

1. **Schedule Trigger** — 每分鐘或每天定時執行
2. **HTTP Request** — 呼叫公開 API（例如 `https://api.github.com/zen`）
3. **IF** — 依條件分支處理資料
4. 左側 **Templates** — 瀏覽官方範本，了解常見整合模式

---

## 延伸閱讀

- n8n 官方文件：<https://docs.n8n.io/>
- Docker Compose 部署說明：<https://docs.n8n.io/hosting/installation/server-setups/docker-compose/>
- n8n 社群範本：<https://n8n.io/workflows/>

後續可嘗試連接 Google Sheets、Slack、Discord，或搭配 Webhook 與外部 API 建立完整自動化流程。
