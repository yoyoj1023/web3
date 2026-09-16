# 第七模組：HTTP API Design (API Design)

## 模組目標
把前面的 HTTP 知識落到「我到底該怎麼設計 API」：資源路徑、分頁、過濾、錯誤形狀、版本、冪等，以及何時不要硬套 REST。

## 心智模型
API 是把業務物件變成 URL 上的資源。Method 表達動作，Status 表達結果，Body 表達內容。好的 API 讓呼叫端不用猜，也不用讀一份 40 頁的文件才能刪一筆資料。

```text
GET    /users          集合
GET    /users/123      單一資源
POST   /users          在集合裡新增
PATCH  /users/123      改一部分
DELETE /users/123      刪掉它
```

---

## 第一課：Resource-oriented API

把名詞當資源，把 HTTP method 當動詞。少把動詞塞進 path：

```text
較清楚                         較吵
GET  /users/123                GET  /getUser?id=123
DELETE /users/123              POST /deleteUser
PATCH /users/123               POST /updateUser
POST /users/123/orders         POST /createOrderForUser
```

後者能動，也叫 API，但你把 HTTP 已經給的語意丟了：快取不知道 GET 能不能 cache，閘道不知道 DELETE 的語意，文件變成長長一串 RPC 名稱。

### 1.1 集合與單一資源

```text
/users                 集合
/users/123             成員
/users/123/orders      子資源：這個 user 的訂單
/orders/abc            若訂單是一等公民，給它自己的 URL
```

ID 用穩定且不洩漏的值。連續整數 `/users/1` 方便探測；公開 API 常改用 UUID 或 ULID。內部後台不一定要這麼嚴。

### 1.2 成功時的 status 再對一次

| 動作 | 建議 |
|------|------|
| GET 集合 / 成員 | 200 + body |
| POST 建立 | 201 + `Location: /users/123` + body（或至少 id） |
| PATCH / PUT | 200 + 更新後資源，或 204 |
| DELETE | 204，或 200 帶回被刪內容 |
| 集合是空的 | 200 + `[]`，不要 404 |

對「沒有資料」回 404 會讓呼叫端分不清「路徑打錯」與「現在剛好沒資料」。

---

## 第二課：Pagination

集合不能一次倒出十萬筆。

### 2.1 Offset / page

```text
GET /users?page=2&limit=20
GET /users?offset=20&limit=20
```

實作簡單，SQL 人人會寫。缺點：

- 翻頁時若有人插入新資料，會重複或跳過
- 深分頁（`OFFSET 100000`）在資料庫很痛

適合：管理後台、資料變動不劇烈、頁數不深。

### 2.2 Cursor

```text
GET /users?limit=20
→ { "data": [...], "next_cursor": "eyJpZCI6IjEyMyJ9" }

GET /users?cursor=eyJpZCI6IjEyMyJ9&limit=20
```

Cursor 通常是「上一頁最後一筆的排序鍵」做過編碼。穩定、適合無限捲動與不斷寫入的時間軸。缺點是不能隨便跳到第 17 頁。

### 2.3 Response 裡把分頁資訊講清楚

```json
{
  "data": [ ... ],
  "pagination": {
    "limit": 20,
    "next_cursor": "abc123",
    "has_more": true
  }
}
```

不要讓前端用「這次少於 20 筆就當結束」這種隱性約定——除非你文件寫死，且永遠不改 limit。

---

## 第三課：Filtering / Sorting

```text
GET /users?status=active
GET /users?sort=-created_at
GET /users?status=active&role=admin&sort=-created_at&limit=20
```

慣例：

- Query 放可選條件（第一模組）
- 負號表示遞減：`sort=-created_at`
- 未知的 filter 要嘛忽略並文件化，要嘛 400。不要靜默做錯的事又不說
- 過濾欄位做白名單。`?sort=password_hash` 不該通

搜尋：

```text
GET /users?q=ada
```

複雜搜尋（多欄、全文、聚合）可以另開 `/users/search` 或甚至 POST（當 query 太長、不想進 log）。POST 做搜尋是合理例外，文件要寫「這支 POST 是查詢、無副作用」。

---

## 第四課：Error Design

Status 是第一層；Body 給可程式處理的細節。

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User does not exist"
  }
}
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body failed validation",
    "details": [
      { "field": "email", "issue": "invalid_format" }
    ]
  }
}
```

原則：

| 要 | 不要 |
|----|------|
| 穩定的 `code`（字串常數） | 只回 `"error": "something went wrong"` |
| `message` 給人讀 | 把 Postgres 的 stack 丟出去 |
| 驗證錯誤列欄位 | 400 與 422 混用且無文件 |
| 與 status 一致 | 200 + `{ "success": false }` |

`code` 是給 `switch` 用的，一旦發佈就當公開契約。`message` 可以改得更友善，不該當契約。

對照第二模組：401 清登入、403 顯示沒權限、404 + `USER_NOT_FOUND` 顯示找不到。前端不該靠解析英文句子來分支。

---

## 第五課：API Versioning

```text
/api/v1/users
/api/v2/users
```

或：

```http
Accept: application/vnd.example.v2+json
```

或乾脆不版號，做相容演進。

### 5.1 到底需不需要 `/v1`？

先問：**你會不會改到讓舊 client 壞掉？**

| 比較像破壞性 | 比較像相容 |
|--------------|------------|
| 刪欄位、改欄位型別 | 加新欄位 |
| 改 status 語意 | 加新 endpoint |
| 改認證方式 | 加可選 query |

很多內部 API 永遠只有一群 Next.js 呼叫端，一起部署，**不必**一開始就 `/v1`。公開 API、手機 App 無法強制升級時，才真正需要版本策略。

`/v1` 的代價是：你會懶得刪它，最後同時活著 v1 v2 v3。沒有客戶的版本是負債。

務實建議：

- 能加欄位就加，不要開新版
- 真的破壞時再 `/v2` 或 header 版本，並給日落期限
- 不要「預防性」先做 v1 v2 空殼

---

## 第六課：Idempotency

網路會斷。Client 會重試。問自己：**這筆 POST 被打兩次會怎樣？**

```text
POST /orders
{ "sku": "book", "qty": 1 }

第一次：成功，扣庫存、建立訂單
第二次（retry）：又一筆訂單   ← 使用者被扣兩次錢
```

PUT / DELETE 天生較能重試。POST 與「累加」型 PATCH 不行。

### 6.1 Idempotency-Key

付款與下單的常見協定：

```http
POST /payments
Idempotency-Key: 8f14e45f-ceea-467c-9d73-aa3798be5466
Content-Type: application/json

{"amount":1000,"currency":"TWD"}
```

Server 記住這個 key 對應的結果。同一把 key 再來：

- 進行中 → 等或 409
- 已完成 → **回同一份 response**，不再扣第二次
- 同一 key 但 body 不同 → 409

Key 由 client 生成（UUID）。重試必須帶同一把。這是應用層把 POST 變得可重試，不是 HTTP 幫你變的。

### 6.2 對照表

| Method | Retry 安全？ |
|--------|----------------|
| GET | 是 |
| PUT 整筆取代 | 是 |
| DELETE | 是（已刪再刪仍是 404/204） |
| PATCH 設值 | 通常是 |
| PATCH 加一 | 否 |
| POST 建立 | 否，除非 Idempotency-Key 或唯一約束擋重複 |

資料庫的 unique constraint（「同一個 `request_id` 只能一筆」）常常是冪等的最後一道防線。

---

## 第七課：何時不該硬套 REST

REST 很適合「資源有 CRUD」。世界不是只有 CRUD。

```text
POST /payments/123/refund
POST /users/123/disable
POST /auth/logout
POST /reports/export
```

這些是 **RPC 風格的 action**：一個明確的業務動作，副作用不是「把欄位設成某值」那麼單純。硬改成

```text
PATCH /payments/123  { "status": "refunded" }
```

可能藏起「退款」真正要做的事（呼叫金流、寫 ledger、發信），還讓人以為這只是改一個欄位。

實務上大多數後端是 **資源為主、動作為輔**：

```text
資源： /orders /users /invoices
動作： POST /orders/123/cancel
```

GraphQL、gRPC 也是合法選擇。它們仍可能跑在 HTTP 上（第一模組）。選風格的標準是：**呼叫端難不難猜、重試安不安全、文件能不能一頁講完。** 不是「夠不夠 REST」。

---

## 動手做（約 10 分鐘）

假設你要做「使用者可以對一篇文章留言」。寫下（先不要寫 code）：

1. 資源 URL：文章、留言各是什麼 path？
2. 列出清單、發新留言、刪自己的留言、管理員刪任何人的留言，各用什麼 method + path + 預期 status（含 401 / 403）。
3. 清單如何分頁？為什麼選 page 或 cursor？
4. 發留言 retry 會發生什麼？要不要 Idempotency-Key？
5. 錯誤 `code` 列三個你需要的常數。

參考答案（不是唯一）：

```text
GET    /posts/:postId/comments?cursor=&limit=20     200
POST   /posts/:postId/comments                      201 + Location
DELETE /comments/:id                                204
       未登入 401
       刪別人的 403（管理員例外）
cursor：留言會持續新增
POST 可加 Idempotency-Key，避免連點兩次變兩則
COMMENT_NOT_FOUND / VALIDATION_ERROR / FORBIDDEN
```

---

## 自我檢查

**Q1.** 空的使用者列表該 200 還是 404？  
**A1.** 200 加空陣列。404 留給「這個資源 URL 不存在」。

**Q2.** 為什麼深 offset 分頁會痛？  
**A2.** 資料庫仍要掃過被跳過的列；同時寫入會造成重複或漏資料。

**Q3.** 內部 Next.js 專用的 API 一定要 `/v1` 嗎？  
**A3.** 不必。前後端一起部署、能做相容演進時，預防性版本是負債。

**Q4.** 同一把 Idempotency-Key、不同 body，該怎樣？  
**A4.** 衝突，通常 409。不要默默執行第二份 body。

**Q5.** `POST /users/123/disable` 算設計失敗嗎？  
**A5.** 不算。這是清楚的業務動作。硬改成 PATCH 一個布林值，反而可能藏起真正副作用。

---

下一模組：[最終模組：實戰與除錯](../module_8_practice/)
