這是一份為您精心設計的「為了成為能獨立設計 Backend 的工程師而學 HTTP」課程。

這套課程的設計哲學是**建立 mental model，而不是背 RFC**。我們假設你已經會寫 Next.js（或至少會發 `fetch`），不會從 OSI 七層模型的第一層開始啃，而是直接從你每天都在用的東西切入：瀏覽器發了一筆 request，server 回了一筆 response。你要學會的是：**看到任何一筆 HTTP，都能立刻拆開它。**

---

### **為了成為 Backend 工程師而學 HTTP (HTTP for Backend Engineers)**

**課程目標：** 學習結束後，您將能獨立拆解任何 HTTP request / response，理解 method、header、status、cookie、CORS、cache 如何影響 API 行為，並具備用 curl 與 DevTools 除錯、設計資源導向 API 的能力。這門課刻意把 JWT、OAuth、密碼雜湊留給後續的 Authentication 課程。

---

### **你要建立的核心心智模型**

```text
Browser / Client
      │
      │  HTTP Request
      ▼
    Server
      │
      │  HTTP Response
      ▼
Browser / Client
```

並逐步理解：**HTTP 怎麼傳輸、怎麼辨認身份、怎麼控制權限、怎麼快取、怎麼除錯，以及這些東西最後如何影響 API architecture。**

學完的驗收標準不是「看完」，而是看到這筆 request：

```http
GET /api/orders/123 HTTP/1.1
Host: api.example.com
Cookie: session=abc
Authorization: Bearer xxx
Origin: https://www.example.com
Accept: application/json
```

你能在腦中立刻拆成：

```text
誰在發？
 ↓
連去哪？
 ↓
用什麼 protocol？
 ↓
要什麼 resource？
 ↓
帶了什麼身份資訊？
 ↓
Browser 有沒有 Same-Origin / CORS 限制？
 ↓
Server 怎麼驗證？
 ↓
Server 回什麼 status？
 ↓
Response 能不能 cache？
```

---

### **課程路徑總覽**

#### [零號模組：HTTP 到底在解決什麼問題 (Mental Model)](./module_0_mental_model/)
- Client / Server 與 Request / Response
- 輸入一個 URL，背後發生什麼
- HTTP 不等於 API

#### [第一模組：拆解 HTTP Request (The Request)](./module_1_request/)
- Request Line
- Methods：Safe / Idempotent / Cacheable
- Headers 與 Body
- Path / Query / Body 該放什麼

#### [第二模組：讀懂 HTTP Response (The Response)](./module_2_response/)
- Status Code 家族
- 401 vs 403
- Response Headers 與 Body

#### [第三模組：URL、Domain、DNS、Port (Where Am I Connecting)](./module_3_url_dns_port/)
- URL Anatomy
- DNS 與 Port
- localhost / 127.0.0.1 / 0.0.0.0
- 反向代理與轉發標頭

#### [第四模組：Browser 與 HTTP (The Browser)](./module_4_browser/)
- Chrome DevTools Network
- Cookie 機制
- Same-Origin Policy 與 CORS

#### [第五模組：HTTPS、TLS 與安全傳輸 (HTTPS & TLS)](./module_5_https/)
- HTTP vs HTTPS
- TLS 保護什麼
- Certificate 與 Handshake

#### [第六模組：State、Cache、Session (State & Cache)](./module_6_state_cache/)
- HTTP 為什麼是 Stateless
- Session 的基本形狀
- HTTP Cache 與 CDN

#### [第七模組：HTTP API Design (API Design)](./module_7_api_design/)
- Resource-oriented API
- Pagination / Filtering / Error / Versioning
- Idempotency

#### [最終模組：實戰與除錯 (Hands-on Debugging)](./module_8_practice/)
- curl / DevTools / Postman
- 自己打造並「攻破」一個 API（公開 → Cookie → Bearer → 授權 → BFF）

---

### **詳細課程內容**

#### **零號模組：HTTP 到底在解決什麼問題 (Mental Model)**

**課程目標：** 建立全局 mental model，知道 HTTP 在網路世界的位置，以及它不是 API 本身。
**心智模型：** HTTP 是「兩台電腦約定好的說話方式」。一邊問、一邊答。瀏覽器、手機 App、curl、Next.js server 都只是不同的提問者；REST、GraphQL、檔案上傳都只是不同的問法。先知道自己站在哪一層，後面每一章才放得進去。

*   **1. 網路世界最基本的模型：**
    *   Client / Server、Request / Response、IP / Port。
    *   TCP 負責可靠運送；HTTP 負責運送「有語意的文件」。
*   **2. 當你輸入一個 URL，背後發生什麼：**
    *   URL → DNS → TCP → TLS → HTTP → Server → Response → Browser。
*   **3. HTTP 不等於 API：**
    *   網頁、REST、GraphQL、檔案上傳都跑在 HTTP 上。
    *   HTTP/1.1 vs HTTP/2 vs HTTP/3 的差別（只到多路複用與 QUIC）。

#### **第一模組：拆解 HTTP Request (The Request)**

**課程目標：** 看到任何 request 都能拆成 Method、Path、Query、Header、Body。
**心智模型：** 一筆 request 像一封掛號信：信封上寫寄去哪、用什麼方式處理（Method）、附件是什麼（Body）、身份證件夾在哪（Header）。Server 只看這封信，看不到你是誰坐在螢幕前。

*   **1. Request Line：** Method / Path / Query String / HTTP Version。
*   **2. HTTP Methods：** Safe、Idempotent、Cacheable；破除「GET = 查詢、POST = 新增」。
*   **3. Headers：** 誰提供、誰可偽造；連到 API security。
*   **4. Request Body：** JSON / form-urlencoded / multipart / binary。
*   **5. Path vs Query vs Body：** 什麼情況該用哪一種。

#### **第二模組：讀懂 HTTP Response (The Response)**

**課程目標：** 看到 response 就知道 server 在告訴你什麼。
**心智模型：** Status code 是第一句話（成了、轉址、你錯了、我掛了），Header 是附註，Body 才是內容。很多人只看 Body，所以永遠除不了 401 / 403 / CORS 的錯。

*   **1. Status Code：** 1xx–5xx 家族；精熟 200 / 201 / 204、301 / 302 / 304、400 / 401 / 403 / 404 / 405 / 409 / 422 / 429、500 / 502 / 503 / 504。
*   **2. 401 vs 403：** 「你是誰我不知道」vs「我知道你是誰，但不准」。
*   **3. Response Headers：** Location、Set-Cookie、Cache-Control、ETag、CORS。
*   **4. Response Body：** JSON 形狀與 error shape 預告。

#### **第三模組：URL、Domain、DNS、Port (Where Am I Connecting)**

**課程目標：** 真正理解「我到底在連哪裡」。
**心智模型：** URL 不是「網站名字」，它是一份完整地址：用什麼協議、找哪台機器、敲哪扇門、進哪個房間、帶什麼問題。DNS 把名字換成 IP；Port 是那台機器上的門牌。

*   **1. URL Anatomy：** scheme / host / port / path / query / fragment。
*   **2. DNS：** A / AAAA / CNAME / TTL / cache。
*   **3. Port：** 80 / 443 / 3000 / 8080。
*   **4. localhost / 127.0.0.1 / 0.0.0.0：** 對 Next.js 與雲端部署至關重要。
*   **5. 反向代理：** `Host`、`X-Forwarded-For`、`X-Forwarded-Proto`。

#### **第四模組：Browser 與 HTTP (The Browser)**

**課程目標：** 理解瀏覽器不是 curl。Cookie、Same-Origin、CORS 是 browser security，不是 API authentication。
**心智模型：** 瀏覽器是一個「不信任的管家」。它會自動帶 Cookie、會攔截跨來源、會先發 OPTIONS 問可不可以。curl 沒有這位管家，所以同一支 API 在瀏覽器失敗、在 curl 成功，往往不是 API 壞了，而是管家擋了你。

*   **1. Chrome DevTools Network：** 讀一筆 request 的所有欄位。
*   **2. Cookie：** HttpOnly / Secure / SameSite / Domain / Path / Max-Age。
*   **3. Same-Origin Policy：** 什麼算同一個 origin。
*   **4. CORS：** Origin → Preflight → OPTIONS → ACAO。
*   **5. Browser vs curl：** 為什麼行為不同。

#### **第五模組：HTTPS、TLS 與安全傳輸 (HTTPS & TLS)**

**課程目標：** 理解 HTTPS 保護什麼、不保護什麼。
**心智模型：** HTTP 是明信片，路上人人可讀可改。HTTPS 是把明信片塞進上鎖的信封（TLS）。信封保證「沒被拆、沒被改、對方是真的那家店」；信封裡面寫了什麼（你的 Cookie、你的 JSON）仍然是 HTTP。

*   **1. HTTP vs HTTPS：** 明文 vs HTTP over TLS。
*   **2. TLS 保護三件事：** Confidentiality / Integrity / Authentication。
*   **3. Certificate：** CA、公鑰／私鑰、Certificate Chain。
*   **4. Handshake：** Browser → TLS → Encrypted HTTP → Server。

#### **第六模組：State、Cache、Session (State & Cache)**

**課程目標：** 理解 HTTP 預設不記得你，以及我們如何用 Cookie / Session / Cache 補上記憶。
**心智模型：** HTTP 像窗口櫃檯：每次你走過來，櫃員都不記得上一筆。Session 是櫃員在後台放的檔案夾（用 Cookie 當領取牌）。Cache 是「這份文件暫時不用再印一次」。CDN 是把複印本放到離你更近的超商。

*   **1. Stateless：** 為什麼 Request #1 與 Request #2 互不認識。
*   **2. Session：** Cookie 裡的 id vs Server 上的 store。
*   **3. HTTP Cache：** Cache-Control / ETag / Last-Modified / 304。
*   **4. CDN：** Browser → CDN → Origin。
*   **5. 什麼不該 cache：** 帶 Authorization 的個人化 response。

#### **第七模組：HTTP API Design (API Design)**

**課程目標：** 把 HTTP 知識落到「我到底該怎麼設計 API」。
**心智模型：** API 是把業務物件變成 URL 上的資源。Method 表達動作，Status 表達結果，Body 表達內容。好的 API 讓呼叫端不用猜，也不用讀一份 40 頁的文件才能刪一筆資料。

*   **1. Resource-oriented API：** `/users`、`/users/:id`。
*   **2. Pagination：** page vs cursor。
*   **3. Filtering / Sorting。**
*   **4. Error Design：** 穩定的 `code` + `message`。
*   **5. Versioning：** 到底要不要 `/v1`。
*   **6. Idempotency：** retry 時 POST / PUT / PATCH 會發生什麼。
*   **7. 何時不該硬套 REST。**

#### **最終模組：實戰與除錯 (Hands-on Debugging)**

**課程目標：** 用 curl、DevTools、以及一個故意分層的迷你 API，把前面所有概念走一遍。
**心智模型：** 理論看懂不夠。你要親手看到：同一支 `GET /users/123`，公開時人人可讀；加 Cookie 後變 401；加 Bearer 後仍是 401；換成別人的 id 變 403；放到 BFF 後面之後，瀏覽器能用、匿名 curl 打不進 Backend。

*   **1. curl：** `-i` `-v` `-X` `-H` `-d` `-b` `-c`。
*   **2. Browser DevTools 對照 Next.js：** RSC fetch / Route Handler / 直打 Backend。
*   **3. Postman / Bruno / HTTPie：** 與 curl 本質相同。
*   **4. 實戰：** [`examples/insecure-api`](./examples/insecure-api/) 的 A–E 五個版本。

---

### **我會安排的學習順序**

不要照一般網路課程從 TCP 開始啃。路線如下：

```text
Week 1
HTTP Mental Model
    ↓
Request / Response
    ↓
Method / Header / Body
    ↓
Status Code

Week 2
URL / DNS / Port
    ↓
Browser Network
    ↓
Cookie
    ↓
Same-Origin / CORS

Week 3
HTTPS / TLS
    ↓
Stateless
    ↓
Session
    ↓
Cache / CDN

Week 4
REST / API Design
    ↓
Pagination
    ↓
Error Handling
    ↓
Idempotency
    ↓
Versioning

Week 5
curl
    ↓
DevTools
    ↓
Postman
    ↓
實戰 API
    ↓
攻擊自己的 API
```

---

### **與後續課程的銜接**

這門課會把 **Browser、Cookie、CORS、401 vs 403** 提到很重要的位置，因為它們會直接把你從「會寫 Next.js API」帶到「開始懂 Web Backend」。

刻意不寫進這門課、留給後續的內容：

| 這門課停在這裡 | 下一門接什麼 |
|----------------|--------------|
| Cookie 是 HTTP 的 state transport | [184 Authentication / Authorization](../184-authentication-authorization/)：你是誰、你可以做什麼 |
| Session 的基本形狀（id + store） | [185 Cookie / Session / JWT](../185-cookie-session-jwt/)：三者在不同層次，以及如何實作 |
| CORS 不是 authentication | 184 會把認證與授權拆開 |
| 五種 API 防護版本的直覺 | 184 / 185 才實作 JWT、refresh、OAuth |

---

通過這套精心設計的課程，您將從每天都在用的瀏覽器出發，建立起對 HTTP 堅實而全面的理解，具備獨立拆解、設計與除錯 API 的實戰能力。

### **課程特色**
- **心智模型先行**：先建立直覺，再深入細節
- **不是 RFC 背誦課**：每個概念都連回你會遇到的 Next.js / Backend 場景
- **實作驅動**：curl 貫穿全程，最後用五個版本攻破自己的 API
- **為後續課程鋪路**：Cookie / CORS / 401 vs 403 會成為 Authentication 課的地基

### **學習建議**
- 預計學習時間：20–35 小時（根據背景而定）
- 建議基礎：會用瀏覽器、會寫一點 JavaScript / TypeScript，有發過 `fetch` 更佳
- 學習方式：概念理解 + 動手 curl + 對照 DevTools
- 必備工具：Chrome（或 Edge）DevTools、curl、Node.js（跑最終範例）

### **課程目標**

#### 學習結束後，您將：
- 看到任何 HTTP request / response 都能拆解
- 正確使用 HTTP method、status code、header
- 理解 Cookie、Same-Origin、CORS 是瀏覽器機制，不是 API 登入
- 理解 HTTPS 保護什麼、HTTP cache 何時能用
- 能設計資源導向的 API，並處理 pagination、error、idempotency
- 能用 curl 與 DevTools 獨立除錯

---

**立即開始您的 HTTP 學習之旅！** 從 [零號模組](./module_0_mental_model/) 出發。
