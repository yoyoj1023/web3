# 175-mydocker-postgresql

使用 `docker-compose.yml` 快速在本機建立：

- PostgreSQL 17
- pgAdmin（網頁版管理介面）

---

## 1. 專案內容

本專案透過 Docker Compose 啟動兩個服務：

- `db`: PostgreSQL 資料庫
- `pgadmin`: 網頁版 PostgreSQL 管理工具

目前 `docker-compose.yml` 主要設定如下：

- PostgreSQL
  - Image: `postgres:17`
  - Host Port: `127.0.0.1:5432`
  - DB: `mydb`
  - User: `myuser`
  - Password: `mypassword`
- pgAdmin
  - Image: `dpage/pgadmin4:latest`
  - Host Port: `127.0.0.1:5050`
  - Login Email: `admin@example.com`
  - Login Password: `admin1234`

> `127.0.0.1` 綁定代表只允許本機連線，不會直接暴露給整個內網。

---

## 2. 前置需求

- 已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 可在終端機執行 `docker` 與 `docker compose`

---

## 3. 啟動服務

在本資料夾執行：

```bash
docker compose up -d
```

查看狀態：

```bash
docker compose ps
```

查看日誌（可選）：

```bash
docker compose logs -f db
docker compose logs -f pgadmin
```

---

## 4. 使用 pgAdmin（網頁版）

1. 開啟瀏覽器進入：
   - `http://localhost:5050`
2. 使用以下帳號登入 pgAdmin：
   - Email: `admin@example.com`
   - Password: `admin1234`
3. 登入後新增伺服器：
   - 右鍵 `Servers` -> `Register` -> `Server...`

### 4.1 pgAdmin 內的連線設定

在 `General` 分頁：

- Name: `local-postgres`（可自訂）

在 `Connection` 分頁：

- Host name/address: `db`
- Port: `5432`
- Maintenance database: `mydb`
- Username: `myuser`
- Password: `mypassword`
- 勾選 `Save password`

> 為什麼 Host 用 `db`？
> 因為 pgAdmin 與 PostgreSQL 在同一個 Compose 網路內，服務彼此透過 service name 連線。

---

## 5. 從本機工具連 PostgreSQL（選用）

若你要用本機 SQL 客戶端（例如 HeidiSQL、DBeaver、TablePlus）連線：

- Host: `127.0.0.1`
- Port: `5432`
- Database: `mydb`
- User: `myuser`
- Password: `mypassword`

---

## 6. 停止與清除

停止服務：

```bash
docker compose down
```

停止並移除資料卷（會刪除資料）：

```bash
docker compose down -v
```

---

## 7. 常見問題

### Q1: `bind: ... 5432 ... access permissions` / Port 被占用

代表本機已有其他程式占用 `5432`（常見是本機 PostgreSQL 服務）。

做法：

- 改 `docker-compose.yml` 對外埠，例如改為 `127.0.0.1:15432:5432`
- 然後重新啟動：`docker compose up -d`
- 本機工具連線改用 `127.0.0.1:15432`

### Q2: pgAdmin 可以開，但新增連線失敗

請確認：

- pgAdmin 內的 Host 是 `db`（不是 `localhost`）
- 帳密與 `POSTGRES_USER` / `POSTGRES_PASSWORD` 一致

### Q3: pgAdmin 畫面變灰不能點

通常是前端 Modal 卡住，可嘗試：

- `Esc`
- `Ctrl + F5`
- 重新登入 pgAdmin
- 必要時重啟容器：`docker compose restart pgadmin`

---

## 8. 內網部署建議（公司內部使用）

- 開發/測試時：維持 `127.0.0.1` 綁定較安全
- 若要讓內網同仁連線，才改為 `0.0.0.0` 或指定內網 IP
- 不建議使用預設密碼，請改成強密碼
- 建議對 pgAdmin 與資料庫連線來源做網段限制（防火牆 / ACL）

