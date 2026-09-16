# 第二模組：讀懂 HTTP Response (The Response)

## 模組目標
看到 response 就知道 server 在告訴你什麼：先讀 status，再讀 header，最後才是 body。特別要把 401 與 403 拆開。

## 心智模型
Status code 是第一句話（成了、轉址、你錯了、我掛了），Header 是附註，Body 才是內容。很多人只看 Body 裡的 JSON，所以永遠除不了 401 / 403 / CORS 的錯——那些訊息常常根本不在 Body 裡，或 Body 只是重複 status 已經說過的話。

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /users/123
Cache-Control: no-store

{"id":"123","name":"John"}
```

---

## 第一課：Status Code 家族

第一行是 Status Line：

```http
HTTP/1.1 404 Not Found
```

```text
HTTP/1.1     版本
404          三位數字，真正有協定意義的是它
Not Found    理由片語，可讀性用，client 不該依賴這段文字
```

家族：

```text
1xx   資訊性，進行中（你幾乎不會在 API 裡親手回）
2xx   成功
3xx   轉址或「用 cache 就好」
4xx   你（client）的問題
5xx   我（server）的問題
```

記家族比記 80 個碼有用。除錯時先問：**這是 2、3、4 還是 5？**

### 1.1 你必須精熟的碼

**2xx 成功**

| Code | 意思 | 典型場景 |
|------|------|----------|
| 200 OK | 成功，通常有 body | GET 成功、PUT/PATCH 成功並回資源 |
| 201 Created | 新資源誕生 | POST 新增；常搭配 `Location` |
| 204 No Content | 成功，沒有 body | DELETE 成功、PATCH 不想回內容 |

**3xx 轉址 / cache**

| Code | 意思 | 典型場景 |
|------|------|----------|
| 301 Moved Permanently | 永遠搬了 | SEO、舊 URL |
| 302 Found | 暫時去那裡 | 登入後跳轉（實務很常見） |
| 304 Not Modified | 你 cache 的那份還能用 | 搭配 ETag / Last-Modified |

**4xx client 錯了**

| Code | 意思 | 典型場景 |
|------|------|----------|
| 400 Bad Request | 這筆 request 我解不了 | JSON 壞掉、缺欄位（有人改用 422） |
| **401 Unauthorized** | 你還沒通過認證 | 沒登入、token 過期。名字很糟，想成 Unauthenticated |
| **403 Forbidden** | 我知道你是誰，不准 | 已登入但讀別人的資料 |
| 404 Not Found | 沒這個資源 | 也用來故意隱藏「存在但你不能知道」 |
| 405 Method Not Allowed | 資源在，method 不對 | GET 一個只准 POST 的 endpoint |
| 409 Conflict | 跟目前狀態打架 | 重複建立、樂觀鎖衝突 |
| 422 Unprocessable Entity | 語法對，語意過不了 | 驗證錯誤：email 格式錯 |
| 429 Too Many Requests | 你打太快 | Rate limit |

**5xx server 錯了**

| Code | 意思 | 典型場景 |
|------|------|----------|
| 500 Internal Server Error | 未處理的爆炸 | 沒 catch 的 exception |
| 502 Bad Gateway | 我前面的代理，後面那台回了垃圾 | Nginx 後面的 Node 掛了或回了無效回應 |
| 503 Service Unavailable | 暫時不能服務 | 維護、過載 |
| 504 Gateway Timeout | 後面那台太慢 | 代理等 backend 逾時 |

### 1.2 4xx 與 5xx 的責任分界

```text
4xx  →  換一個正確的 request，通常就能好
5xx  →  client 再怎麼改 JSON 也救不了，去看 server / 代理 / 資料庫
```

前端看到 500 卻去改自己的 `Content-Type`，是在浪費時間。先看 status 家族。

---

## 第二課：401 vs 403（一定要搞懂）

這是本課最重要的一對 status。

```text
401  認證失敗：系統還不知道你是誰（或你主張的身份無效）
403  授權失敗：系統知道你是誰，但這個動作你不能做
```

英文很坑：`Unauthorized` 聽起來像「沒權限」，協定裡它卻是「請先證明你是誰」。對應 WWW-Authenticate 的語意是「請出示證件」。

### 2.1 對照表

| 情境 | Status | 原因 |
|------|--------|------|
| 沒帶 Cookie、沒帶 Bearer | 401 | 匿名 |
| Token 過期、簽章錯誤 | 401 | 證件無效 |
| 已登入，GET `/admin` 但你是一般 user | 403 | 角色不夠 |
| 已登入，GET `/users/B` 但你是 A | 403 | 物件層權限 |
| 資源根本不存在 | 404 | 有時對別人的私有資源也回 404，避免探測 |

### 2.2 為什麼不能混用

```text
前端常見邏輯：
  401 → 跳登入頁、清 session、refresh token
  403 → 顯示「你沒有權限」、不要把人登出
```

如果你把「沒權限」回 401，使用者會被反覆踢去登入頁，但其實他登入得好好的。第八模組的 Version B/C/D 會讓你親手打出這兩個碼。

認證與授權的完整模型留給 184。這裡只要求：**看到碼就能判斷是「沒證件」還是「證件不夠力」。**

---

## 第三課：Response Headers

Response header 告訴 client **除了 body 以外還該做什麼**。

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 128
Location: /users/123
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax
Cache-Control: max-age=3600
ETag: "v2"
Last-Modified: Wed, 16 Sep 2026 07:00:00 GMT
Access-Control-Allow-Origin: https://www.example.com
```

| Header | 角色 |
|--------|------|
| `Content-Type` | Body 該被當成 JSON、HTML 還是檔案 |
| `Content-Length` | Body 長度（或改用 chunked，沒有這個） |
| `Location` | 201 時新資源的 URL；3xx 時要去哪裡 |
| `Set-Cookie` | 請瀏覽器把這張紙條存下來，之後自動帶回去 |
| `Cache-Control` / `ETag` / `Last-Modified` | 能不能、如何重複使用這份 response |
| `Access-Control-Allow-*` | 瀏覽器是否允許前端 JS 讀這筆跨來源 response |

注意：

- `Set-Cookie` 是 **response** 才有；下一次 request 瀏覽器改帶 `Cookie`。這對不對稱很重要，第四模組展開。
- CORS 相關 header 只對瀏覽器有約束力。curl 看了也會印出來，但不會被擋住。第四模組會把這點打穿。

---

## 第四課：Response Body

`Content-Type` 決定 body 的語言。API 幾乎都是：

```http
Content-Type: application/json
```

```json
{
  "data": { "id": "123", "name": "John" },
  "error": null
}
```

出錯時不要只回一句純文字 `"not found"`。給呼叫端可程式處理的形狀（第七模組會定規範）：

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User does not exist"
  }
}
```

幾個立刻能用的原則：

- **Status 表達機器可讀的結果，Body 表達細節。** 不要 200 OK 再在 JSON 裡寫 `"success": false`。
- **204 就不要再塞 body。** 有些代理與 client 會亂掉。
- **錯誤訊息給開發者看可以具體，給終端使用者看不要洩漏堆疊。** `relation "users" does not exist` 不該直接出到瀏覽器。

成功與失敗都要穩定。呼叫端應該能寫：

```text
if status == 401 → 去登入
if status == 403 → 顯示沒權限
if status == 404 && code == USER_NOT_FOUND → 顯示找不到
if status >= 500 → 顯示系統忙碌，可重試
```

---

## 動手做（約 8 分鐘）

```bash
curl -i https://example.com

curl -i -o NUL -w "status=%{http_code}\n" https://example.com/this-path-should-404
```

（macOS / Linux 把 `NUL` 改成 `/dev/null`。）

觀察：

1. 成功頁是 200 還是 301/302？很多站首頁會先轉址到 `www` 或 HTTPS。
2. 不存在的 path 是 404 還是 200 加一個 HTML 錯誤頁？（後者是網站，不是好的 API。）
3. Response 有沒有 `cache-control`、`content-type`、`set-cookie`？

再讀一次自己抄下來的 status line，大聲說出家族：2、3、4 還是 5。

---

## 自我檢查

**Q1.** 為什麼說 401 的英文名字很糟？  
**A1.** `Unauthorized` 像沒權限，協定裡卻是「未認證」。沒權限該是 403。

**Q2.** POST 新增成功，較合適的 status 是？  
**A2.** 201 Created，常搭配 `Location` 指向新資源。用 200 也能動，但 201 語意更準。

**Q3.** 前端收到 502 該改 request body 嗎？  
**A3.** 不該。502 是閘道後面的 server 有問題。先查代理與 upstream。

**Q4.** `Set-Cookie` 出現在 request 還是 response？  
**A4.** Response。之後的 request 帶的是 `Cookie`。

**Q5.** API 回 200，JSON 裡卻是 `{ "success": false }`，有什麼問題？  
**A5.** 把真正的結果藏進 body，快取、閘道、監控、client 的第一層邏輯全部失效。失敗就該用 4xx / 5xx。

---

下一模組：[第三模組：URL、Domain、DNS、Port](../module_3_url_dns_port/)
