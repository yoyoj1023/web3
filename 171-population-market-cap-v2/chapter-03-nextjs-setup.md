# 第三章：專案初始化與環境配置

## 學習目標
在這一章中，你將學會：
- 使用 `create-next-app` 建立 Next.js 14 專案
- 理解 App Router 的專案結構
- 安全地管理環境變數（`.env.local`）
- 配置 `.gitignore` 防止敏感資訊洩漏

---

## 3.1 初始化 Next.js 專案

### 為什麼選擇 Next.js 14？

Next.js 14 引入了革命性的 **App Router**，相比舊版的 Pages Router 有以下優勢：

| 特性 | Pages Router（舊） | App Router（新） |
|------|-------------------|------------------|
| **Server Component** | ❌ 不支援 | ✅ 預設即為 Server Component |
| **資料獲取** | `getServerSideProps` | 直接在 Component 中 `async/await` |
| **Layout** | 需手動建立 `_app.js` | 內建 Layout 系統 |
| **Loading 狀態** | 需自行處理 | 內建 `loading.tsx` |
| **錯誤處理** | 需自行處理 | 內建 `error.tsx` |

### 步驟 1：開啟終端機

根據你的作業系統：
- **Windows**：PowerShell 或 CMD
- **macOS/Linux**：Terminal

切換到你想建立專案的目錄，例如：
```bash
cd C:\VScode\web3
```

### 步驟 2：執行建立指令

> ⚠️ **重要**：我們要明確指定 Next.js 14 版本，避免使用到更新的版本導致教學不一致。

```bash
npx create-next-app@14 tw-birth-tracker
```

### 步驟 3：選擇配置選項

系統會詢問一系列問題，請按照以下方式選擇：

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias (@/*)? … No
```

#### 選項解析

1. **TypeScript**：選 `Yes`
   - 提供型別檢查，減少執行時期錯誤
   - 現代 JavaScript 專案的標準配備
   
2. **ESLint**：選 `Yes`
   - 自動檢查程式碼品質和潛在問題
   - Next.js 內建規則集，省去設定時間

3. **Tailwind CSS**：選 `Yes`
   - Utility-first CSS 框架，快速建立美觀 UI
   - 不需要寫傳統 CSS 檔案

4. **src/ directory**：選 `No`
   - 使用 App Router 時，`app/` 目錄已經很清晰
   - 保持專案結構簡潔

5. **App Router**：選 `Yes`（最重要！）
   - 使用最新的 Next.js 架構
   - 支援 Server Components

6. **Import alias**：選 `No`
   - 預設的 `@/*` 已經很好用
   - 例如：`import Button from '@/components/Button'`

### 步驟 4：等待安裝完成

安裝過程大約 2-3 分鐘，你會看到類似這樣的輸出：

```
Creating a new Next.js app in C:\VScode\web3\tw-birth-tracker...

Installing dependencies:
- react
- react-dom
- next
- typescript
- tailwindcss
...

✔ Installation complete!

Success! Created tw-birth-tracker at C:\VScode\web3\tw-birth-tracker
```

### 步驟 5：進入專案目錄

```bash
cd tw-birth-tracker
```

---

## 3.2 認識專案結構

執行 `ls` 或 `dir` 查看專案結構：

```
tw-birth-tracker/
├── app/                    # App Router 核心目錄
│   ├── favicon.ico         # 網站圖示
│   ├── globals.css         # 全域 CSS 樣式
│   ├── layout.tsx          # 根 Layout，包裹所有頁面
│   └── page.tsx            # 首頁（對應路徑 /）
├── public/                 # 靜態檔案目錄（圖片、字型等）
├── node_modules/           # npm 套件（不會 commit 到 Git）
├── .gitignore              # Git 忽略清單
├── next.config.js          # Next.js 配置檔
├── package.json            # 專案依賴清單
├── tailwind.config.ts      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
└── README.md               # 專案說明文件
```

### 重要檔案說明

#### `app/layout.tsx` - 根 Layout

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

**作用**：
- 定義整個網站的 HTML 結構
- `{children}` 會被替換為各個頁面的內容
- 只會在初始載入時執行一次（不像舊版每次換頁都重新渲染）

#### `app/page.tsx` - 首頁

```tsx
export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js!</h1>
    </main>
  )
}
```

**作用**：
- 對應網站根路徑 `/`
- 預設是 **Server Component**（可直接存取資料庫）

### 步驟 6：測試專案是否正常運行

```bash
npm run dev
```

你應該會看到：
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.1s
```

開啟瀏覽器，前往 `http://localhost:3000`，你應該會看到 Next.js 的預設歡迎頁面。

按 `Ctrl + C` 停止開發伺服器。

---

## 3.3 取得 Neon 連線字串

現在我們要將 Next.js 專案與 Neon 資料庫連接起來。

### 步驟 1：回到 Neon Dashboard

開啟瀏覽器，前往 https://console.neon.tech

### 步驟 2：選擇你的專案

點擊 `tw-birth-tracker` 專案。

### 步驟 3：找到 Connection String

在 Dashboard 的 **Connection Details** 區塊，你會看到：

```
Connection string
postgresql://alex:AbCdEf123456@ep-cool-sound-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

#### 選擇連線模式

Neon 提供兩種連線字串：

1. **Pooled connection**（推薦）
   - 使用連線池技術
   - 適合 Serverless 環境（如 Vercel）
   - Port: `5432`（預設）或特定 pooler port

2. **Direct connection**
   - 直接連線到資料庫
   - 適合長時間運行的應用程式
   - 連線數有上限

**我們選擇 Pooled connection**。

### 步驟 4：複製連線字串

點擊連線字串旁的 **Copy** 按鈕，或手動選取並複製。

> ⚠️ **重要提醒**：這個字串包含你的資料庫密碼，千萬不要：
> - 貼到公開的聊天室或論壇
> - Commit 到 GitHub 公開 Repository
> - 分享給不信任的人

---

## 3.4 環境變數配置（`.env.local`）

### 什麼是環境變數？

環境變數（Environment Variables）是用來儲存**敏感資訊**和**環境特定配置**的機制。

#### 為什麼需要環境變數？

**❌ 壞做法：直接寫在程式碼中**
```typescript
// lib/db.ts
const sql = postgres('postgresql://alex:myPassword@...'); // 危險！
```

**問題**：
- 如果 commit 到 GitHub，全世界都能看到你的密碼
- 不同環境（開發、測試、正式）需要不同的資料庫，需要修改程式碼

**✅ 好做法：使用環境變數**
```typescript
// lib/db.ts
const sql = postgres(process.env.DATABASE_URL!); // 安全！
```

### 步驟 1：建立 `.env.local` 檔案

在專案根目錄建立檔案：`.env.local`

```bash
# Windows PowerShell
New-Item .env.local

# macOS/Linux
touch .env.local
```

### 步驟 2：填入連線字串

使用編輯器開啟 `.env.local`，貼上以下內容：

```env
# Neon Database Connection
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

**注意事項**：
- 替換整個字串為你剛才從 Neon 複製的連線字串
- 使用雙引號包裹（避免特殊字元問題）
- 不要有空格（例如 `DATABASE_URL =` 是錯的）

### 步驟 3：驗證環境變數

建立一個測試檔案 `test-env.js`（測試完會刪除）：

```javascript
console.log('DATABASE_URL:', process.env.DATABASE_URL);
```

執行：
```bash
node test-env.js
```

你應該會看到：
```
DATABASE_URL: postgresql://...
```

如果看到 `undefined`，表示環境變數沒有正確載入。

> 💡 **Next.js 特別說明**：
> Next.js 會自動載入 `.env.local` 中的變數，不需要額外使用 `dotenv` 套件。

---

## 3.5 `.gitignore` 配置

### 什麼是 `.gitignore`？

`.gitignore` 檔案告訴 Git「哪些檔案不要追蹤和上傳」。

### 檢查 `.gitignore`

`create-next-app` 已經自動建立了 `.gitignore`，讓我們確認它包含了關鍵內容：

```bash
cat .gitignore    # macOS/Linux
type .gitignore   # Windows
```

你應該會看到類似這樣的內容：

```
# dependencies
/node_modules

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local     # 這行很重要！

# vercel
.vercel
```

### 關鍵項目解析

#### `.env*.local`
這行規則會忽略：
- `.env.local`
- `.env.development.local`
- `.env.production.local`

**為什麼要忽略？**
- 這些檔案包含敏感資訊（如資料庫密碼）
- 不同開發者和環境應該有各自的環境變數

#### `/node_modules`
- 包含所有 npm 套件（數萬個檔案）
- 其他人只需執行 `npm install` 就能還原
- 上傳到 GitHub 會浪費空間且極慢

#### `/.next/`
- Next.js 的建置輸出目錄
- 每次執行 `npm run build` 都會重新產生
- 不需要追蹤

### 步驟 1：初始化 Git Repository

```bash
git init
```

### 步驟 2：驗證 `.env.local` 被忽略

```bash
git status
```

你應該**不會**看到 `.env.local` 出現在清單中。

如果看到了，表示 `.gitignore` 沒有正常運作，請檢查：
1. `.gitignore` 檔案是否存在於根目錄
2. 檔案中是否有 `.env*.local` 這行

---

## 3.6 環境變數的最佳實踐

### 建立 `.env.example` 範本

為了讓其他開發者知道需要哪些環境變數，建立 `.env.example`：

```env
# Neon Database Connection
# Get your connection string from https://console.neon.tech
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

**差異**：
- `.env.local`：包含真實的密碼，不 commit
- `.env.example`：只有範本格式，可以 commit

### 不同環境的環境變數

Next.js 支援多種環境變數檔案：

```
.env                  # 所有環境共用（可 commit 非敏感資訊）
.env.local            # 本地開發，覆蓋 .env（不 commit）
.env.development      # 開發環境專用
.env.production       # 正式環境專用（通常在 Vercel 設定）
```

**載入優先順序**（由高到低）：
1. `.env.local`
2. `.env.development` 或 `.env.production`
3. `.env`

### 在程式碼中使用環境變數

#### Server Component / API Route（後端）
```typescript
// app/page.tsx 或 app/api/route.ts
const dbUrl = process.env.DATABASE_URL; // 可存取所有環境變數
```

#### Client Component（前端）
```typescript
// components/MyComponent.tsx
'use client';

const apiKey = process.env.NEXT_PUBLIC_API_KEY; // 只能存取 NEXT_PUBLIC_ 開頭的變數
```

**安全規則**：
- 前端可見的變數必須以 `NEXT_PUBLIC_` 開頭
- 資料庫密碼、API Secret 絕對不要加 `NEXT_PUBLIC_`

---

## 3.7 專案清理與準備

在開始撰寫我們的程式碼之前，先清理預設的範例內容。

### 步驟 1：清空 `app/page.tsx`

將 `app/page.tsx` 替換為：

```typescript
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">台灣出生人口趨勢</h1>
      <p className="mt-4 text-gray-600">正在建置中...</p>
    </main>
  );
}
```

### 步驟 2：簡化 `app/globals.css`

保留 Tailwind 的基礎設定，移除複雜的 CSS 變數：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 步驟 3：測試執行

```bash
npm run dev
```

前往 `http://localhost:3000`，你應該會看到：
- 標題：「台灣出生人口趨勢」
- 副標題：「正在建置中...」

---

## 本章小結

恭喜你完成第三章！你已經學會了：

### 核心技能
✅ 使用 `create-next-app@14` 建立 Next.js 專案  
✅ 理解 App Router 的目錄結構  
✅ 安全地管理環境變數（`.env.local`）  
✅ 配置 `.gitignore` 保護敏感資訊  
✅ 理解 Server Component 的概念  

### 輸出成果
你應該已經完成了以下檔案：

```
tw-birth-tracker/
├── .env.local              # 包含 DATABASE_URL
├── .env.example            # 環境變數範本
├── .gitignore              # 已驗證會忽略 .env.local
├── app/
│   ├── page.tsx            # 清理過的首頁
│   ├── layout.tsx          # 根 Layout
│   └── globals.css         # 簡化過的樣式
└── package.json
```

### 安全檢查清單
- [ ] `.env.local` 不在 Git 追蹤中（執行 `git status` 確認）
- [ ] 已建立 `.env.example` 供團隊參考
- [ ] 已將 Neon 連線字串安全地儲存在 `.env.local`
- [ ] 了解不應該在前端暴露 `DATABASE_URL`

---

## 下一章預告

在第四章，我們將會：
- 安裝 `postgres.js` 套件
- 建立資料庫連線模組（`lib/db.ts`）
- 撰寫資料獲取函數（`getBirthData`）
- 在 Server Component 中成功撈取資料庫資料

**準備好連接真實的資料庫了嗎？** 🗄️

---

## 疑難排解

### 問題 1：`npm run dev` 失敗

**錯誤訊息**：
```
Error: Cannot find module 'next'
```

**解決方法**：
```bash
# 重新安裝依賴
rm -rf node_modules package-lock.json
npm install
```

### 問題 2：環境變數讀不到

**症狀**：`process.env.DATABASE_URL` 回傳 `undefined`

**解決方法**：
1. 確認 `.env.local` 在根目錄（不是 `app/` 裡）
2. 確認變數名稱沒有拼錯
3. 重新啟動開發伺服器（`Ctrl + C` 後再 `npm run dev`）
4. 確認沒有多餘空格：`DATABASE_URL="..."` 不是 `DATABASE_URL = "..."`

### 問題 3：TypeScript 報錯

**錯誤訊息**：
```
Type 'string | undefined' is not assignable to type 'string'
```

**解決方法**：
```typescript
// 使用非空斷言（Non-null assertion）
const dbUrl = process.env.DATABASE_URL!;

// 或提供預設值
const dbUrl = process.env.DATABASE_URL || '';

// 或進行檢查
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}
```

下一章見！ 🚀
