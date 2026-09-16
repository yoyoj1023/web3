# 第三模組：URL、Domain、DNS、Port (Where Am I Connecting)

## 模組目標
真正理解「我到底在連哪裡」：URL 每一段的意義、DNS 如何把名字換成 IP、Port 是什麼、以及 localhost / 127.0.0.1 / 0.0.0.0 為什麼會讓 Next.js 與雲端部署踩雷。

## 心智模型
URL 不是「網站名字」，它是一份完整地址：用什麼協議、找哪台機器、敲哪扇門、進哪個房間、帶什麼問題。DNS 把名字換成 IP；Port 是那台機器上的門牌。你在本機寫 `localhost:3000`，跟你在 Render 綁 `0.0.0.0:$PORT`，講的是兩件完全不同的事——一個是「我要連誰」，一個是「我要在哪些網卡上聽」。

```text
https://api.example.com:443/users/123?active=true#profile
└─┬─┘ └──────┬──────┘ └┬┘ └──────┬──────┘ └───┬───┘  └───┬───┘
scheme       host      port       path       query    fragment
```

---

## 第一課：URL Anatomy

逐段拆：

| 部分 | 例子 | 意義 |
|------|------|------|
| scheme | `https` | 用什麼協議（http / https / ws / wss） |
| host | `api.example.com` | 要找哪一台（或哪個名字） |
| port | `443` | 敲哪扇門。HTTPS 預設 443 可省略，HTTP 預設 80 可省略 |
| path | `/users/123` | 哪個資源 |
| query | `active=true` | 附加條件，`?` 開頭、`&` 串接 |
| fragment | `profile` | 頁面內錨點。**不會送到 server** |

### 1.1 Fragment 不上 server

```text
https://example.com/users/123#profile
```

瀏覽器發給 server 的是：

```http
GET /users/123 HTTP/1.1
Host: example.com
```

`#profile` 只留給前端自己捲動或讀 `location.hash`。API 設計不要把重要參數放 fragment。

### 1.2 Origin 是 URL 的前三段

後面 CORS 會一直用到這個詞：

```text
origin = scheme + host + port
```

```text
https://example.com          origin = https://example.com:443
https://example.com:443      同上（預設 port 視為相同）
http://example.com           不同（scheme 不同）
https://api.example.com      不同（host 不同）
https://example.com:3000     不同（port 不同）
```

兩個 origin 不同，對瀏覽器就是跨來源。第四模組會把這件事變成 CORS。

### 1.3 編碼

Query 裡的空白、中文、`&` 必須編碼：

```text
?q=hello world      錯，空白會切斷
?q=hello%20world    對
?q=台北              應編成 UTF-8 percent-encoding
```

Path 也可以編碼。Server 框架通常會幫你 decode。你自己組 URL 時，用語言提供的 `URLSearchParams` / `encodeURIComponent`，不要手拼。

---

## 第二課：DNS

人記得住 `api.example.com`，機器只認得 IP。

```text
example.com
     ↓
   DNS
     ↓
93.184.216.34
```

### 2.1 常見紀錄類型

| 類型 | 作用 |
|------|------|
| A | 域名 → IPv4 |
| AAAA | 域名 → IPv6 |
| CNAME | 域名 → 另一個域名（再繼續查） |
| TTL | 這份答案可以 cache 多久 |

`www.example.com` CNAME 到 `example.com`，再 A 到 IP，是很常見的鏈。

### 2.2 DNS cache

查過的答案會被記住：瀏覽器、作業系統、ISP、CDN 的 DNS 都可能 cache。TTL 是「建議記住幾秒」。所以你改了 DNS，不一定全世界立刻看到新 IP。這不是 HTTP 的錯，是名字系統的傳播延遲。

開發時遇到「域名指到舊機器」：

```text
先確認 DNS 答案是不是你以為的那個 IP
再確認 HTTPS 憑證是不是那台機器的
最後才懷疑應用程式
```

### 2.3 為什麼 API 常放在子網域

```text
https://www.example.com     前端
https://api.example.com     後端
```

這是兩個 origin。好處是可以獨立部署、獨立憑證、獨立快取策略；代價是一定會碰到 CORS。這不是意外，是架構選擇。

---

## 第三課：Port

Port 是 16-bit 數字（0–65535），表示**同一台機器上的哪一個程式在聽**。

```text
80     HTTP 預設（明文）
443    HTTPS 預設
3000   Next.js / Node 開發常見
8080   另一個常見後備
5432   PostgreSQL
6379   Redis
```

```text
https://api.example.com          =  host + 預設 443
https://api.example.com:443      =  同上
http://localhost:3000            =  本機 loopback + 3000
```

**Port 不是「安全性等級」。** 把 API 放在 8080 不會比較安全，只是比較少人猜到，這叫 security through obscurity，不算防護。防火牆與認證才是。

同一時間，同一張網卡上的同一個 port，通常只能被一個行程 bind。所以你常看到：

```text
Error: listen EADDRINUSE: address already in use :::3000
```

那表示 3000 已經被另一個 Next.js 佔走了。

---

## 第四課：localhost / 127.0.0.1 / 0.0.0.0

這三個名字對做 Next.js + Backend **非常重要**，也是雲端部署最常踩的坑。

### 4.1 127.0.0.1

IPv4 的 loopback。封包不會出這台電腦。

```text
curl http://127.0.0.1:3000
```

一定打到「我自己」。

### 4.2 localhost

通常是一個**名字**，解析到 127.0.0.1，有時也解析到 `::1`（IPv6 loopback）。

大多數時候 `localhost` ≈ `127.0.0.1`。偶爾會發生：

- 服務只聽 IPv4，你連到 `::1` → 連不上
- Cookie 的 Domain 對 `localhost` 有特殊規則

開發時連不上，試著把 `localhost` 改成 `127.0.0.1`（或相反）是合理的第一步。

### 4.3 0.0.0.0 —— 這不是「連去哪」，這是「聽哪裡」

`0.0.0.0` 出現在 **server bind** 時，意思是：

> 在所有 IPv4 網卡上聽這個 port。

```text
聽 127.0.0.1:3000     只有本機程序連得到
聽 0.0.0.0:3000       本機、區網、（若有公開 IP）外網都可能連得到
```

**Client 不會把網址列打成 `http://0.0.0.0:3000` 當正常用法。** 那不是一個有意義的目的地。Client 打的是 `127.0.0.1`、`localhost`、或機器的實際 IP。

### 4.4 為什麼雲端一定要聽 0.0.0.0

Render、Heroku、多數容器平台會把流量送到容器的某個 port（環境變數 `$PORT`）。如果你的 Node 寫成：

```js
app.listen(3000, "127.0.0.1")
```

只有容器內部的自己連得到，平台的 load balancer 連不進 → 部署健康檢查失敗。

正確（概念上）是：

```js
app.listen(process.env.PORT || 3000, "0.0.0.0")
```

Next.js 在這些平台上通常已預設綁對。你自己寫的 Express / Fastify / 本課的範例 server 必須自己記得。

```text
Client 連：   https://your-app.onrender.com   （公開主機名）
平台轉發到：  容器內 0.0.0.0:$PORT
應用聽：      0.0.0.0:$PORT
```

---

## 第五課：反向代理與轉發標頭

真實世界很少讓 Node 直接暴露在 443。常見形狀：

```text
Browser
   │  HTTPS :443
   ▼
Nginx / Caddy / 雲端 Load Balancer     ← 反向代理（reverse proxy）
   │  HTTP :3000  （內部）
   ▼
Next.js / Node
```

對你的應用來說，連進來的直接 peer 是代理，不是瀏覽器。於是出現三個你一定會碰到的 header：

### 5.1 Host

```http
Host: www.example.com
```

告訴應用「使用者以為自己在哪個站」。虛擬主機、產生絕對 URL、設定 Cookie Domain 都靠它。代理必須把原始 Host 傳進來（或設 `X-Forwarded-Host`）。

### 5.2 X-Forwarded-For

```http
X-Forwarded-For: 203.0.113.10, 10.0.0.1
```

左邊通常比較接近原始 client IP。應用若要做 rate limit、audit log，會讀這個而不是 `socket.remoteAddress`（那只是代理的 IP）。

**不可無條件信任。** 任何人都可以在直打你 server 時偽造 `X-Forwarded-For`。只有「最後一跳是你控制的代理、而且它會覆寫這個 header」時才可信。

### 5.3 X-Forwarded-Proto

```http
X-Forwarded-Proto: https
```

瀏覽器走 HTTPS 進代理，代理用 HTTP 轉進 Node。若應用不知道這件事，它會以為自己是 HTTP，進而：

- 產生 `http://` 的 redirect loop
- 設出沒有 `Secure` 的 Cookie
- 開錯 CORS origin

多數框架有 `trust proxy` 設定。本機開發沒有代理時不要亂開。

### 5.4 一張對照

| 你以為 | 應用實際看到（若沒設 trust proxy） |
|--------|-------------------------------------|
| Client IP = 使用者 | Peer IP = Nginx |
| Protocol = https | Protocol = http |
| Host = 公開域名 | 可能變成內部 hostname |

除錯「生產環境 Cookie 設不起來 / redirect 無限迴圈」時，先查這三個 header。

---

## 動手做（約 10 分鐘）

1. 拆這串 URL，寫下每一段（含預設 port 與 fragment 會不會送出）：

```text
https://api.example.com:443/users/123?active=true#profile
```

2. 查一個真實域名的 DNS（擇一即可）：

```bash
nslookup example.com
```

Windows 也可用 `nslookup`。看看有沒有 A 紀錄。

3. 想清楚下面三句各自在說什麼，用一句話寫下來：

```text
瀏覽器連 http://127.0.0.1:3000
瀏覽器連 http://localhost:3000
server 聽 0.0.0.0:3000
```

4. 若你有在跑任何本機 server，試：

```bash
curl -i http://127.0.0.1:3000
curl -i http://localhost:3000
```

兩者都通才表示 IPv4 / 名稱解析沒打架。

---

## 自我檢查

**Q1.** Origin 包含 path 嗎？  
**A1.** 不含。Origin = scheme + host + port。`/users` 與 `/orders` 只要前三段相同就是同 origin。

**Q2.** `#profile` 為什麼 API 收不到？  
**A2.** Fragment 由瀏覽器留下，不會放進 Request Line。

**Q3.** CNAME 與 A 差在哪？  
**A3.** A 直接給 IPv4；CNAME 指向另一個名字，還要再查下去。

**Q4.** 為什麼 Render 上聽 `127.0.0.1` 會掛？  
**A4.** 平台的負載平衡器從容器網路進來，不是從容器自己的 loopback 進來。必須聽 `0.0.0.0:$PORT`。

**Q5.** 能相信 request 上的 `X-Forwarded-For` 嗎？  
**A5.** 只有流量必定經過你控制、且會覆寫該 header 的代理時才行。否則任何人都能偽造。

---

下一模組：[第四模組：Browser 與 HTTP](../module_4_browser/)
