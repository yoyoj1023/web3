# 第四模組：Browser 與 HTTP (The Browser)

## 模組目標
學會用 DevTools 讀一筆真實 request；理解 Cookie 怎麼被存、被送；理解 Same-Origin Policy 與 CORS。最重要的一句話：**CORS 是 browser security mechanism，不是 API authentication。**

## 心智模型
瀏覽器是一個「不信任的管家」。它會自動帶 Cookie、會攔截跨來源讀取、會先發 OPTIONS 問可不可以。curl 沒有這位管家，所以同一支 API 在瀏覽器失敗、在 curl 成功，往往不是 API 壞了，而是管家擋了你。

```text
你以為：
  JS fetch ──► API ──► JSON

實際在瀏覽器裡：
  JS fetch
      │
      │  管家檢查 origin、cookie、preflight
      ▼
    真正的 HTTP
      │
      ▼
    API
```

這一章會直接回答你從「會寫 Next.js」跨到「懂 Web Backend」時最容易卡住的疑惑。

---

## 第一課：Browser 到底怎麼發 HTTP Request

打開 Chrome（或 Edge）→ F12 → **Network**。重新整理頁面。每一列都是一筆 HTTP（或 WebSocket）。

點一筆，你應該會看到：

```text
Request URL
Request Method
Status Code
Remote Address
Referrer Policy

Request Headers
Response Headers
Payload / Request Body
Cookies
Timing
```

### 1.1 建議的閱讀順序

不要從 Preview 的 JSON 開始。順序是：

```text
1. Method + URL + Status     這筆是什麼、成不成
2. Request Headers           帶了誰的身份、什麼 Origin、什麼 Cookie
3. Response Headers          Set-Cookie？CORS？Cache？Location？
4. Request Payload           送了什麼
5. Response Body             才看內容
6. Timing                    慢在 DNS、TLS、還是等待 server
```

這就是本課程開頭那個拆解清單的實作版。

### 1.2 篩選與幾個容易漏的開關

- **Fetch/XHR**：只看 JS 發的 API，把圖片與字體濾掉
- **Preserve log**：換頁後不要清空，除錯 redirect 必開
- **Disable cache**：開發時避免 304 讓你以為 server 沒被打到
- 紅色列：失敗的 CORS 常顯示 status `(failed)`，Response 可能是空的——因為管家沒讓 JS 看到

### 1.3 一筆 Next.js 頁面可能有很多 request

```text
Browser
  ├─ GET /dashboard          HTML / RSC payload
  ├─ GET /_next/static/...   JS / CSS
  ├─ GET /api/me             你寫的 Route Handler
  └─ GET https://api.example.com/users   瀏覽器直打 Backend（若你真的這麼寫）
```

最後一筆如果跨 origin，就會進入 CORS。若改成 Next.js server 去打 Backend，瀏覽器根本看不到那筆——那是 server-to-server，沒有管家。第八模組的 Version E 就是在示範這件事。

---

## 第二課：Cookie

Server 請瀏覽器記住一張紙條：

```http
HTTP/1.1 200 OK
Set-Cookie: session=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
```

之後**同一個範圍內**的 request，瀏覽器會自動附上：

```http
GET /api/me HTTP/1.1
Host: www.example.com
Cookie: session=abc123
```

Cookie 是 **HTTP 的 state transport**，不是 authentication 本身。它可以載 session id、也可以載主題色 `theme=dark`。把「有 Cookie」當成「已登入」是層次錯亂。185 會把 Cookie / Session / JWT 拆到正確的層。

### 2.1 每個屬性在管什麼

| 屬性 | 作用 |
|------|------|
| `HttpOnly` | JS 讀不到 `document.cookie`。降低 XSS 偷 session 的機率，不是萬能 |
| `Secure` | 只在 HTTPS 送出（localhost 有例外）。防明文竊聽 |
| `SameSite` | 跨站 request 要不要帶這張 Cookie。`Strict` / `Lax` / `None` |
| `Domain` | 哪些 host 可以收到。預設是設下它的那個 host，不含子網域 |
| `Path` | 哪些 path 會帶。`Path=/` 幾乎全站 |
| `Max-Age` / `Expires` | 活多久。沒設就是 session cookie，瀏覽器關掉可能就沒了 |

### 2.2 SameSite 為什麼突然變得很重要

```text
你在 https://evil.example 放了一個表單，POST 到 https://bank.example/transfer
如果 bank 的 session cookie 會被帶去，這就是 CSRF
```

`SameSite=Lax`（現代瀏覽器預設傾向）會讓「跨站 POST」帶不到 Cookie，大幅減少這類攻擊。`SameSite=None` 必須搭配 `Secure`，用在真的需要跨站帶 Cookie 的場景（通常你該改架構，而不是開這個）。

### 2.3 Cookie 不會自己驗證任何人

```http
Cookie: session=abc123
```

這只是 client 送來的字串。Server 必須拿 `abc123` 去 session store 查「這是誰」。查不到 → 401。查到但是目標資源不是他的 → 403。

任何人攔截到這張紙條（XSS、惡意套件、共享電腦）都能重放。所以才有 HttpOnly、Secure、短效、旋轉 session id。細節留給 185；這裡先建立：**Cookie 是自動附上的主張，與 Authorization header 一樣不可直接信任。**

### 2.4 你在 DevTools 哪裡看

Network → 某一筆 → Cookies 面板，或 Application → Cookies。注意 `HttpOnly` 的 Cookie 在 Console 用 `document.cookie` 會看不到，但 Network 的 Request Headers 裡仍會出現——因為管家會帶，只是不給 JS 讀。

---

## 第三課：Same-Origin Policy

Origin 在第三模組定義過：

```text
origin = scheme + host + port
```

```text
https://example.com
https://example.com/a
https://example.com/b
→ 同 origin（path 不計入）

https://example.com
https://api.example.com
→ 不同 origin（host 不同）

https://example.com
http://example.com
→ 不同 origin（scheme 不同）

https://example.com
https://example.com:441
→ 不同 origin（port 不同）
```

### 3.1 SOP 在保護什麼

瀏覽器的規則大致是：

> 來自 A origin 的 JS，不能任意**讀取** B origin 的 response。

注意是「讀取」，不是「送出」。表單可以 POST 到別的站；`<img>` 可以顯示別的站的圖。危險的是：**evil.example 的 JS 讀到了你的銀行 JSON。**

```text
https://evil.example 的腳本：
  fetch("https://bank.example/api/balance")

沒有 CORS 放行時：
  request 可能已經到 bank（尤其是 simple request）
  但 JS 拿不到 response
  管家擋住的是「讀」，不一定是「送」
```

這就是為什麼 CORS 不是 authentication：銀行還是可能已經處理了那筆 request。真正不該讓陌生人觸發的動作，必須靠 CSRF token、SameSite Cookie、或不要用 Cookie 當跨站 API 的憑證。

---

## 第四課：CORS

當 JS 對不同 origin 發 `fetch` / `XHR`，瀏覽器介入 CORS。

### 4.1 流程

```text
Origin: https://www.example.com
        ↓
  需要 preflight 嗎？
        ↓ 是
  OPTIONS /api/users
  Access-Control-Request-Method: POST
  Access-Control-Request-Headers: content-type,authorization
        ↓
  Server 回：
  Access-Control-Allow-Origin: https://www.example.com
  Access-Control-Allow-Methods: POST, GET, OPTIONS
  Access-Control-Allow-Headers: content-type,authorization
  Access-Control-Allow-Credentials: true
        ↓
  通過才發真正的 POST
        ↓
  真正的 response 也必須帶 ACAO，JS 才能讀
```

不是每筆跨來源都會 preflight。滿足「簡單請求」條件的 GET / POST 可能直接發出。一旦你加了 `Authorization`、自訂 header、或 `Content-Type: application/json`，幾乎一定會先 OPTIONS。

### 4.2 關鍵 response header

| Header | 意義 |
|--------|------|
| `Access-Control-Allow-Origin` | 哪個 origin 的 JS 可以讀。`*` 不能跟 credential 併用 |
| `Access-Control-Allow-Credentials` | 允許瀏覽器帶 Cookie。必須指定明確 origin，不能 `*` |
| `Access-Control-Allow-Methods` | preflight 時允許哪些 method |
| `Access-Control-Allow-Headers` | preflight 時允許哪些 request header |

### 4.3 CORS 不是登入、不是授權

```text
錯誤心智：
  「我設了 CORS，所以只有我的前端能打這支 API」

事實：
  CORS 只約束瀏覽器裡的 JS
  curl、Postman、惡意 server、手機 App 完全不理 CORS
  任何人都可以：
    curl https://api.example.com/users/123
```

防護身份靠的是 Authentication / Authorization（Cookie 對應的 session、Bearer token、物件層權限），不是 `Access-Control-Allow-Origin`。

把 CORS 當防火牆，會在「curl 打得通、瀏覽器報 CORS error」時完全解錯題：你可能以為 API 很安全，其實它對全世界的非瀏覽器 client 是敞開的。

### 4.4 常見錯誤訊息在說什麼

瀏覽器 Console 出現：

```text
No 'Access-Control-Allow-Origin' header is present
```

意思是：管家不讓 JS 讀這筆 response。可能原因：

- server 真的沒設 CORS
- preflight OPTIONS 被你的 framework 回了 404
- 你回了 `*` 但又 `credentials: 'include'`
- 實際是 500，代理回了沒有 CORS header 的錯誤頁——看起來像 CORS，根因是 500

除錯順序：先用 curl 打同一筆，看 status 與 header。curl 成功且有 ACAO，再回頭看瀏覽器的 Origin 是否被允許。

---

## 第五課：Browser request 跟 curl 本質上有什麼不同？

兩者送的都是 HTTP。差別在**預設行為**：

| | 瀏覽器 | curl |
|--|--------|------|
| Cookie | 自動存、自動帶（受 SameSite / Domain 約束） | 你手動 `-b` / `-c` |
| Origin | 自動設成當前頁面 | 預設沒有；你可以偽造 `-H "Origin: ..."` |
| SOP / CORS | 有管家 | 沒有 |
| TLS 憑證錯誤 | 大警告，使用者很難繼續 | `-k` 就能忽略（不要養成習慣） |
| Redirect | 自動跟隨，可能換成 GET | `-L` 才跟隨 |
| User-Agent | 瀏覽器字串 | `curl/x.y` |

所以：

```text
瀏覽器失敗、curl 成功
  → 先想 CORS、Cookie 沒帶、SameSite、混合內容（HTTPS 頁面打 HTTP API）

curl 失敗、瀏覽器成功
  → 先想你沒帶 Cookie / Authorization、Host 不對、缺 header
```

這正好回到本課最開始的問題：不是「HTTP 不一樣」，是「client 不一樣」。

---

## 動手做（約 10 分鐘）

1. 打開一個會登入的網站（或你自己的 Next.js app），F12 → Network → Fetch/XHR。
2. 點一筆 API，抄下：Origin、Cookie 有沒有出現、Response 有沒有 `Set-Cookie` 或 `Access-Control-Allow-Origin`。
3. 把 Request URL 複製出來，在終端機：

```bash
curl -i "貼上剛才的 URL"
```

4. 對照：curl 有沒有拿到瀏覽器裡同一份 JSON？若 API 需要登入，curl 多半是 401——因為沒有 Cookie。
5. 若你抄到了 Cookie（不要在公用場合貼真實 session），可以實驗：

```bash
curl -i "同一 URL" -H "Cookie: session=你抄到的值"
```

這會讓你對「Cookie 只是一段可重放的字串」產生身體記憶。用完就當這張 session 已暴露，正式環境請登出或作廢。

---

## 自我檢查

**Q1.** CORS 能阻止攻擊者用 curl 打你的 API 嗎？  
**A1.** 不能。CORS 只約束瀏覽器中的跨來源 JS。

**Q2.** `HttpOnly` Cookie 在 Network 面板看得到嗎？JS 讀得到嗎？  
**A2.** Request Headers 看得到；`document.cookie` 讀不到。

**Q3.** `https://www.example.com` 的 JS 打 `https://api.example.com` 是同 origin 嗎？  
**A3.** 不是。host 不同。需要 CORS 或改走同源 BFF。

**Q4.** Preflight 用什麼 method？  
**A4.** OPTIONS。真正的 GET/POST 在它通過之後才發。

**Q5.** 管家擋住的是「送出 request」還是「讓 JS 讀 response」？  
**A5.** 核心是擋住讀。部分 simple request 已經送到 server 了。所以敏感寫入不能只靠 CORS 保護。

---

下一模組：[第五模組：HTTPS、TLS 與安全傳輸](../module_5_https/)
