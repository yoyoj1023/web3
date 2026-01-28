# 第三章：伺服器端資料獲取

> **學習目標**：利用 Next.js App Router 的優勢，從 Server 直接讀取數據

---

## 📋 本章概述

在這一章中，你將學會：
- Next.js Server Components 的概念與優勢
- 如何在伺服器端直接查詢資料庫
- 型別安全的資料獲取
- 實作載入狀態與錯誤處理

---

## 3.1 Server Components 實作

### 理解 Server Components vs Client Components

Next.js 13+ 引入了全新的元件架構：

| 特性 | Server Components | Client Components |
|-----|-------------------|-------------------|
| **渲染位置** | 伺服器 | 瀏覽器 |
| **預設類型** | ✅ 是 | ❌ 否（需標註 `'use client'`）|
| **可使用 async/await** | ✅ 是 | ❌ 否 |
| **可直接查詢資料庫** | ✅ 是 | ❌ 否 |
| **可使用瀏覽器 API** | ❌ 否 | ✅ 是 |
| **可使用 React Hooks** | ❌ 否 | ✅ 是 |
| **可使用事件處理** | ❌ 否 | ✅ 是 |

**Server Components 的優勢**：

```typescript
// ✅ Server Component（預設）
async function ServerPage() {
  // 可以直接查詢資料庫
  const data = await sql`SELECT * FROM birth_records`;
  
  return <div>{/* 顯示資料 */}</div>;
}

// ❌ Client Component
'use client';
function ClientPage() {
  // 不能直接查詢資料庫
  // 需要透過 API Route 或 Server Action
  
  return <div>{/* 顯示資料 */}</div>;
}
```

---

### 步驟 1：定義資料型別

建立 `types/birth-record.ts`：

```typescript
/**
 * 出生紀錄資料型別
 */
export interface BirthRecord {
  id: number;
  year: number;
  births: number;
  created_at: string;
}
```

**為什麼需要定義型別？**

- ✅ TypeScript 會檢查型別錯誤
- ✅ IDE 提供自動完成功能
- ✅ 程式碼更易於維護
- ✅ 減少執行時錯誤

---

### 步驟 2：建立資料獲取函數

建立 `lib/get-birth-data.ts`：

```typescript
import sql from './db';
import { BirthRecord } from '@/types/birth-record';

/**
 * 從資料庫獲取所有出生紀錄
 * @returns 按年份升序排序的出生紀錄陣列
 */
export async function getBirthData(): Promise<BirthRecord[]> {
  try {
    // 執行 SQL 查詢
    const data = await sql<BirthRecord[]>`
      SELECT id, year, births, created_at
      FROM birth_records
      ORDER BY year ASC
    `;
    
    console.log(`✅ 成功獲取 ${data.length} 筆資料`);
    
    return data;
  } catch (error) {
    console.error('❌ 獲取資料失敗：', error);
    throw new Error('無法從資料庫獲取資料');
  }
}
```

---

### 程式碼解說

#### 1. 泛型型別參數

```typescript
await sql<BirthRecord[]>`SELECT ...`
```

**說明**：
- `<BirthRecord[]>` 告訴 TypeScript 回傳的資料型別
- 提供型別檢查和自動完成功能

---

#### 2. 標記模板字串（Tagged Template Literals）

```typescript
sql`SELECT * FROM birth_records WHERE year = ${year}`
```

**優勢**：
- ✅ **自動防止 SQL 注入**：參數會自動轉義
- ✅ **語法簡潔**：不需要手動拼接字串
- ✅ **支援多行**：SQL 可以換行書寫

**比較**：

```typescript
// ❌ 不安全的做法（容易 SQL 注入）
const data = await sql`SELECT * FROM users WHERE id = ${userId}`;

// ✅ postgres.js 自動處理（安全）
const data = await sql`SELECT * FROM users WHERE id = ${userId}`;
```

---

#### 3. 錯誤處理

```typescript
try {
  // 執行查詢
} catch (error) {
  console.error('錯誤訊息', error);
  throw new Error('友善的錯誤訊息');
}
```

**為什麼要重新拋出錯誤？**
- ✅ 向使用者顯示友善的錯誤訊息
- ✅ 隱藏敏感的技術細節
- ✅ 讓上層元件可以統一處理

---

### 步驟 3：在頁面中使用

修改 `app/page.tsx`：

```typescript
import { getBirthData } from '@/lib/get-birth-data';

export default async function Home() {
  // 在 Server Component 中直接獲取資料
  const birthData = await getBirthData();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          台灣出生率趨勢儀表板
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            原始資料
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-3 text-gray-600">年份</th>
                  <th className="text-right p-3 text-gray-600">出生人數</th>
                </tr>
              </thead>
              <tbody>
                {birthData.map((record) => (
                  <tr 
                    key={record.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 font-medium">{record.year}</td>
                    <td className="text-right p-3 font-mono">
                      {record.births.toLocaleString('zh-TW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            資料來源：內政部統計處 | 共 {birthData.length} 筆資料
          </div>
        </div>
      </div>
    </main>
  );
}
```

---

### 程式碼重點解說

#### 1. Async Server Component

```typescript
export default async function Home() {
  const data = await getBirthData();
  // ...
}
```

**關鍵點**：
- ✅ 頁面元件可以是 `async` 函數
- ✅ 可以直接使用 `await` 等待資料
- ✅ Next.js 會自動處理 Streaming

---

#### 2. 數字格式化

```typescript
{record.births.toLocaleString('zh-TW')}
```

**效果**：
- `208440` → `208,440`
- 自動加入千分位逗號
- `'zh-TW'` 指定為台灣地區格式

---

#### 3. Key 屬性

```typescript
{birthData.map((record) => (
  <tr key={record.id}>
    {/* ... */}
  </tr>
))}
```

**為什麼需要 key？**
- React 使用 key 來追蹤列表項目
- 提升列表更新效能
- 必須是唯一值（通常使用 id）

---

### 步驟 4：測試結果

1. 確保開發伺服器正在運行
2. 開啟 `http://localhost:3000`
3. 你應該會看到一個美觀的表格，顯示 2016-2025 年的出生數據

---

## 3.2 錯誤處理與載入狀態

### Next.js App Router 的檔案慣例

Next.js 提供特殊的檔案名稱來處理不同狀態：

| 檔案名稱 | 用途 | 何時顯示 |
|---------|------|---------|
| `page.tsx` | 頁面內容 | 正常載入時 |
| `loading.tsx` | 載入中畫面 | 資料獲取期間 |
| `error.tsx` | 錯誤頁面 | 發生錯誤時 |
| `not-found.tsx` | 404 頁面 | 路由不存在時 |

---

### 步驟 1：建立載入中畫面

建立 `app/loading.tsx`：

```typescript
export default function Loading() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* 標題骨架屏 */}
        <div className="animate-pulse mb-8">
          <div className="h-12 bg-gray-200 rounded w-1/3"></div>
        </div>
        
        {/* 卡片骨架屏 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse">
            {/* 副標題 */}
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            
            {/* 表格行 */}
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

---

### 骨架屏（Skeleton Screen）設計原則

**什麼是骨架屏？**
- 在內容載入前顯示的佔位符
- 模擬實際內容的結構和佈局
- 提供更好的使用者體驗

**設計要點**：

1. **結構相似**：骨架屏應該與實際內容相似
2. **使用動畫**：`animate-pulse` 提供脈動效果
3. **適當的灰階**：使用不同深淺的灰色區分層次

**範例**：

```typescript
// ✅ 好的骨架屏
<div className="animate-pulse">
  <div className="h-12 bg-gray-200 rounded w-1/3 mb-4"></div>
  <div className="h-64 bg-gray-100 rounded"></div>
</div>

// ❌ 不好的骨架屏
<div>載入中...</div>
```

---

### 步驟 2：建立錯誤處理頁面

建立 `app/error.tsx`：

```typescript
'use client'; // Error 元件必須是 Client Component

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以將錯誤記錄到錯誤追蹤服務
    console.error('頁面錯誤：', error);
  }, [error]);

  return (
    <main className="min-h-screen p-8 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-red-600 mb-2">
            發生錯誤
          </h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-gray-600 mb-4">
            {error.message || '無法載入資料，請稍後再試'}
          </p>
          
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono">
              錯誤代碼：{error.digest}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            重新載入
          </button>
          
          <a
            href="/"
            className="block w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            返回首頁
          </a>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          如果問題持續發生，請聯絡技術支援
        </p>
      </div>
    </main>
  );
}
```

---

### Error 元件解說

#### 1. 必須是 Client Component

```typescript
'use client';
```

**原因**：
- 需要使用 `useEffect` Hook
- 需要處理使用者互動（按鈕點擊）
- Next.js 的錯誤邊界必須在客戶端運行

---

#### 2. reset 函數

```typescript
<button onClick={reset}>重新載入</button>
```

**功能**：
- 重新渲染 Error 邊界內的內容
- 不會重新整理整個頁面
- 適合處理暫時性錯誤

---

#### 3. 錯誤資訊

```typescript
error.message  // 錯誤訊息
error.digest   // Next.js 生成的錯誤 ID
```

---

### 步驟 3：測試錯誤處理

#### 測試方法 1：模擬資料庫錯誤

修改 `lib/get-birth-data.ts`：

```typescript
export async function getBirthData(): Promise<BirthRecord[]> {
  // 🧪 測試用：模擬錯誤
  throw new Error('資料庫連線失敗');
  
  // 原本的程式碼...
}
```

重新整理頁面，你應該會看到錯誤頁面。

#### 測試方法 2：故意寫錯 SQL

```typescript
const data = await sql<BirthRecord[]>`
  SELECT * FROM non_existent_table
`;
```

---

### 步驟 4：測試載入狀態

為了看到載入畫面，我們可以加入人工延遲：

修改 `lib/get-birth-data.ts`：

```typescript
export async function getBirthData(): Promise<BirthRecord[]> {
  // 🧪 測試用：延遲 2 秒
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const data = await sql<BirthRecord[]>`
    SELECT id, year, births, created_at
    FROM birth_records
    ORDER BY year ASC
  `;
  
  return data;
}
```

重新整理頁面，你會先看到骨架屏，2 秒後顯示實際資料。

> ⚠️ 記得測試完後移除延遲程式碼！

---

## 🎯 進階實作

### 實作 1：快取策略

Next.js 14 預設會快取資料，你可以自訂快取行為：

```typescript
// app/page.tsx
export const revalidate = 3600; // 每小時更新一次

export default async function Home() {
  // ...
}
```

**快取選項**：

| 設定 | 說明 | 適用情境 |
|-----|------|---------|
| `revalidate = false` | 永久快取（預設）| 靜態資料 |
| `revalidate = 0` | 不快取 | 即時資料 |
| `revalidate = 3600` | 快取 1 小時 | 定期更新的資料 |

---

### 實作 2：條件查詢

建立 `lib/get-birth-data.ts` 的變體：

```typescript
/**
 * 查詢特定年份範圍的出生紀錄
 * @param startYear 起始年份
 * @param endYear 結束年份
 */
export async function getBirthDataByYearRange(
  startYear: number,
  endYear: number
): Promise<BirthRecord[]> {
  const data = await sql<BirthRecord[]>`
    SELECT id, year, births, created_at
    FROM birth_records
    WHERE year BETWEEN ${startYear} AND ${endYear}
    ORDER BY year ASC
  `;
  
  return data;
}

/**
 * 查詢單一年份的出生紀錄
 */
export async function getBirthDataByYear(
  year: number
): Promise<BirthRecord | null> {
  const data = await sql<BirthRecord[]>`
    SELECT id, year, births, created_at
    FROM birth_records
    WHERE year = ${year}
  `;
  
  return data[0] || null;
}
```

---

### 實作 3：統計資料

建立 `lib/get-birth-stats.ts`：

```typescript
import sql from './db';

export interface BirthStats {
  total: number;
  average: number;
  max: number;
  min: number;
}

export async function getBirthStats(): Promise<BirthStats> {
  const result = await sql<[BirthStats]>`
    SELECT 
      SUM(births) as total,
      AVG(births)::INTEGER as average,
      MAX(births) as max,
      MIN(births) as min
    FROM birth_records
  `;
  
  return result[0];
}
```

在頁面中使用：

```typescript
const stats = await getBirthStats();

console.log(`總計：${stats.total.toLocaleString()}`);
console.log(`平均：${stats.average.toLocaleString()}`);
```

---

## ✅ 本章檢核清單

完成以下項目，確保你已掌握本章內容：

- [ ] 理解 Server Components 與 Client Components 的差異
- [ ] 定義 TypeScript 型別介面
- [ ] 建立資料獲取函數
- [ ] 在頁面中使用 async/await 獲取資料
- [ ] 實作 loading.tsx 骨架屏
- [ ] 實作 error.tsx 錯誤處理
- [ ] 測試載入狀態和錯誤處理
- [ ] 理解快取策略

---

## 📚 延伸學習

### 推薦閱讀

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

### 進階主題

1. **Streaming SSR**：使用 `<Suspense>` 實作部分載入
2. **Parallel Data Fetching**：同時獲取多個資料源
3. **Request Memoization**：避免重複查詢

---

## 🎉 恭喜完成第三章！

你已經成功：
- ✅ 理解 Server Components 的運作方式
- ✅ 實作型別安全的資料獲取
- ✅ 完成載入與錯誤處理

**下一步**：前往 [第四章：數據視覺化與圖表實作](../chapter-04-data-visualization/README.md)，將數據轉化為美觀的圖表！
