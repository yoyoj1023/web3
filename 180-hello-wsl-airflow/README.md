# WSL2 第一個 Apache Airflow

本專案使用 **Docker Compose** 在 **WSL2** 上啟動 **Apache Airflow 2.9.1**，採 **LocalExecutor**（適合本機學習與開發，不需 Redis / Worker）。依照下列步驟，即可在瀏覽器開啟 Airflow Web UI，並執行內建範例 DAG。

## 需求

- Windows 10 / 11，已安裝並啟用 **WSL2**
- WSL2 發行版內已安裝 **Docker** 與 **Docker Compose**（Docker Desktop 整合 WSL2 亦可）
- 建議 WSL2 分配至少 **4 GB 記憶體**、**2 個 CPU 核心**
- 本機 **8080 埠** 未被其他程式佔用

確認 Docker 可用：

```bash
docker --version
docker compose version
```

---

## 流程總覽

1. 在 WSL2 進入專案目錄
2. 建立 `.env`（設定 `AIRFLOW_UID`）
3. 執行 `docker compose up -d` 啟動服務
4. 瀏覽器開啟 `http://localhost:8080` 登入 Web UI
5. 在 DAG 列表中啟用並觸發範例工作流

---

## 1. 進入專案目錄

請在 **WSL2 終端機**（Ubuntu 等）執行，不要只在 Windows PowerShell 操作 Docker（除非已正確整合）。

專案若放在 Windows 磁碟，路徑通常為：

```bash
cd /mnt/c/VScode/web3/180-hello-wsl-airflow
```

若已複製到 WSL 原生目錄（效能較佳），例如：

```bash
cd ~/projects/180-hello-wsl-airflow
```

---

## 2. 建立環境變數檔 `.env`

Airflow 容器需要以你的 Linux 使用者 UID 寫入 `logs/` 等目錄，避免權限錯誤。

```bash
echo "AIRFLOW_UID=$(id -u)" > .env
```

也可參考 `.env.example` 手動建立：

```bash
cp .env.example .env
# 再將 AIRFLOW_UID 改成 id -u 的輸出值
```

選用：自訂 Web UI 登入帳密（預設為 `airflow` / `airflow`），可在 `.env` 加入：

```bash
_AIRFLOW_WWW_USER_USERNAME=myuser
_AIRFLOW_WWW_USER_PASSWORD=mypassword
```

---

## 3. 啟動 Airflow

首次啟動會下載映像檔，可能需要數分鐘：

```bash
docker compose up -d
```

查看容器狀態：

```bash
docker compose ps
```

預期會看到以下服務：

| 服務 | 說明 |
|------|------|
| `postgres` | Airflow 元資料資料庫 |
| `airflow-init` | 一次性初始化（完成後會結束） |
| `airflow-webserver` | Web UI，對外 **8080** 埠 |
| `airflow-scheduler` | 排程器 |

`airflow-init` 必須先成功完成，`webserver` 與 `scheduler` 才會啟動。若剛啟動時 `webserver` 仍在重啟，請等待 1～3 分鐘後再查一次。

查看即時日誌：

```bash
docker compose logs -f
```

只看 webserver：

```bash
docker compose logs -f airflow-webserver
```

---

## 4. 瀏覽器驗證

在瀏覽器開啟：

- **Airflow Web UI**：<http://localhost:8080>

預設登入資訊：

| 項目 | 值 |
|------|-----|
| 使用者名稱 | `airflow` |
| 密碼 | `airflow` |

登入後應能看到多個 **範例 DAG**（例如 `example_bash_operator`）。新 DAG 預設為**暫停**狀態，需手動開啟開關後才會依排程執行；也可點選 DAG → **Trigger DAG** 立即觸發一次。

---

## 5. 常用管理指令

| 指令 | 說明 |
|------|------|
| `docker compose up -d` | 背景啟動所有服務 |
| `docker compose ps` | 查看容器狀態 |
| `docker compose logs -f` | 持續輸出所有服務日誌 |
| `docker compose stop` | 停止服務（保留資料） |
| `docker compose start` | 再次啟動已停止的服務 |
| `docker compose down` | 停止並移除容器（PostgreSQL 資料保留在 volume） |
| `docker compose down --volumes` | 停止並**清除資料庫**（完全重置） |
| `docker compose pull` | 更新映像檔版本 |
| `docker compose config` | 檢查 compose 設定是否有效 |

修改 `docker-compose.yaml` 後，通常需重新建立容器：

```bash
docker compose down
docker compose up -d
```

---

## 專案結構

```
180-hello-wsl-airflow/
├── README.md              # 本說明
├── docker-compose.yaml    # Docker Compose 設定
├── .env.example           # 環境變數範例
├── .env                   # 實際環境變數（需自行建立，勿提交敏感資訊）
├── dags/                  # 放置自訂 DAG（*.py）
├── logs/                  # Airflow 執行日誌（容器寫入）
├── plugins/               # 自訂 Airflow 外掛
└── config/                # 選用的 airflow.cfg 覆寫
```

---

## 新增自己的 DAG

在 `dags/` 目錄新增 Python 檔，例如 `hello_dag.py`：

```python
from datetime import datetime

from airflow import DAG
from airflow.operators.bash import BashOperator

with DAG(
    dag_id="hello_wsl_airflow",
    start_date=datetime(2024, 1, 1),
    schedule=None,
    catchup=False,
    tags=["example"],
) as dag:
    BashOperator(
        task_id="say_hello",
        bash_command='echo "Hello from WSL2 Airflow!"',
    )
```

存檔後，排程器會在數十秒內自動掃描到新 DAG。若未出現，可查看 scheduler 日誌：

```bash
docker compose logs -f airflow-scheduler
```

---

## 設定說明

`docker-compose.yaml` 主要設定如下：

| 設定 | 意義 |
|------|------|
| `AIRFLOW__CORE__EXECUTOR: LocalExecutor` | 本機單機執行，不需 Celery Worker |
| `AIRFLOW__CORE__LOAD_EXAMPLES: 'true'` | 載入官方範例 DAG |
| `AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION: 'true'` | 新 DAG 預設暫停 |
| `ports: "8080:8080"` | Web UI 對外埠 |
| `volumes: ./dags:...` | 本機 DAG 目錄掛載進容器 |

若要關閉範例 DAG、只跑自己的流程，可將 `LOAD_EXAMPLES` 改為 `'false'` 後重新 `docker compose up -d`。

---

## 常見問題

**`airflow-init` 失敗：`gosu: command not found` 或 `Too old Airflow version`**  
- 舊版 init 腳本使用了 `gosu`，但 `apache/airflow:2.9.1` 映像檔已不含此指令。請更新本專案的 `docker-compose.yaml` 後重新啟動：
  ```bash
  docker compose down
  docker compose up -d
  ```

**`AIRFLOW_UID is not set` 警告**  
- 尚未建立 `.env`。請執行：`echo "AIRFLOW_UID=$(id -u)" > .env`，再 `docker compose down` 後重新 `up -d`。

**`permission denied` 寫入 `logs/`**  
- `AIRFLOW_UID` 與 WSL 使用者不符，或曾用錯誤 UID 啟動過。修正 `.env` 後執行：
  ```bash
  sudo chown -R $(id -u):0 logs/
  docker compose down && docker compose up -d
  ```

**8080 埠已被佔用**  
- 修改 `docker-compose.yaml` 中 `airflow-webserver` 的 `ports`，例如改為 `"8081:8080"`，再以 <http://localhost:8081> 存取。

**Web UI 一直轉圈 / 無法登入**  
- 確認 `airflow-init` 已成功：`docker compose logs airflow-init`
- 確認 `airflow-webserver` 為 healthy：`docker compose ps`
- 首次啟動請多等幾分鐘

**`/mnt/c/` 路徑很慢或權限異常**  
- 建議將專案複製到 WSL 原生檔案系統，例如 `~/projects/`，再從該路徑執行 `docker compose`。

**記憶體不足、容器反覆重啟**  
- 在 Windows 使用者目錄建立或編輯 `.wslconfig`（修改後於 PowerShell 執行 `wsl --shutdown` 再重開 WSL）：
  ```ini
  [wsl2]
  memory=4GB
  processors=2
  ```

**如何完全重置環境**  
```bash
docker compose down --volumes
rm -rf logs/*
echo "AIRFLOW_UID=$(id -u)" > .env
docker compose up -d
```

**想在容器內執行 Airflow CLI**  
```bash
docker compose run --rm airflow-webserver airflow dags list
```

---

## 延伸閱讀

- Apache Airflow 官方文件：<https://airflow.apache.org/docs/>
- Docker Compose 部署說明：<https://airflow.apache.org/docs/apache-airflow/stable/howto/docker-compose/index.html>
- WSL2 文件：<https://learn.microsoft.com/zh-tw/windows/wsl/>

後續可嘗試在 `dags/` 撰寫 ETL 流程、連接外部資料庫，或將 `EXECUTOR` 改為 `CeleryExecutor` 以模擬分散式執行環境。
