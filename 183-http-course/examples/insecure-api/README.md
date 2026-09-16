# insecure-api

183 HTTP 課程第八模組的迷你實驗室。單一 Node.js server，同一支「讀使用者」API 分成 A–E 與一層 BFF。

這不是生產程式。Session 與 token 是寫死的字串，目的是讓你用 curl 看清楚 **401 / 403 / 公開資料 / 內部 header**。

## 啟動

需要 Node.js 18+。

```bash
cd examples/insecure-api
npm start
```

預設聽 `0.0.0.0:3783`（本機請打 `http://127.0.0.1:3783`）。可用 `PORT`、`HOST`、`INTERNAL_SECRET` 覆蓋。

## 內建使用者

| id | Cookie | Bearer |
|----|--------|--------|
| `ada` | `session=ada-session` | `Authorization: Bearer ada-token` |
| `bob` | `session=bob-session` | `Authorization: Bearer bob-token` |

內部鑰匙（Version E）：`X-Internal-Auth: bff-secret`

## 路徑

| 路徑 | 行為 |
|------|------|
| `GET /health` | 存活檢查 |
| `GET /a/users/:id` | 完全公開；CORS `*` |
| `GET /b/users/:id` | 需要 Cookie；不做物件層授權 |
| `GET /c/users/:id` | 需要 Bearer；不做物件層授權 |
| `GET /d/users/:id` | Bearer + 只能讀自己（否則 403） |
| `GET /e/users/:id` | 需要內部 header（模擬 Backend） |
| `GET /bff/users/:id` | Cookie + 物件層授權（模擬 Next.js BFF） |

完整 curl 對照表見 [第八模組](../../module_8_practice/)。Windows 請用 `curl.exe`。

```bash
curl.exe -i http://127.0.0.1:3783/health
curl.exe -i http://127.0.0.1:3783/a/users/ada
curl.exe -i http://127.0.0.1:3783/b/users/ada
curl.exe -i http://127.0.0.1:3783/b/users/ada -H "Cookie: session=ada-session"
curl.exe -i http://127.0.0.1:3783/d/users/bob -H "Authorization: Bearer ada-token"
curl.exe -i http://127.0.0.1:3783/e/users/ada
curl.exe -i http://127.0.0.1:3783/bff/users/ada -H "Cookie: session=ada-session"
```
