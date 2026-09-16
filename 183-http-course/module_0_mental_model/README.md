# 零號模組：HTTP 到底在解決什麼問題 (Mental Model)

## 模組目標
建立全局 mental model：知道 HTTP 在網路世界的位置、一次網頁載入背後發生什麼，以及「HTTP ≠ API」。

## 心智模型
HTTP 是「兩台電腦約定好的說話方式」。一邊問（Request），一邊答（Response）。瀏覽器、手機 App、curl、Next.js server 都只是不同的提問者；REST、GraphQL、檔案上傳都只是不同的問法。先知道自己站在哪一層，後面每一章才放得進去。

```text
Browser / Client  ──HTTP Request──►  Server
Browser / Client  ◄─HTTP Response──  Server
```

---

## 第一課：網路世界最基本的模型

### 1.1 Client 與 Server

**Client** 是發起請求的那一方。常見的 client：

- 瀏覽器（Chrome、Safari）
- 手機 App
- `curl`、Postman、Bruno
- 你的 Next.js server（它對後端 API 來說也是 client）

**Server** 是等待請求、回覆結果的那一方。常見的 server：

- Nginx
- Node.js / Express / Fastify
- Next.js Route Handler
- 任何聽某個 Port 的程式

角色是相對的。Next.js 對瀏覽器是 server，對 PostgreSQL 或另一支 Backend 卻是 client。

```text
Browser  ──►  Next.js  ──►  Backend API  ──►  PostgreSQL
 client         既是           client
               server
```

### 1.2 Request / Response

HTTP 的最小對話單位永遠是一問一答：

```text
Client:  「請給我 /users/123 這份資料」
Server:  「好，這是 JSON，狀態 200」
```

沒有「server 突然主動跟你聊天」這回事（那是 WebSocket 或其他協議）。HTTP/2 Server Push 存在過，但不是你設計 API 時該依賴的模型。先把「一問一答」記死。

### 1.3 IP 與 Port

電腦在網路上的地址是 **IP**。同一台機器上可以跑很多服務，靠 **Port** 區分要敲哪扇門：

```text
127.0.0.1:3000   →  這台機器、3000 這扇門（常見 Next.js）
127.0.0.1:5432   →  同一台機器、5432 這扇門（常見 PostgreSQL）
```

沒有 Port，郵差只知道大樓，不知道要按哪戶電鈴。第三模組會把 Port、localhost、0.0.0.0 拆清楚。

### 1.4 TCP / UDP，以及 HTTP 坐在哪裡

你不需要現在成為網路工程師。只需要這一張圖：

```text
┌─────────────────────────────────┐
│  你的應用：REST / GraphQL / HTML │
├─────────────────────────────────┤
│  HTTP                           │  ← 有語意的「文件」協議
├─────────────────────────────────┤
│  TLS（若是 HTTPS）               │  ← 加密信封
├─────────────────────────────────┤
│  TCP                            │  ← 可靠運送（順序、重傳）
├─────────────────────────────────┤
│  IP                             │  ← 送到哪一台機器
└─────────────────────────────────┘
```

- **TCP**：保證資料大概會完整、按順序到達。連線導向。
- **UDP**：不保證。快、輕，遊戲與視訊常用。HTTP/3 的底層 QUIC 是跑在 UDP 上，但對外仍表現得可靠。
- **HTTP**：不負責「送到」；它負責「這份文件是 GET 還是 POST、狀態是 404 還是 200」。

**HTTP 坐在 TCP（或 QUIC）上面。** 你在 DevTools 看到的那些 Header，是 HTTP 層的語言，不是 IP 層的語言。

---

## 第二課：當你輸入一個 URL，背後發生什麼？

假設你在網址列輸入：

```text
https://example.com/users/123
```

瀏覽器不會「直接去 example.com」。它走這條路：

```text
URL
 ↓
DNS          把 example.com 換成 IP，例如 93.184.216.34
 ↓
TCP          連到那個 IP 的 443 port（HTTPS 預設）
 ↓
TLS          握手、驗證憑證、建立加密通道
 ↓
HTTP         送出 GET /users/123
 ↓
Server       路由、查資料、組 response
 ↓
HTTP Response
 ↓
Browser      依 Content-Type 決定要渲染 HTML、解析 JSON、或下載檔案
```

用一筆真實的 HTTP 來看最後那兩步長什麼樣子：

```http
GET /users/123 HTTP/1.1
Host: example.com
Accept: text/html,application/xhtml+xml
User-Agent: Mozilla/5.0 ...
```

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 1234
Cache-Control: max-age=600

<!DOCTYPE html>
...
```

同一條路徑，如果是 JavaScript 發的 API：

```http
GET /users/123 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer xxx
```

協議相同，**語意**不同。這就是下一課要講的：HTTP 是底層軌道，API 是跑在軌道上的列車種類。

### 2.1 你可以現在就觀察

打開 Chrome → F12 → Network → 勾選 Disable cache → 重新整理任意網站。點第一筆文件，看 Headers。你現在不需要看懂每一欄，只要確認這件事：

> 瀏覽器做的每一件事，最後幾乎都是一筆 HTTP request 加上一筆 HTTP response。

第四模組會教你怎麼讀這張面板。

---

## 第三課：HTTP 不等於 API

很多人把「學 HTTP」等同「學 REST API」。這會讓後面全部歪掉。

```text
HTTP
 ├── Browser 網頁（HTML / CSS / JS / 圖片）
 ├── REST API
 ├── GraphQL
 ├── File upload
 ├── Server-Sent Events
 └── 其他 application protocols
```

它們共用同一套：

- URL
- Method
- Header
- Status code
- Body

差別在 **約定**：

| 用途 | 典型 Method | 典型 Content-Type | Body 長相 |
|------|-------------|-------------------|-----------|
| 網頁 | GET | `text/html` | HTML |
| REST | GET / POST / PATCH / DELETE | `application/json` | JSON 資源 |
| GraphQL | 幾乎都是 POST `/graphql` | `application/json` | `{ query, variables }` |
| 上傳 | POST | `multipart/form-data` | 檔案 + 欄位 |
| 表單 | POST | `application/x-www-form-urlencoded` | `name=John&age=20` |

所以：

- 你可以用 HTTP 做 API，也可以用 HTTP 只送網頁。
- REST 是一種 API 風格，不是 HTTP 本身。
- GraphQL 仍然是 HTTP。它只是把「很多種資源查詢」塞進同一個 endpoint。

**這一章的目標不是背東西，而是讓你知道 HTTP 在哪裡。**

### 3.1 HTTP/1.1 vs HTTP/2 vs HTTP/3（先有地圖）

設計 API 時你幾乎總是寫 HTTP/1.1 那套語意（GET、Header、Status）。版本差異主要在**怎麼運送**：

```text
HTTP/1.1
  一條 TCP 連線一次大致處理一筆 request（實務上有 keep-alive 與 pipeline 限制）
  Header 是純文字

HTTP/2
  同一條連線上多路複用（multiplexing）：多筆 request 並行
  Header 壓縮（HPACK）
  對你寫的 `fetch()` 幾乎無感，瀏覽器自動談版本

HTTP/3
  底層改走 QUIC（UDP）
  減少握手往返、較不怕丟包
  對你寫的 API 路徑與 JSON 仍然無感
```

**你要記住的：** 版本在換「卡車怎麼開」，沒有換「貨單怎麼填」。貨單仍然是 Method、Path、Header、Body。這門課教的是貨單。

---

## 動手做（約 8 分鐘）

1. 打開 https://example.com ，F12 → Network，點最上面那筆文件。
2. 抄下：Request URL、Method、Status Code、Request Headers 裡的 `Host` 與 `Accept`、Response Headers 裡的 `Content-Type`。
3. 在終端機執行（Windows 的 PowerShell 也通）：

```bash
curl -i https://example.com
```

4. 對照：curl 印出來的 Request 你看不到（除非加 `-v`），但 Response 的 status 與 headers 應該與 DevTools 同一家族。加一次 verbose：

```bash
curl -v https://example.com
```

問自己：瀏覽器多帶了哪些 curl 沒有的 Header？`User-Agent`、`Accept`、`Cookie` 通常就是答案。

---

## 自我檢查

**Q1.** Next.js 既是 server 又是 client，這句話是什麼意思？  
**A1.** 對瀏覽器來說它是 server（回 HTML / RSC payload）；對 Backend API 或資料庫來說它是 client（它主動發 request）。

**Q2.** HTTP 與 TCP 各負責什麼？  
**A2.** TCP 負責可靠運送；HTTP 負責這份文件的語意（Method、Path、Status、Header）。

**Q3.** 為什麼說「HTTP 不等於 API」？  
**A3.** API 只是 HTTP 的一種用法。瀏覽器載入 HTML、上傳檔案、GraphQL 都走 HTTP。

**Q4.** 輸入 `https://example.com/users/123` 時，DNS 發生在 HTTP 之前還是之後？  
**A4.** 之前。必須先把域名換成 IP，才能建立 TCP / TLS，然後才送 HTTP。

**Q5.** HTTP/2 讓你設計 REST 路徑的方式改變了嗎？  
**A5.** 幾乎沒有。多路複用改變運送效率，不改變資源 URL 與 status code 的語意。

---

下一模組開始拆 request 本身：[第一模組：拆解 HTTP Request](../module_1_request/)
