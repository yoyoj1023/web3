# 第六模組：State、Cache、Session (State & Cache)

## 模組目標
理解為什麼 HTTP 說自己是 stateless、Session 如何在無狀態協議上假裝有記憶、HTTP cache 與 CDN 如何避免重複工作，以及什麼 response 不該被 cache。

## 心智模型
HTTP 像窗口櫃檯：每次你走過來，櫃員都不記得上一筆。Session 是櫃員在後台放的檔案夾（用 Cookie 當領取牌）。Cache 是「這份文件暫時不用再印一次」。CDN 是把複印本放到離你更近的超商。

```text
Request #1   「我是誰？」   Server 不記得你
Request #2   「我是誰？」   Server 還是不記得你
Request #3   除非你每次都把領取牌帶回來
```

---

## 第一課：HTTP Stateless 是什麼？

規格把 HTTP 設計成：**處理這一筆 request 時，不需要記得上一筆。**

```text
GET /products/1     200  { ... }
GET /cart           200  { items: [] }     ← 預設不會因為你剛看過商品就把商品放進購物車
POST /cart/items    201
GET /cart           200  { items: [...] }  ← 能記得，是因為你或 server 另外存了狀態
```

好處：

- 任何一台 server 都能接這一筆（後面才能做 load balancer）
- 當機重啟不必回放「使用者剛才的對話」
- cache 與 CDN 變得可能

代價：

- 「已登入」不是連線的屬性，必須每筆 request 自己帶證明
- 購物車、wizard 多步驟表單，都要另想辦法

WebSocket 或 server 把連線與使用者綁死，是另一種模型。HTTP API 預設不要假設「同一個 TCP 連線 = 同一個人」。HTTP/1.1 keep-alive 只是復用連線省握手，**不是 session。**

---

## 第二課：Session

最經典的補記憶方式：

```text
Browser
   │
   │  Cookie: session=abc123
   ▼
Server
   │  拿 abc123 去查
   ▼
Session Store   { abc123: { userId: "A", role: "user" } }
```

第一次登入成功後：

```http
HTTP/1.1 200 OK
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax
```

之後每筆 request 帶著 id，server **當場**查出你是誰。HTTP 仍然無狀態；狀態住在 store 裡。

### 2.1 兩層不要混

| 層 | 是什麼 | 不是什麼 |
|----|--------|----------|
| Cookie | 瀏覽器怎麼保存、何時自動送出一段資料 | 不是「登入演算法」 |
| Session | server 怎麼記住這個使用者 | 不是 Cookie 的同義詞 |

你可以：

```text
Session ID 放在 Cookie 裡          最常見的網站
Session ID 放在 Authorization 裡   較少見
Token 自己包含 claims（JWT）        185 的主題，這門課不實作
```

這裡只要求看懂形狀。JWT 怎麼簽、refresh 怎麼轉、要不要放 Cookie，全部留給 185。

### 2.2 Store 可以在哪

```text
記憶體       重啟就忘，無法多機
Redis        常見
資料庫       也行，比較重
```

多台 server 背後若各用各的記憶體 store，使用者會「有時已登入、有時 401」。這是 stateless HTTP + 有狀態 session 的經典坑：session 資料必須成為所有節點都能讀的外部狀態。

### 2.3 沒有 Cookie 時

```http
GET /api/me
```

Store 查不到人 → **401**。不要回 403。你還不知道他是誰。

---

## 第三課：HTTP Cache

Cache 的問題是：這份 response 能不能少打一次 origin？

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=3600
ETag: "v3"
Last-Modified: Wed, 16 Sep 2026 07:00:00 GMT
```

### 3.1 Cache-Control

```text
max-age=3600          從現在起 3600 秒內可直接用複本
no-store              不要存（私人資料常用）
no-cache              可以存，但每次先驗證再拿來用（名字很坑）
private               只允許瀏覽器自己 cache，不要讓共用 CDN 存
public                允許中間節點 cache
must-revalidate       過期後必須問 origin
```

```http
Cache-Control: max-age=3600
```

代表：**接下來一小時，符合條件的 cache 可以不再打 origin，直接用這份。** 不是「server 保證資料一小時內不變」的商業承諾，是「允許被當成新鮮」的指令。

### 3.2 驗證：ETag 與 Last-Modified

過期或不確定時，client 可以問「我手上這份還行嗎」：

```http
GET /logo.png HTTP/1.1
If-None-Match: "v3"
```

若沒變：

```http
HTTP/1.1 304 Not Modified
ETag: "v3"
```

沒有 body，省頻寬。`Last-Modified` / `If-Modified-Since` 是時間版，精準度較粗。ETag 可以是內容雜湊或版本號。

### 3.3 誰在 cache？

```text
瀏覽器快取
代理快取
CDN
Next.js / CDN 的 Full Route Cache、Data Cache（框架層，語意類似但不是同一個開關）
```

你設的 `Cache-Control` 是給這整條鏈看的。框架還有自己的 cache API，不要以為只關瀏覽器就好。

---

## 第四課：CDN

```text
Browser
   ↓  就近
CDN 邊緣節點     有複本？有 → 直接回。沒有 → 回源
   ↓
Origin Server    你的 Next.js / API / 物件儲存
```

CDN 擅長：

- 靜態資產（JS、CSS、圖片、字體）
- 可公開、可變動緩慢的 GET

CDN 不擅長（除非你精心設計）：

- 每個人看到不一樣的 JSON
- POST / PATCH / DELETE
- 帶 Cookie 的個人化 HTML（一不小心把 A 的頁面給 B）

這會連到未來的 system design：把能公開的放到邊緣，把必須驗證的留在 origin。

---

## 第五課：什麼不該 cache

經驗法則：**個人化、授權後、會洩漏身分的 response，預設 `no-store`。**

```http
GET /api/me HTTP/1.1
Authorization: Bearer xxx
```

```http
HTTP/1.1 200 OK
Cache-Control: no-store
Pragma: no-cache
Content-Type: application/json

{"email":"ada@example.com","role":"admin"}
```

若這筆被共用快取（公司代理、設錯的 CDN）存下來，下一個使用者可能拿到 Ada 的資料。

相關規則：

| 情況 | 建議 |
|------|------|
| `Set-Cookie` 的 response | 小心，通常不該被共用 cache |
| 帶 `Authorization` | 多數 CDN 預設不 cache；不要改到讓它 cache |
| 錯誤頁 500 | 不要 cache 太久，否則故障會被「記住」 |
| 公開產品列表 GET | 可以 `max-age` 或 s-maxage |
| HTML 若含 CSRF token / nonce | 通常 private 或 no-store |

`Cache-Control: public, max-age=60` 對 `/api/users/123` 這種「看起來像公開、其實有時含 email」的 endpoint 非常危險。先問：**這份 body 給錯人看會怎樣？**

Expires 是舊式的絕對時間戳，現在優先用 Cache-Control。兩者都在時，Cache-Control 勝出。

---

## 動手做（約 8 分鐘）

1. 打開 DevTools → Network → Disable cache **先關掉**（這次要看 cache）。
2. 找一個靜態資源（JS 或圖片），重新整理兩次。第二次 status 是否 200（from disk cache）或 304？
3. 點進去看 Response Headers 的 `cache-control` 與 `etag`。
4. 用 curl 模擬條件請求（把 ETag 換成你看到的）：

```bash
curl -i https://example.com -H "If-None-Match: \"某個etag\""
```

若 origin 支援，你可能拿到 304。不支援就仍是 200。重點是觀察 header 對話，不是強迫 example.com 當教材 API。

5. 思考：你自己寫的 `GET /api/me` 若被設成 `max-age=3600`，最壞會發生什麼？寫下來。標準答案是：別人的瀏覽器或中間快取可能在一小時內展示錯誤的身分資料。

---

## 自我檢查

**Q1.** HTTP keep-alive 等於 session 嗎？  
**A1.** 不等於。Keep-alive 只是復用 TCP，server 仍不記得你是誰。

**Q2.** Session 讓 HTTP 變成有狀態協議了嗎？  
**A2.** 沒有。每筆 request 仍是獨立的。狀態在外部 store，靠 client 每次繳回 id。

**Q3.** `Cache-Control: no-cache` 代表不要存嗎？  
**A3.** 不代表。它可以存，但使用前必須再驗證。不要存是 `no-store`。

**Q4.** 304 的 body 在哪？  
**A4.** 沒有 body。Client 應使用自己快取的那一份。

**Q5.** 為什麼帶 Authorization 的 GET 預設不該進 CDN？  
**A5.** 內容通常是個人化的。共用快取一旦存錯，會把 A 的資料給 B。

---

下一模組：[第七模組：HTTP API Design](../module_7_api_design/)
