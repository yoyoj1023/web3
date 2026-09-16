# 第一模組：拆解 HTTP Request (The Request)

## 模組目標
看到任何 request 都能拆成 Method、Path、Query、Header、Body，並判斷身份資訊放在哪、能不能相信它。

## 心智模型
一筆 request 像一封掛號信：信封上寫寄去哪、用什麼方式處理（Method）、附件是什麼（Body）、身份證件夾在哪（Header）。Server 只看這封信，看不到你是誰坐在螢幕前。所以 Header 裡的 `Authorization` 可以被偽造，Cookie 也可以被偷走後重放——這不是「HTTP 的 bug」，這是「信上寫什麼，櫃檯就讀什麼」。

```http
GET /users/123?foo=bar HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer xxx

```

上面沒有 Body。下面這筆有：

```http
POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 20

{"name":"John"}
```

---

## 第一課：Request Line

第一行叫做 Request Line：

```http
GET /users/123?foo=bar HTTP/1.1
```

拆成四塊：

```text
GET                 Method      我要你怎麼處理
/users/123          Path        哪個資源
?foo=bar            Query       附加條件（可省略）
HTTP/1.1            Version     用哪套 HTTP 方言
```

完整 URL 是 client 腦中的事。真正送到 server 的常常是：

```text
Method  +  Path  +  Query
Host header 裡才有域名
```

HTTP/2 在網路上用的是偽標頭（`:method`、`:path`、`:authority`），DevTools 仍會顯示成你熟悉的樣子。設計 API 時當它是同一套即可。

### 1.1 Path 與 Query 的差別

```text
/users/123              這是「哪一個」user —— 識別身份
/users?role=admin       這是「哪些」user —— 過濾條件
/users/123?foo=bar      兩者可以同時存在
```

第三模組會再講 fragment（`#profile`）：**fragment 不會送到 server**。

---

## 第二課：HTTP Methods

常見 method：

```text
GET      讀
POST     送一份要被處理的資料（常常是新增，但不等於新增）
PUT      用這份資料整筆取代目標資源
PATCH    只改一部分
DELETE   刪
HEAD     跟 GET 一樣，但不要 Body（探路、查 cache）
OPTIONS  問 server「這個資源允許什麼」—— CORS preflight 就是它
```

不要只背「GET = 查詢、POST = 新增」。真正要內化的是三個性質：

### 2.1 Safe（安全）

Safe method **不應該造成 server 端的狀態改變**。

- GET、HEAD、OPTIONS 應該是 safe
- 用 GET `/users/123/delete` 刪資料是違反語意，也會被爬蟲、預抓取、cache 搞出慘案

Safe 不是「這支 API 沒有資安問題」。它是「重複呼叫不應該改世界」。

### 2.2 Idempotent（冪等）

Idempotent：**連打 N 次，效果等於打 1 次。**

| Method | Idempotent? | 為什麼 |
|--------|-------------|--------|
| GET | 是 | 只讀 |
| PUT | 是 | 「變成這份資料」，做一次與做十次同一狀態 |
| DELETE | 是 | 「讓它不存在」，已經沒了再刪仍是沒了 |
| POST | **否** | 每打一次可能再新增一筆 |
| PATCH | 看設計 | 「設為 5」是；「加 1」不是 |

這對付款、下單極重要。網路會斷、client 會 retry。第七模組會講 `Idempotency-Key`。

### 2.3 Cacheable（可快取）

預設上 GET / HEAD 的成功 response 比較容易被 cache。POST 幾乎不該被當 GET 來 cache。第六模組會把 Cache-Control 講清楚。

### 2.4 常見誤解

```text
誤解：POST 只能新增
事實：RPC 風格的 POST /logout、POST /payments/123/refund 到處都是

誤解：PUT 與 PATCH 誰比較 RESTful 誰就比較正確
事實：重點是語意清楚、文件寫明、retry 行為可預期

誤解：瀏覽器網址列只能 GET
事實：網址列與 <a href> 的確是 GET；<form method="POST"> 與 fetch 可以 POST
```

---

## 第三課：Headers

Header 是「這封信的附註欄」，`Name: value` 一行一個。

Request 常見：

```http
Host: api.example.com
Accept: application/json
Content-Type: application/json
Authorization: Bearer xxx
Cookie: session=abc123
User-Agent: Mozilla/5.0 ...
Origin: https://www.example.com
Referer: https://www.example.com/settings
Cache-Control: no-cache
```

### 3.1 Header 的角色

| Header | 角色 |
|--------|------|
| `Host` | 我要找哪一個虛擬主機（同一 IP 可能有很多站） |
| `Accept` | 我希望你回什麼格式 |
| `Content-Type` | 我這筆 Body 是什麼格式 |
| `Authorization` | 我主張自己是誰（常見 Bearer token） |
| `Cookie` | 瀏覽器自動附上的小紙條 |
| `Origin` / `Referer` | 這個請求從哪個頁面／來源來（瀏覽器會設） |
| `User-Agent` | 我是哪種 client |

`Accept` 是「我想要什麼」；`Content-Type` 是「我帶來的是什麼」。兩者常常被搞混。

### 3.2 哪些是 client 提供的？哪些可以偽造？

**全部 request header 都是 client 提供的。** Server 收到的每一個字，預設都不可信。

```text
可以偽造：Authorization、Cookie、X-User-Id、X-Forwarded-For、User-Agent
瀏覽器會自動帶、但惡意 client 仍可偽造：Origin、Referer、Cookie
server 比較能信的：它自己驗證過的結果（session store 查到的 user、驗過簽章的 token）
```

這會直接連到 API security：

```http
GET /admin/users HTTP/1.1
X-User-Id: 1
X-Role: admin
```

這種 API 等於沒有門。任何人用 curl 改兩個 header 就進後台。正確做法是 server **自己**從 session / token 得出身份，而不是相信 client 自稱。

Cookie 與 CORS 的細節在第四模組；Authentication 的完整模型在 184。這裡先建立反射：**Header 是主張，不是證明。**

### 3.3  hop-by-hop 與你暫時不必管的

`Connection`、`Keep-Alive`、`Transfer-Encoding` 屬於連線如何運送，反向代理可能會改它們。設計 JSON API 時很少直接碰。知道「有些 header 是給代理看的、有些是給應用看的」即可。

---

## 第四課：Request Body

Body 是附件。不是每筆 request 都有：GET、HEAD 通常沒有（規格沒完全禁止，但實務上不要給 GET 加 Body）。

### 4.1 JSON

```http
POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "name": "John"
}
```

現代 API 的預設。沒有 `Content-Type: application/json` 時，有的 server 會拒、有的會猜，不要靠猜。

### 4.2 form-urlencoded

```http
POST /login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

email=ada%40example.com&password=secret
```

HTML `<form>` 的傳統格式。Next.js 的 Server Actions 與很多登入表單仍會看到。

### 4.3 multipart/form-data

檔案上傳幾乎都是它：一段文字欄位、一段檔案，用 boundary 切開。

```http
POST /avatars HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4

------WebKitFormBoundary7MA4
Content-Disposition: form-data; name="userId"

123
------WebKitFormBoundary7MA4
Content-Disposition: form-data; name="file"; filename="a.png"
Content-Type: image/png

<binary>
------WebKitFormBoundary7MA4--
```

不要把 PNG 先轉成巨大的 base64 JSON，除非有明確理由。

### 4.4 binary

```http
PUT /files/report.pdf HTTP/1.1
Content-Type: application/pdf
Content-Length: 48210

<raw bytes>
```

直接傳位元組。`Content-Type` 告訴對方怎麼解釋這些 bytes。

---

## 第五課：Path / Query / Body 該放什麼

三種都能表達「id = 123」，語意不同：

```text
GET  /users/123
GET  /users?id=123
POST /users
     { "id": 123 }
```

經驗法則：

| 放哪 | 適合 | 不適合 |
|------|------|--------|
| Path | 資源的身份，`/users/123`、`/users/123/orders` | 可選過濾條件、複雜搜尋 |
| Query | 過濾、排序、分頁、可選開關 | 機密（會進 log、Referer、瀏覽紀錄） |
| Body | 要寫入的內容、複雜 JSON、檔案 | GET 的查詢條件（cache 與中介軟體會忽略） |

密碼、token **不要**放 query。URL 會被記在 access log、瀏覽器歷史、Referer。

巢狀資源：

```text
GET /users/123/orders          這個 user 的訂單
GET /orders?userId=123         也可以，若訂單是一等公民
```

沒有唯一宗教。一致性比「誰比較 REST」重要。第七模組會把這套做成 API 設計原則。

---

## 動手做（約 10 分鐘）

對任何你熟悉的網站（或本課稍後的範例）發三筆，觀察差別：

```bash
curl -i https://example.com

curl -i -X POST https://example.com \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John\"}"

curl -i -X OPTIONS https://example.com
```

再故意偽造身份：

```bash
curl -i https://example.com \
  -H "Authorization: Bearer totally-fake" \
  -H "X-User-Id: 1"
```

Server 可能忽略這些 header（example.com 不吃它們）。重點是：**它們毫無阻攔地送出去了。** 信任必須發生在 server 驗證之後。

---

## 自我檢查

**Q1.** Request Line 裡有域名嗎？  
**A1.** 通常沒有。域名在 `Host` header（HTTP/2 則是 `:authority`）。Request Line 主要是 Method + Path + Query + Version。

**Q2.** 為什麼用 GET 做刪除很危險？  
**A2.** GET 是 safe，可能被爬蟲、預抓取、cache、瀏覽器預載觸發。副作用不該放在 GET。

**Q3.** POST 一定不是冪等嗎？  
**A3.** 預設語意不是。你可以在應用層用 Idempotency-Key 讓「同一個 POST」重試安全，那是額外約定，不是 POST 天生的性質。

**Q4.** Client 送來的 `X-Role: admin` 能當權限依據嗎？  
**A4.** 不能。Header 是主張。身份必須由 server 驗證 session / token 後自己得出。

**Q5.** 搜尋關鍵字該放 path、query 還是 body？  
**A5.** 通常放 query（`/users?q=ada`）。它是過濾條件，而且 GET 可被 bookmark、refresh。機密與巨大 JSON 不要放 query。

---

下一模組：[第二模組：讀懂 HTTP Response](../module_2_response/)
