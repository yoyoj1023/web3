# 第二章：Next.js 專案架構與資料庫連線

> **學習目標**：建立專案骨架，並確保後端能抓到資料

---

## 📋 本章概述

在這一章中，你將學會：
- 使用 Next.js 14 App Router 建立專案
- 管理環境變數以保護敏感資訊
- 設定 PostgreSQL 連線
- 建立資料庫連線模組

---

## 2.1 初始化 Next.js 專案

### 為什麼選擇 Next.js？

Next.js 是目前最受歡迎的 React 框架之一，它提供：

| 功能 | 說明 | 優勢 |
|-----|------|------|
| **Server Components** | 伺服器端元件 | 更快的頁面載入速度 |
| **App Router** | 新一代路由系統 | 更靈活的佈局管理 |
| **內建 TypeScript** | 型別安全 | 減少執行時錯誤 |
| **自動程式碼分割** | Code Splitting | 優化效能 |
| **API Routes** | 內建 API 功能 | 不需額外後端 |
| **Vercel 部署** | 一鍵部署 | 簡化維運流程 |

### 環境需求

開始之前，請確認已安裝：

```bash
# 檢查 Node.js 版本（需要 18.17 或更高版本）
node --version

# 檢查 npm 版本
npm --version
```

> 💡 如果沒有安裝 Node.js，請前往 [https://nodejs.org/](https://nodejs.org/) 下載 LTS 版本

---

### 步驟 1：建立 Next.js 專案

開啟終端機（Windows 使用 PowerShell 或 CMD，macOS/Linux 使用 Terminal），執行以下指令：

```bash
npx create-next-app@latest taiwan-birth-dashboard
```

> 📝 **指令解說**：
> - `npx`：執行 npm 套件而不需全域安裝
> - `create-next-app@latest`：使用最新版本的 Next.js 建立工具
> - `taiwan-birth-dashboard`：專案名稱

---

### 步驟 2：互動式配置

執行指令後，會出現一系列配置選項。請按照以下方式選擇：

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … No
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias (@/*)? … No
```

**選項說明**：

| 選項 | 建議 | 原因 |
|-----|------|------|
| TypeScript | ✅ Yes | 提供型別檢查，減少錯誤 |
| ESLint | ✅ Yes | 程式碼品質檢查工具 |
| Tailwind CSS | ✅ Yes | 快速開發 UI 樣式 |
| src/ directory | ❌ No | 簡化專案結構 |
| App Router | ✅ Yes | 使用新一代路由系統 |
| Import alias | ❌ No | 使用預設的 @/* 即可 |

---

### 步驟 3：進入專案目錄

```bash
cd taiwan-birth-dashboard
```

---

### 步驟 4：專案結構說明

建立完成後，你的專案結構如下：

```
taiwan-birth-dashboard/
├── app/                    # App Router 目錄
│   ├── favicon.ico        # 網站圖示
│   ├── globals.css        # 全域樣式
│   ├── layout.tsx         # 根佈局元件
│   └── page.tsx           # 首頁元件
├── public/                # 靜態檔案目錄
├── node_modules/          # 依賴套件
├── .eslintrc.json         # ESLint 配置
├── .gitignore            # Git 忽略檔案
├── next.config.js        # Next.js 配置
├── package.json          # 專案資訊與依賴
├── postcss.config.js     # PostCSS 配置
├── tailwind.config.ts    # Tailwind CSS 配置
├── tsconfig.json         # TypeScript 配置
└── README.md             # 專案說明
```

**重要目錄說明**：

- **`app/`**：所有頁面和 API 路由都放在這裡
- **`public/`**：靜態資源（圖片、字型等）
- **`node_modules/`**：npm 安裝的套件（不要手動修改）

---

### 步驟 5：啟動開發伺服器

```bash
npm run dev
```

你應該會看到類似的輸出：

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 2.3s
```

---

### 步驟 6：驗證安裝

開啟瀏覽器，前往 `http://localhost:3000`

你應該會看到 Next.js 的預設歡迎頁面，顯示「Get started by editing app/page.tsx」。

---

## 2.2 環境變數管理

### 為什麼需要環境變數？

在開發應用程式時，我們經常需要處理敏感資訊：

❌ **不好的做法**：
```typescript
// ❌ 千萬不要這樣寫！
const databaseUrl = "postgresql://postgres:mypassword@db.xxx.supabase.co:5432/postgres";
```

**問題**：
- 密碼直接寫在程式碼中
- 提交到 Git 後所有人都看得到
- 開發環境和正式環境無法使用不同設定

✅ **正確做法**：使用環境變數
```typescript
// ✅ 安全的做法
const databaseUrl = process.env.DATABASE_URL;
```

---

### Next.js 環境變數檔案

Next.js 支援多種環境變數檔案：

| 檔案名稱 | 用途 | 是否提交到 Git |
|---------|------|----------------|
| `.env` | 所有環境共用 | ✅ 可以（不含敏感資訊）|
| `.env.local` | 本地開發專用 | ❌ **不可以** |
| `.env.development` | 開發環境 | ✅ 可以（不含敏感資訊）|
| `.env.production` | 正式環境 | ✅ 可以（不含敏感資訊）|

> 💡 我們使用 `.env.local` 來儲存資料庫連線字串

---

### 步驟 1：取得 Supabase 連線字串

回到 Supabase Dashboard：

1. 點擊左側選單的「Project Settings」（齒輪圖示 ⚙️）
2. 在左側選單點擊「Database」
3. 向下捲動到「Connection string」區塊
4. 選擇「URI」分頁（不是 Session pooling）
5. 複製連線字串

連線字串格式如下：

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

> ⚠️ 注意：`[YOUR-PASSWORD]` 需要替換成你在建立專案時設定的密碼

---

### 步驟 2：建立 .env.local 檔案

在專案根目錄建立 `.env.local` 檔案：

**Windows PowerShell**：
```bash
New-Item .env.local
```

**macOS / Linux**：
```bash
touch .env.local
```

---

### 步驟 3：設定環境變數

使用文字編輯器開啟 `.env.local`，加入以下內容：

```bash
# Supabase 資料庫連線字串
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

**重要提醒**：
- 使用雙引號包裹完整的連線字串
- 將 `[YOUR-PASSWORD]` 替換成實際密碼
- 不要有多餘的空格

**正確範例**：
```bash
DATABASE_URL="postgresql://postgres:MyStr0ngP@ssw0rd@db.abcdefghijk.supabase.co:5432/postgres"
```

---

### 步驟 4：確認 .gitignore 設定

開啟 `.gitignore` 檔案，確認包含以下這行：

```
# local env files
.env*.local
```

這確保 `.env.local` 不會被提交到 Git，保護你的敏感資訊。

---

### 步驟 5：重啟開發伺服器

環境變數的修改需要重啟伺服器才會生效：

1. 在終端機按 `Ctrl + C` 停止伺服器
2. 再次執行 `npm run dev` 啟動

---

## 2.3 設定 PostgreSQL 連線用戶端

### 選擇資料庫用戶端

在 Node.js 中連接 PostgreSQL，有多種選擇：

| 套件 | 優點 | 缺點 | 推薦度 |
|-----|------|------|--------|
| **postgres.js** | 輕量、快速、支援 TypeScript | 較新，社群較小 | ⭐⭐⭐⭐⭐ |
| pg | 最流行、穩定 | API 較老舊 | ⭐⭐⭐⭐ |
| Prisma | 強大的 ORM | 學習曲線陡峭 | ⭐⭐⭐ |

我們選擇 **postgres.js**，因為：
- ✅ 輕量快速
- ✅ 完整的 TypeScript 支援
- ✅ 簡潔的 API
- ✅ 支援標記模板字串（Tagged Template Literals）

---

### 步驟 1：安裝 postgres.js

在專案根目錄執行：

```bash
npm install postgres
```

等待安裝完成，你應該會看到：

```
added 1 package, and audited xxx packages in 3s
```

---

### 步驟 2：建立資料庫連線模組

在專案根目錄建立 `lib` 目錄：

```bash
mkdir lib
```

建立 `lib/db.ts` 檔案，加入以下內容：

```typescript
import postgres from 'postgres';

// 檢查環境變數是否存在
if (!process.env.DATABASE_URL) {
  throw new Error(
    '❌ DATABASE_URL 環境變數未設定。\n' +
    '請確認 .env.local 檔案是否存在並包含 DATABASE_URL。'
  );
}

// 建立 PostgreSQL 連線（單例模式）
const sql = postgres(process.env.DATABASE_URL, {
  max: 10,              // 最大連線數
  idle_timeout: 20,     // 閒置超時（秒）
  connect_timeout: 10,  // 連線超時（秒）
});

export default sql;
```

---

### 程式碼解說

#### 1. 環境變數檢查

```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL 環境變數未設定');
}
```

**用途**：
- 在啟動時檢查環境變數
- 如果未設定，立即拋出清楚的錯誤訊息
- 避免在執行時才發現問題

---

#### 2. 連線設定參數

```typescript
const sql = postgres(process.env.DATABASE_URL, {
  max: 10,              // 最大連線數
  idle_timeout: 20,     // 閒置超時
  connect_timeout: 10,  // 連線超時
});
```

**參數說明**：

| 參數 | 說明 | 預設值 | 建議值 |
|-----|------|--------|--------|
| `max` | 連線池最大連線數 | 10 | 10-20 |
| `idle_timeout` | 閒置多久後關閉連線（秒）| 無 | 20-60 |
| `connect_timeout` | 連線建立超時時間（秒）| 30 | 10-30 |

---

#### 3. 單例模式（Singleton Pattern）

```typescript
export default sql;
```

**為什麼使用單例模式？**

- ✅ 整個應用程式共用同一個連線池
- ✅ 避免建立過多連線
- ✅ 提升效能

**使用方式**：

```typescript
// 在其他檔案中
import sql from '@/lib/db';

// 直接使用，不需要 new 或 create
const data = await sql`SELECT * FROM birth_records`;
```

---

### 步驟 3：建立測試連線函數

建立 `lib/test-db.ts` 檔案：

```typescript
import sql from './db';

/**
 * 測試資料庫連線
 * @returns 連線是否成功
 */
export async function testConnection() {
  try {
    // 執行簡單的查詢來測試連線
    const result = await sql`SELECT NOW() as current_time`;
    
    console.log('✅ 資料庫連線成功！');
    console.log('📅 伺服器時間：', result[0].current_time);
    
    return true;
  } catch (error) {
    console.error('❌ 資料庫連線失敗：');
    console.error(error);
    
    return false;
  }
}
```

---

### 步驟 4：測試連線

修改 `app/page.tsx` 來測試連線：

```typescript
import { testConnection } from '@/lib/test-db';

export default async function Home() {
  // 測試資料庫連線
  const isConnected = await testConnection();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Taiwan Birth Trends Dashboard
        </h1>
        
        <div className={`text-xl ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          {isConnected ? '✅ 資料庫連線成功' : '❌ 資料庫連線失敗'}
        </div>
      </div>
    </main>
  );
}
```

---

### 步驟 5：驗證結果

1. 確認開發伺服器正在運行（`npm run dev`）
2. 開啟瀏覽器前往 `http://localhost:3000`
3. 你應該會看到「✅ 資料庫連線成功」
4. 查看終端機，應該會看到類似輸出：

```
✅ 資料庫連線成功！
📅 伺服器時間： 2026-01-27T12:34:56.789Z
```

---

## 🎯 實作練習

### 練習 1：查詢資料表

修改 `lib/test-db.ts`，加入查詢 `birth_records` 的功能：

```typescript
export async function getBirthRecordsCount() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM birth_records
    `;
    return result[0].count;
  } catch (error) {
    console.error('查詢失敗：', error);
    return 0;
  }
}
```

在 `app/page.tsx` 中使用：

```typescript
const recordCount = await getBirthRecordsCount();
console.log(`📊 資料筆數：${recordCount}`);
```

---

### 練習 2：環境變數驗證

建立 `lib/env.ts` 來集中管理環境變數：

```typescript
/**
 * 驗證並取得環境變數
 */
export function getEnvVar(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(
      `❌ 環境變數 ${key} 未設定。\n` +
      `請在 .env.local 檔案中加入：\n` +
      `${key}="your_value"`
    );
  }
  
  return value;
}

// 匯出常用的環境變數
export const DATABASE_URL = getEnvVar('DATABASE_URL');
```

然後修改 `lib/db.ts`：

```typescript
import postgres from 'postgres';
import { DATABASE_URL } from './env';

const sql = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql;
```

---

## 🔧 疑難排解

### 問題 1：找不到 DATABASE_URL

**錯誤訊息**：
```
Error: DATABASE_URL 環境變數未設定
```

**解決方案**：
1. 確認 `.env.local` 檔案存在於專案根目錄
2. 確認檔案內容格式正確
3. 重啟開發伺服器（`Ctrl + C` 然後 `npm run dev`）

---

### 問題 2：連線逾時

**錯誤訊息**：
```
Error: connect ETIMEDOUT
```

**可能原因**：
- 網路問題
- Supabase 專案暫停（免費方案會自動暫停）
- 防火牆阻擋

**解決方案**：
1. 檢查網路連線
2. 登入 Supabase Dashboard 檢查專案狀態
3. 如果專案暫停，點擊「Resume」重新啟動

---

### 問題 3：密碼包含特殊字元

**錯誤訊息**：
```
Error: password authentication failed
```

**原因**：密碼中的特殊字元沒有正確編碼

**解決方案**：使用 URL 編碼

```typescript
// 如果密碼是：My@Pass#123
// 應該編碼為：My%40Pass%23123

// 或使用 JavaScript 編碼
const password = encodeURIComponent('My@Pass#123');
```

---

## ✅ 本章檢核清單

完成以下項目，確保你已掌握本章內容：

- [ ] 成功建立 Next.js 14 專案
- [ ] 理解專案目錄結構
- [ ] 能夠啟動開發伺服器
- [ ] 建立 `.env.local` 檔案
- [ ] 正確設定 DATABASE_URL 環境變數
- [ ] 安裝 postgres.js 套件
- [ ] 建立 `lib/db.ts` 資料庫連線模組
- [ ] 成功測試資料庫連線

---

## 📚 延伸學習

### 推薦閱讀

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [postgres.js Documentation](https://github.com/porsager/postgres)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### 進階主題

1. **連線池管理**：深入了解資料庫連線池的運作原理
2. **錯誤處理策略**：建立完整的錯誤處理機制
3. **連線重試機制**：實作自動重新連線功能

---

## 🎉 恭喜完成第二章！

你已經成功：
- ✅ 建立了 Next.js 專案
- ✅ 設定了環境變數管理
- ✅ 完成了資料庫連線設定

**下一步**：前往 [第三章：伺服器端資料獲取](../chapter-03-server-data-fetching/README.md)，開始從資料庫讀取數據！
