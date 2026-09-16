# 最終模組：實戰與除錯 (Hands-on Debugging)

## 模組目標
用 curl、DevTools、以及一個故意分層的迷你 API，把前面所有概念走一遍。同一支 `GET /users/:id`，從完全公開走到 Cookie、Bearer、物件層授權、再到 BFF 擋在前面。

## 心智模型
理論看懂不夠。你要親手看到：網站能用、匿名 curl 打不進 Backend，是架構選擇，不是魔法。

```text
Version A  公開
Version B  要 Cookie，否則 401
Version C  要 Bearer，否則 401
Version D  已驗證但讀別人 → 403
Version E  只有 BFF 帶得到內部 header；瀏覽器 / 匿名 curl 打不進「Backend」
```

範例程式在 [`examples/insecure-api`](../examples/insecure-api/)。本模組假設你已在該目錄執行 `npm start`，預設 `http://127.0.0.1:3783`。

---

## 第一課：curl

curl 是把 HTTP 攤在桌上的放大鏡。沒有管家、沒有自動 Cookie、沒有 CORS。

### 1.1 看 status 與 header

```bash
curl -i http://127.0.0.1:3783/health
```

`-i` 把 response header 印在 body 前面。先確認 server 活著，應為 200。

### 1.2 看整段對話

```bash
curl -v http://127.0.0.1:3783/health
```

`-v` 包含 DNS / TCP、送出的 request header、收到的 response。對照第零模組那條鏈：你現在看到的就是 HTTP 層。本機沒有 TLS，所以沒有握手那段。

### 1.3 換 method、加 header、加 body

```bash
curl -i -X POST http://127.0.0.1:3783/health \
  -H "Content-Type: application/json" \
  -d "{\"ping\":\"pong\"}"
```

這支範例的 `/health` 只實作 GET，POST 應為 **405**。這是在驗第二模組。

### 1.4 Cookie 與 Authorization

```bash
curl -i http://127.0.0.1:3783/b/users/ada \
  -H "Cookie: session=ada-session"

curl -i http://127.0.0.1:3783/c/users/ada \
  -H "Authorization: Bearer ada-token"
```

存檔與帶出 Cookie（像極了瀏覽器，但你自己控制）：

```bash
curl -i -c cookies.txt -b cookies.txt http://127.0.0.1:3783/b/users/ada
```

`-c` 寫入（若有 `Set-Cookie`），`-b` 讀取。這支範例的 B 版本不靠 `Set-Cookie` 登入流程，而是直接要求你帶對的 session 字串——刻意保持最小，好讓你看清「Cookie 只是一段文字」。

常用旗標速查：

| 旗標 | 作用 |
|------|------|
| `-i` | 印 response headers |
| `-v` | verbose |
| `-X POST` | method |
| `-H "Name: value"` | header |
| `-d` | body（預設 POST） |
| `-b` / `-c` | 讀 / 寫 cookie jar |
| `-L` | 跟隨 redirect |
| `-o file` | body 寫入檔案 |

Windows PowerShell 對引號較敏感。若失敗，改用：

```powershell
curl.exe -i http://127.0.0.1:3783/health
```

明確呼叫 `curl.exe`，避免被 PowerShell 的 `Invoke-WebRequest` 別名吃掉。

---

## 第二課：Browser DevTools 對照 Next.js

拿一個真實 Next.js app（你自己的即可，沒有也沒關係，用本範例的說明想一遍）：

```text
Browser
   ↓  同源：相對路徑 /api/...
Next.js   （對瀏覽器是 server；對 Backend 是 client）
   ↓  server-to-server，沒有 SOP / CORS
Backend
```

三條常見路徑：

| 路徑 | 瀏覽器看不看得到 | CORS | Cookie 自動帶去 Backend？ |
|------|------------------|------|---------------------------|
| 瀏覽器 `fetch('https://api.example.com/...')` | 看得到 | 要 | 跨站通常不帶（SameSite），且要 CORS credentials |
| 瀏覽器 `fetch('/api/...')` 打 Next.js Route Handler | 看得到，同源 | 不用 | 會帶給 Next.js |
| Next.js server component / Route Handler 再 `fetch` Backend | **看不到** | 不適用 | 不會自動帶；由你的 server 決定帶什麼 |

這就是 BFF（Backend for Frontend）：瀏覽器只信任網站；網站 server 再用內部認證打 Backend。Version E 用一個極小的 `/bff` 模擬第二段。

### 2.1 建議你在 DevTools 做的事

1. Network → Fetch/XHR
2. 看 Request URL 是指向自己的 origin 還是 `api.` 子網域
3. 有沒有 `Cookie`、有沒有 `Authorization`
4. Response 有沒有 `Access-Control-Allow-Origin`
5. 失敗時先看 status：`(failed)` 很常是 CORS 或混合內容，不是 JSON parse error

---

## 第三課：Postman / Bruno / HTTPie

GUI 工具與 curl **送出的是同一種 HTTP**。差別是：

- 可以存 collection、環境變數、pretty-print JSON
- 仍然沒有瀏覽器管家（除非外掛刻意模擬）
- 仍然要你自己放 Cookie 或 Bearer

```bash
http GET :3783/a/users/ada
http GET :3783/c/users/ada Authorization:"Bearer ada-token"
```

（HTTPie 語法。）能用 GUI 很好；除錯卡關時回到 `curl -v`，輸出可以貼給同事，沒有「我環境裡那個粉色按鈕」。

> Browser request 跟 curl request 本質上有什麼不同？

第四模組的答案在這裡要變成肌肉記憶：協議相同，client 預設行為不同。

---

## 第四課：實戰——五個版本「攻破」同一支 API

先啟動：

```bash
cd examples/insecure-api
npm start
```

內建兩個使用者：

| id | Cookie | Bearer |
|----|--------|--------|
| `ada` | `session=ada-session` | `Authorization: Bearer ada-token` |
| `bob` | `session=bob-session` | `Authorization: Bearer bob-token` |

### Version A — 完全公開

```bash
curl.exe -i http://127.0.0.1:3783/a/users/ada
curl.exe -i http://127.0.0.1:3783/a/users/bob
```

兩筆都 **200**。匿名也能讀 email。這不是「方便的開發模式」，這是資料外洩。任何爬蟲、任何 `curl` 都能把使用者抄走。

### Version B — 需要 Cookie

```bash
curl.exe -i http://127.0.0.1:3783/b/users/ada
```

沒有 Cookie → **401**。

```bash
curl.exe -i http://127.0.0.1:3783/b/users/ada -H "Cookie: session=ada-session"
```

→ **200**。注意：帶了 Ada 的 session 去讀 `/b/users/bob` 在這個版本仍是 200。B 只做 Authentication（你是誰），沒做 Authorization（你能不能看這筆）。很多人停在這裡，以為「有登入就安全」。

### Version C — 需要 Authorization Header

```bash
curl.exe -i http://127.0.0.1:3783/c/users/ada
```

→ **401**。

```bash
curl.exe -i http://127.0.0.1:3783/c/users/ada -H "Authorization: Bearer ada-token"
```

→ **200**。

Cookie 與 Bearer 都是「每筆 request 附上的主張」。瀏覽器會自動帶 Cookie；Bearer 通常要你的 JS 自己放進 header。C 一樣還沒做物件層授權。

### Version D — 認證之後還有授權

```bash
curl.exe -i http://127.0.0.1:3783/d/users/ada -H "Authorization: Bearer ada-token"
```

→ **200**。Ada 讀自己。

```bash
curl.exe -i http://127.0.0.1:3783/d/users/bob -H "Authorization: Bearer ada-token"
```

→ **403**。系統知道你是 Ada，但不准讀 Bob。

```bash
curl.exe -i http://127.0.0.1:3783/d/users/bob
```

→ **401**。連誰都不知道。

把第二模組的表在終端機印出來。這是本課的驗收關卡。

### Version E — BFF 擋在前面

「Backend」只接受內部 header：

```bash
curl.exe -i http://127.0.0.1:3783/e/users/ada
```

→ **401**。匿名 curl 打不進。

```bash
curl.exe -i http://127.0.0.1:3783/e/users/ada -H "X-Internal-Auth: bff-secret"
```

→ **200**。這模擬「只有 Next.js server 知道的密鑰」。瀏覽器 JS 不該擁有這把鑰匙；一放進前端 bundle 就等於 Version A。

網站入口（BFF）會幫你加上內部 header，並做物件層檢查：

```bash
curl.exe -i http://127.0.0.1:3783/bff/users/ada -H "Cookie: session=ada-session"
```

→ **200**。像瀏覽器打自己的同源 `/api`。

```bash
curl.exe -i http://127.0.0.1:3783/bff/users/bob -H "Cookie: session=ada-session"
```

→ **403**。

```bash
curl.exe -i http://127.0.0.1:3783/bff/users/ada
```

→ **401**。

現在對照：

```text
Browser  ──Cookie──►  Next.js BFF  ──X-Internal-Auth──►  Backend
curl 直打 Backend：沒有那把內部鑰匙 → 401
curl 打 BFF 但不帶 Cookie → 401
curl 偷到內部鑰匙直打 Backend → 仍能進（所以密鑰不能進前端、Backend 不能暴露在公網）
```

> 為什麼 Browser 可以用網站，但匿名 curl 不能直接打 Backend？

因為你把它設計成這樣：公開面只暴露 BFF；BFF 檢查 Cookie；Backend 再檢查內部認證。不是 CORS 幫你擋 curl。把 Backend 端口對全世界打開，E 立刻塌成「知道 header 名字的人都能進」。生產環境還要加上網路隔離（只允許 BFF 的網段），那已超出本課，但方向就是這一張圖。

---

## 動手做（約 20 分鐘）

照第四課 A→E 每一個 curl 都打一遍，把 status 填進這張表：

| 請求 | 預期 |
|------|------|
| `GET /a/users/ada` 無認證 | 200 |
| `GET /b/users/ada` 無 Cookie | 401 |
| `GET /b/users/ada` 有 Ada Cookie | 200 |
| `GET /b/users/bob` 有 Ada Cookie | 200（只有認證） |
| `GET /c/users/ada` 無 Bearer | 401 |
| `GET /d/users/bob` Ada 的 Bearer | 403 |
| `GET /d/users/bob` 無認證 | 401 |
| `GET /e/users/ada` 無內部 header | 401 |
| `GET /bff/users/ada` Ada Cookie | 200 |
| `GET /bff/users/bob` Ada Cookie | 403 |

全部符合，本課的 HTTP 心智模型就算閉環。

加分：用瀏覽器打開 `http://127.0.0.1:3783/a/users/ada`（A 會直接顯示 JSON）。再開 DevTools 看一筆。試著從 `file://` 或另一個 origin 用 `fetch` 打 `/a/users/ada`，觀察 CORS 是否擋 JS——範例預設對 A 回了 `Access-Control-Allow-Origin: *`，curl 與瀏覽器都讀得到；E 沒有對瀏覽器開放，這是刻意的。

---

## 自我檢查

**Q1.** PowerShell 裡 `curl` 可能不是 curl，怎麼辦？  
**A1.** 用 `curl.exe`。

**Q2.** Version B 帶 Ada 的 Cookie 讀 Bob 回 200，算不算授權成功？  
**A2.** 不算。那只證明「有人登入」。授權是 Version D 的 403。

**Q3.** 把 `bff-secret` 寫進前端 JS 會怎樣？  
**A3.** 任何人打開 DevTools 就能直打 `/e`，BFF 形同虛設。

**Q4.** Postman 成功、瀏覽器失敗，先查什麼？  
**A4.** CORS、Cookie / SameSite、是否打了不同 origin、混合內容。不是先懷疑 JSON schema。

**Q5.** 這門課為什麼不在這裡實作 JWT 簽發？  
**A5.** 你已經有「每筆 request 如何攜帶身份、401 與 403 如何分」。簽章、refresh、OAuth 是 184 / 185 的主題，避免在還沒站穩 HTTP 時被套件細節淹沒。

---

## 你現在應該能做到的事

看到：

```http
GET /api/orders/123 HTTP/1.1
Host: api.example.com
Cookie: session=abc
Authorization: Bearer xxx
Origin: https://www.example.com
Accept: application/json
```

立刻拆成：誰在發、連去哪、什麼協議、哪個資源、帶了什麼身份、有沒有 CORS、server 該如何驗證、可能回什麼 status、能不能 cache。

這就是本課程開頭承諾的驗收標準。下一門從「你是誰／你可以做什麼」繼續：[184 Authentication / Authorization](../../184-authentication-authorization/)。
