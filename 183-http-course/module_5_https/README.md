# 第五模組：HTTPS、TLS 與安全傳輸 (HTTPS & TLS)

## 模組目標
理解 HTTP 與 HTTPS 的差別、TLS 到底保護哪三件事、憑證在證明什麼，以及握手大致長什麼樣子。不鑽密碼學數學。

## 心智模型
HTTP 是明信片，路上的路由器、咖啡廳 Wi-Fi、公司代理人人可讀可改。HTTPS 是把明信片塞進上鎖的信封（TLS）。信封保證「沒被拆、沒被改、對方是真的那家店」；信封裡面寫了什麼（你的 Cookie、你的 JSON）仍然是 HTTP。

```text
HTTP
 ↓
明文

HTTPS
 ↓
HTTP over TLS
```

---

## 第一課：HTTP vs HTTPS

兩者的應用語意相同：還是 GET、還是 Header、還是 JSON。差在**路上看不看得到**。

```text
http://api.example.com     預設 port 80，明文
https://api.example.com    預設 port 443，先建 TLS 再走 HTTP
```

明文意味著：

```text
GET /api/me HTTP/1.1
Host: api.example.com
Cookie: session=abc123
Authorization: Bearer xxx
```

任何能看到封包的人都能複製這張 Cookie，明天重放。這不是理論：公開 Wi-Fi 上的 HTTP 登入頁，歷史上被這樣偷過無數次。

HTTPS 下，旁人看到的是對 TLS 連線的加密位元組。他們仍可能知道你連了哪個 IP、大約傳了多少資料，但讀不到 Cookie 與 Body。

### 1.1 混合內容（Mixed Content）

HTTPS 網頁裡再去載入 `http://` 的 script 或 API，瀏覽器會擋或警告。症狀常被誤認為 CORS：

```text
頁面：https://www.example.com
API ：http://api.example.com     ← 瀏覽器不讓
```

修法是 API 也走 HTTPS，而不是關瀏覽器安全檢查。

### 1.2 HTTPS 不自動等於「這支 API 很安全」

TLS 保護**傳輸**。它不保護：

- 你的 endpoint 沒做認證（第八模組 Version A）
- SQL injection
- XSS 把 HttpOnly 以外的東西偷走
- Server 自己把資料洩到 log

「我們有 HTTPS」只回答了「路上安不安全」，沒有回答「門禁做得如何」。

---

## 第二課：TLS 在保護什麼？

三個核心詞，請用白話記住：

```text
Confidentiality   保密：路上的人讀不懂
Integrity         完整：路上的人改了會被發現
Authentication    認證：你連到的是真的 example.com，不是冒牌貨
```

少任何一個都麻煩：

| 缺了 | 後果 |
|------|------|
| 只有保密、沒認證 | 你可能把密碼加密著送給攻擊者（中間人） |
| 只有認證、沒保密 | 你確定對方是銀行，但旁人仍能讀 |
| 沒有完整 | 中間人把「轉帳 100」改成「轉帳 10000」，你還以為沒被改 |

TLS 的設計就是三者一起給。這也是為什麼瀏覽器對憑證錯誤那麼兇：缺了 Authentication，另外兩項會建在錯誤的對象上。

---

## 第三課：Certificate

憑證（Certificate）是一份「關於公鑰的介紹信」，由憑證機構（CA）簽名。

```text
Certificate
  ├─ 這張憑證是發給誰的（example.com）
  ├─ 有效期限
  ├─ 網站的 Public Key
  └─ CA 的簽章
```

### 3.1 公鑰與私鑰（比喻即可）

```text
Public Key     可以公開。別人用來加密給你、或驗證你的簽章
Private Key    鎖在 server 裡。洩漏 = 別人可以假冒你的站
```

瀏覽器不需要把私鑰傳來傳去。握手過程用憑證裡的公鑰，確認「能解開這段挑戰的人，擁有對應私鑰」，再加上 CA 的簽章，確認「這個公鑰真的屬於 example.com」。

### 3.2 Certificate Chain

你的葉憑證很少由瀏覽器內建的根 CA 直接簽。中間還有中繼 CA：

```text
Root CA          （內建在作業系統 / 瀏覽器）
   │ 簽
Intermediate CA
   │ 簽
example.com 的葉憑證
```

Server 必須把葉憑證**加上中繼**一起送出。少送中繼，有的電腦能連（快取過）、有的電腦報憑證錯誤。這是「我電腦可以、他電腦不行」的常見原因。

### 3.3 瀏覽器在檢查什麼

- 現在時間是否在有效期內
- 域名是否吻合（含 SAN、wildcard `*.example.com`）
- 鏈是否接到受信任的 Root
- 是否被撤銷（CRL / OCSP，實務上各瀏覽器策略不同）

`*.example.com` **不含** `example.com` 本身，也不含 `a.b.example.com`。憑證與 DNS 要對齊。

### 3.4 自簽憑證

開發時你可能自己簽一張。瀏覽器不信任你，會大警告。這是正確行為。把公司電腦設成信任內部 CA 是 IT 的工作；把「一律點繼續」養成習慣，會讓真的中間人變得不可見。

---

## 第四課：HTTPS Request 到底發生什麼？

把一次連線走一遍（概念版，不是 TLS 1.3 的逐訊息名稱）：

```text
Browser
   │  1. DNS：example.com → IP
   │  2. TCP：連到 IP:443
   │  3. TLS handshake
   │       - 談版本與套件
   │       - server 出示憑證鏈
   │       - 瀏覽器驗證鏈與域名
   │       - 雙方得出對稱金鑰（真正傳資料用，比較快）
   │  4. 在加密通道上送 HTTP
   ▼
Encrypted HTTP
   │
   ▼
Server 解密 → 得到普通的 GET / Header / Body
   │
   ▼
HTTP Response 再加密送回
```

TLS 1.3 把握手往返次數壓低，HTTP/3 / QUIC 還把握手與連線再合併。對你寫 API 的人，結果都一樣：**應用層看到的仍是 HTTP。**

### 4.1 中間人與「為什麼不要忽略憑證警告」

攻擊者在你與網站中間（惡意 Wi-Fi、被污染的 DNS、公司代理裝自己的 CA）：

```text
你  ←TLS→  攻擊者  ←TLS→  真的銀行
```

若攻擊者沒有銀行的私鑰，他無法出示合法憑證，瀏覽器會警告。你若點「仍要前往」，就是自願跟攻擊者建了一條「保密」的通道——保密給錯人。

curl 的 `-k` / `--insecure` 等價於點那個按鈕。除錯自簽憑證時可以用，正式環境與教學示範都不要當成正常步驟。

### 4.2 你在 DevTools 能看到的

Security 面板或憑證檢視器可以看到：

- 協議版本（TLS 1.2 / 1.3）
- 憑證主體、發行者、有效期
- 連線是否被視為安全

Network 裡 Request Headers 仍然是解密後的 HTTP。DevTools 是在你的機器上、TLS 終止之後看的，所以你看得到 Cookie。路上的人看不到。

---

## 動手做（約 8 分鐘）

1. 用瀏覽器打開任意 HTTPS 網站，點網址列左側的鎖 → 檢視憑證。抄下：發給誰、誰發行、有效期。
2. 對同一站：

```bash
curl -vI https://example.com
```

在 verbose 輸出裡找 TLS 相關行（Connected to、SSL connection using、server certificate）。

3. 對照 HTTP（若網站仍開放 80，可能立刻 301 到 HTTPS）：

```bash
curl -i http://example.com
```

看 `Location` 是不是 `https://...`。這就是 HSTS / 伺服器轉址在把明信片改成信封。

不要對正式網站使用 `-k`。若你日後在本機用自簽憑證，才在明確知情下使用。

---

## 自我檢查

**Q1.** HTTPS 是另一套與 HTTP 無關的應用協議嗎？  
**A1.** 不是。HTTPS = HTTP over TLS。Method 與 Header 不變。

**Q2.** TLS 的 Authentication 認證的是使用者還是網站？  
**A2.** 預設認證的是**網站**（憑證證明你連到 example.com）。使用者登入是應用層的 Authentication，那是 184 的主題。

**Q3.** 為什麼憑證鏈少送中繼會「有的瀏覽器可以、有的不行」？  
**A3.** 有的 client 快取過中繼，有的沒有。Server 應送完整鏈。

**Q4.** 開了 HTTPS 之後還需要怕 Cookie 被偷嗎？  
**A4.** 傳輸途中難被偷。XSS、惡意套件、日誌外洩、自己把 Cookie 印到前端，仍然可以。`Secure` 只保證「不走明文 HTTP 送出」。

**Q5.** 混合內容是什麼？  
**A5.** HTTPS 頁面載入明文 HTTP 的資源或 API。瀏覽器會擋，常被誤診成 CORS。

---

下一模組：[第六模組：State、Cache、Session](../module_6_state_cache/)
