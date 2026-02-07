# 第四章：後端邏輯與資料庫連線

## 學習目標
在這一章中，你將學會：
- 安裝並配置 postgres.js 資料庫驅動
- 建立 Singleton 模式的資料庫連線
- 撰寫資料存取層（Data Access Layer）
- 在 Server Component 中執行資料庫查詢
- 處理資料庫連線的常見問題

---

## 4.1 選擇資料庫驅動：為什麼是 postgres.js？

在 Node.js 生態系中，有多種 PostgreSQL 驅動可以選擇：

| 套件 | 特色 | 適用場景 |
|------|------|---------|
| **node-postgres (pg)** | 最老牌、最穩定 | 傳統 Node.js 應用 |
| **postgres.js** | 輕量、效能高、現代 API | Serverless、Next.js（我們的選擇）|
| **Prisma** | ORM、Type-safe | 複雜資料模型、團隊協作 |
| **Drizzle** | 輕量 ORM、效能好 | 想要 ORM 又在乎效能 |

### postgres.js 的優勢

✅ **速度快**：比 `pg` 快約 30%  
✅ **Bundle 小**：只有 ~3KB（gzipped）  
✅ **現代 API**：支援 Template Literals  
✅ **Serverless 友善**：自動管理連線池  
✅ **TypeScript 支援**：內建型別定義  

---

## 4.2 安裝 postgres.js

在專案根目錄執行：

```bash
npm install postgres
```

安裝完成後，檢查 `package.json`：

```json
{
  "dependencies": {
    "next": "14.x.x",
    "react": "^18",
    "postgres": "^3.4.4"
  }
}
```

---

## 4.3 建立資料庫連線模組（Singleton Pattern）

### 為什麼需要 Singleton？

在開發模式下，Next.js 的 Hot Module Replacement (HMR) 會在你儲存檔案時重新載入模組。如果每次都建立新的資料庫連線，會導致：

❌ **問題：Connection Leak（連線洩漏）**
```typescript
// 錯誤示範：每次 import 都建立新連線
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!); // 危險！
```

每次 Hot Reload 都會建立新連線，但舊連線不會關閉，最終會耗盡資料庫的連線數上限（Neon 免費版約 100 個）。

✅ **解決方案：使用 Singleton 模式**
確保整個應用程式只有一個連線實例，並且在 Hot Reload 時重用。

### 步驟 1：建立 `lib` 目錄

```bash
mkdir lib
```

### 步驟 2：建立 `lib/db.ts`

```typescript
import postgres from 'postgres';

// 確保環境變數存在
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// 宣告全域型別（僅用於開發環境的 Singleton）
declare global {
  var sql: ReturnType<typeof postgres> | undefined;
}

// 建立或重用連線
const sql = global.sql || postgres(process.env.DATABASE_URL, {
  max: 10, // 最大連線數
  idle_timeout: 20, // 閒置連線在 20 秒後自動關閉
  connect_timeout: 10, // 連線逾時設定（秒）
});

// 開發環境下將連線存到 global，避免 Hot Reload 時重複建立
if (process.env.NODE_ENV !== 'production') {
  global.sql = sql;
}

export default sql;
```

### 程式碼解析

#### 1. 環境變數檢查
```typescript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}
```
**用途**：在應用程式啟動時立即發現配置錯誤，而非等到執行查詢時才失敗。

#### 2. 全域型別宣告
```typescript
declare global {
  var sql: ReturnType<typeof postgres> | undefined;
}
```
**用途**：讓 TypeScript 知道我們會在 `global` 物件上掛載 `sql` 屬性。

#### 3. Singleton 邏輯
```typescript
const sql = global.sql || postgres(process.env.DATABASE_URL, { ... });
```
**邏輯**：
- 如果 `global.sql` 已存在（Hot Reload 時），直接使用
- 如果不存在（第一次執行），建立新連線

#### 4. 連線配置
```typescript
{
  max: 10,           // 最大連線數（預設 10）
  idle_timeout: 20,  // 閒置 20 秒後自動關閉（節省資源）
  connect_timeout: 10 // 連線逾時保護
}
```

**為什麼 `max: 10` 就夠？**
- Next.js 在 Serverless 環境下，每個請求都是獨立的
- Neon 的 Pooled Connection 已經在伺服器端做了連線池
- 設太大反而會佔用資源

#### 5. 開發環境特殊處理
```typescript
if (process.env.NODE_ENV !== 'production') {
  global.sql = sql;
}
```
**用途**：只在開發環境啟用 Singleton（生產環境不需要，因為沒有 Hot Reload）。

---

## 4.4 測試資料庫連線

在繼續之前，讓我們先確認連線是否正常。

### 步驟 1：建立測試檔案 `lib/test-connection.ts`

```typescript
import sql from './db';

async function testConnection() {
  try {
    // 執行簡單的查詢測試連線
    const result = await sql`SELECT current_database(), version()`;
    
    console.log('✅ 資料庫連線成功！');
    console.log('📦 資料庫名稱:', result[0].current_database);
    console.log('🔢 PostgreSQL 版本:', result[0].version.split(' ')[1]);
    
    // 測試查詢我們的資料表
    const births = await sql`SELECT COUNT(*) FROM taiwan_births`;
    console.log('📊 taiwan_births 資料筆數:', births[0].count);
    
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error);
  } finally {
    // 關閉連線（測試用）
    await sql.end();
  }
}

testConnection();
```

### 步驟 2：執行測試

在專案根目錄執行：

```bash
npx tsx lib/test-connection.ts
```

如果連線成功，你會看到：
```
✅ 資料庫連線成功！
📦 資料庫名稱: neondb
🔢 PostgreSQL 版本: 15.3
📊 taiwan_births 資料筆數: 10
```

### 疑難排解

#### 錯誤 1：`Connection timeout`
```
Error: Connection timeout
```

**原因**：
- 網路問題
- DATABASE_URL 錯誤
- 防火牆阻擋

**解決方法**：
1. 檢查 `.env.local` 中的 `DATABASE_URL` 是否正確
2. 確認 Neon 資料庫狀態（是否被暫停）
3. 嘗試在 Neon Dashboard 的 SQL Editor 執行查詢確認資料庫正常

#### 錯誤 2：`relation "taiwan_births" does not exist`
```
Error: relation "taiwan_births" does not exist
```

**原因**：資料表尚未建立

**解決方法**：回到第二章，重新執行建表和匯入資料的 SQL 語句。

---

## 4.5 撰寫資料存取層（Data Access Layer）

### 什麼是 Data Access Layer？

Data Access Layer (DAL) 是一個設計模式，將**資料庫操作**與**業務邏輯**分離。

#### ❌ 不好的做法：直接在 Component 寫 SQL
```typescript
// app/page.tsx
export default async function Home() {
  const data = await sql`SELECT * FROM taiwan_births`; // 不推薦
  return <div>{JSON.stringify(data)}</div>;
}
```

**問題**：
- Component 和資料庫緊密耦合
- SQL 邏輯分散在各個檔案，難以維護
- 無法重用查詢邏輯

#### ✅ 好的做法：建立 DAL 函數
```typescript
// lib/data.ts
export async function getBirthData() {
  return await sql`SELECT * FROM taiwan_births ORDER BY year ASC`;
}

// app/page.tsx
export default async function Home() {
  const data = await getBirthData(); // 清晰易懂
  return <div>{JSON.stringify(data)}</div>;
}
```

**優勢**：
- 單一職責：Component 負責顯示，函數負責資料
- 可重用：多個 Component 可以呼叫同一個函數
- 易測試：可以獨立測試資料函數

### 步驟 1：建立 `lib/data.ts`

```typescript
import sql from './db';

/**
 * 定義資料型別
 */
export interface BirthRecord {
  id: number;
  year: number;
  births: number;
  created_at: Date;
}

/**
 * 取得所有出生人數資料，按年份升序排列
 */
export async function getBirthData(): Promise<BirthRecord[]> {
  try {
    const data = await sql<BirthRecord[]>`
      SELECT id, year, births, created_at 
      FROM taiwan_births 
      ORDER BY year ASC
    `;
    return data;
  } catch (error) {
    console.error('❌ 資料庫查詢失敗:', error);
    throw new Error('Failed to fetch birth data');
  }
}

/**
 * 取得特定年份的出生人數
 */
export async function getBirthByYear(year: number): Promise<BirthRecord | null> {
  try {
    const data = await sql<BirthRecord[]>`
      SELECT id, year, births, created_at 
      FROM taiwan_births 
      WHERE year = ${year}
    `;
    return data[0] || null;
  } catch (error) {
    console.error('❌ 查詢失敗:', error);
    return null;
  }
}

/**
 * 取得出生人數統計資訊
 */
export async function getBirthStats() {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_years,
        AVG(births)::INT as avg_births,
        MAX(births) as max_births,
        MIN(births) as min_births
      FROM taiwan_births
    `;
    return stats[0];
  } catch (error) {
    console.error('❌ 統計查詢失敗:', error);
    throw new Error('Failed to fetch birth statistics');
  }
}
```

### 程式碼解析

#### 1. TypeScript Interface
```typescript
export interface BirthRecord {
  id: number;
  year: number;
  births: number;
  created_at: Date;
}
```
**用途**：
- 提供型別檢查
- 編輯器可以自動完成
- 防止拼錯欄位名稱

#### 2. 泛型查詢
```typescript
const data = await sql<BirthRecord[]>`...`;
```
**用途**：告訴 TypeScript 查詢結果的型別。

#### 3. SQL 注入防護
```typescript
// ✅ 安全：使用 Template Literal
WHERE year = ${year}

// ❌ 危險：字串拼接
WHERE year = ${year}  // postgres.js 會自動處理
```

postgres.js 會自動對參數進行 escape，防止 SQL 注入攻擊。

#### 4. 錯誤處理
```typescript
try {
  // 查詢邏輯
} catch (error) {
  console.error('❌ 資料庫查詢失敗:', error);
  throw new Error('Failed to fetch birth data');
}
```
**用途**：
- 記錄錯誤到 console（方便除錯）
- 拋出友善的錯誤訊息（不暴露資料庫細節）

---

## 4.6 在 Server Component 中使用資料

Next.js 14 的 App Router 最強大的功能：**Server Component 可以直接是 async 函數！**

### 步驟 1：修改 `app/page.tsx`

```typescript
import { getBirthData, getBirthStats } from '@/lib/data';

export default async function Home() {
  // 並行查詢（Promise.all）
  const [birthData, stats] = await Promise.all([
    getBirthData(),
    getBirthStats(),
  ]);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          台灣出生人口趨勢
        </h1>
        <p className="text-gray-600 mb-8">
          資料年份：{birthData[0].year} - {birthData[birthData.length - 1].year}
        </p>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="資料年數" value={stats.total_years} />
          <StatCard title="平均出生數" value={stats.avg_births.toLocaleString()} />
          <StatCard title="最高記錄" value={stats.max_births.toLocaleString()} />
          <StatCard title="最低記錄" value={stats.min_births.toLocaleString()} />
        </div>

        {/* 資料表格 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  年份
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  出生人數
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  年變化
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {birthData.map((record, index) => {
                const previousBirths = index > 0 ? birthData[index - 1].births : null;
                const change = previousBirths ? record.births - previousBirths : null;
                const changePercent = previousBirths 
                  ? ((change! / previousBirths) * 100).toFixed(2) 
                  : null;

                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                      {record.births.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                      change === null ? 'text-gray-400' : change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {change === null ? '-' : (
                        <>
                          {change > 0 ? '+' : ''}{change.toLocaleString()} 
                          <span className="text-xs ml-1">({changePercent}%)</span>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

// 統計卡片組件
function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
```

### 程式碼重點說明

#### 1. Async Server Component
```typescript
export default async function Home() {
  const data = await getBirthData(); // 可以直接 await！
}
```

**在舊版 Next.js (Pages Router) 中**：
```typescript
// 舊版需要這樣寫
export async function getServerSideProps() {
  const data = await getBirthData();
  return { props: { data } };
}

export default function Home({ data }) {
  // ...
}
```

#### 2. 並行查詢優化
```typescript
const [birthData, stats] = await Promise.all([
  getBirthData(),
  getBirthStats(),
]);
```

**效能比較**：
```typescript
// ❌ 慢：依序執行（總時間 = T1 + T2）
const birthData = await getBirthData();  // 100ms
const stats = await getBirthStats();     // 50ms
// 總時間：150ms

// ✅ 快：並行執行（總時間 = max(T1, T2)）
const [birthData, stats] = await Promise.all([...]);
// 總時間：100ms
```

#### 3. 計算年變化
```typescript
const previousBirths = index > 0 ? birthData[index - 1].births : null;
const change = previousBirths ? record.births - previousBirths : null;
```

**邏輯**：
- 第一年（2016）沒有「前一年」，顯示 `-`
- 其他年份計算與前一年的差異

---

## 4.7 執行與測試

### 步驟 1：啟動開發伺服器

```bash
npm run dev
```

### 步驟 2：檢視結果

前往 `http://localhost:3000`，你應該會看到：

1. **統計卡片**：顯示資料年數、平均值、最大值、最小值
2. **資料表格**：顯示所有年份的出生人數和年變化

### 步驟 3：檢查終端機輸出

在終端機中，你應該會看到類似這樣的日誌（如果有啟用 postgres.js 的 debug 模式）：

```
GET / 200 in 245ms
```

**代表**：Server Component 在伺服器端執行查詢，並在 245ms 內完成渲染。

---

## 4.8 理解 Server Component 的運作流程

### 傳統 CSR (Client-Side Rendering) 流程

```
1. 瀏覽器請求 HTML
2. 下載 JavaScript bundle
3. React 在客戶端執行
4. 發送 API 請求到 /api/data
5. 等待回應
6. 更新 UI
```

**問題**：
- 多次往返（HTML → JS → API → Data）
- JavaScript bundle 很大
- 需要 Loading 狀態處理

### Server Component 流程（我們的做法）

```
1. 瀏覽器請求 HTML
2. 伺服器執行查詢
3. 伺服器渲染完整 HTML
4. 回傳給瀏覽器
```

**優勢**：
- 只需一次請求
- 無需下載額外 JavaScript
- 更快的首次渲染 (FCP)
- SEO 友善

---

## 本章小結

恭喜你完成第四章！你已經學會了：

### 核心技能
✅ 安裝並配置 postgres.js  
✅ 建立 Singleton 模式的資料庫連線  
✅ 撰寫 Data Access Layer 函數  
✅ 在 Server Component 中執行資料庫查詢  
✅ 使用 Promise.all 優化並行查詢  
✅ 計算資料的衍生值（年變化）  

### 輸出成果
```
tw-birth-tracker/
├── lib/
│   ├── db.ts              # 資料庫連線 Singleton
│   └── data.ts            # 資料存取層
├── app/
│   └── page.tsx           # 顯示資料的首頁
└── .env.local             # 包含 DATABASE_URL
```

### 資料流程圖

```
User Request
    ↓
Next.js Server
    ↓
Server Component (app/page.tsx)
    ↓
Data Access Layer (lib/data.ts)
    ↓
Database Connection (lib/db.ts)
    ↓
Neon PostgreSQL
    ↓
Return Data
    ↓
Render HTML
    ↓
Send to Browser
```

---

## 下一章預告

在第五章，我們將會：
- 安裝 Recharts 圖表庫
- 建立 Client Component 繪製互動式折線圖
- 理解 Server Component 與 Client Component 的搭配使用
- 美化 UI，打造專業儀表板

**準備好讓資料視覺化了嗎？** 📊

---

## 進階練習

### 練習 1：新增「取得最近 N 年資料」函數

在 `lib/data.ts` 新增：

```typescript
export async function getRecentBirthData(years: number = 5) {
  const data = await sql<BirthRecord[]>`
    SELECT * FROM taiwan_births 
    ORDER BY year DESC 
    LIMIT ${years}
  `;
  return data.reverse(); // 轉回升序
}
```

### 練習 2：新增「搜尋年份範圍」函數

```typescript
export async function getBirthDataByRange(startYear: number, endYear: number) {
  return await sql<BirthRecord[]>`
    SELECT * FROM taiwan_births 
    WHERE year BETWEEN ${startYear} AND ${endYear}
    ORDER BY year ASC
  `;
}
```

### 練習 3：新增 ISR (Incremental Static Regeneration)

在 `app/page.tsx` 頂部新增：

```typescript
export const revalidate = 3600; // 每小時重新產生一次
```

這樣頁面會被靜態產生，並每小時自動更新一次資料。

下一章見！ 🚀
