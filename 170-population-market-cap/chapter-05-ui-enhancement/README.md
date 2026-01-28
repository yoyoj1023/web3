# 第五章：UI 精修與使用者體驗

> **學習目標**：讓專案看起來像一個專業的產品

---

## 📋 本章概述

在這一章中，你將學會：
- 引入 shadcn/ui 元件庫
- 使用 Card 元件美化介面
- 實作數據格式化工具
- 加入統計分析功能
- 提升整體使用者體驗

---

## 5.1 引入 shadcn/ui

### 什麼是 shadcn/ui？

shadcn/ui 不是傳統的元件庫，而是一個**元件集合**：

| 特點 | shadcn/ui | 傳統元件庫（如 MUI） |
|-----|-----------|---------------------|
| **安裝方式** | 複製到專案中 | npm install |
| **客製化** | 完全控制 | 受限於 API |
| **依賴** | 無額外依賴 | 需要依賴整個庫 |
| **體積** | 只包含使用的元件 | 包含所有元件 |
| **樣式** | Tailwind CSS | CSS-in-JS |

**優勢**：
- ✅ 完全擁有元件程式碼
- ✅ 易於客製化
- ✅ 基於 Radix UI（無障礙設計）
- ✅ 美觀的預設樣式
- ✅ 支援深色模式

---

### 步驟 1：初始化 shadcn/ui

在終端機執行：

```bash
npx shadcn-ui@latest init
```

---

### 步驟 2：互動式配置

按照以下方式選擇：

```
✔ Would you like to use TypeScript (recommended)? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Where is your tailwind.config.js located? … tailwind.config.ts
✔ Configure the import alias for components: … @/components
✔ Configure the import alias for utils: … @/lib/utils
✔ Are you using React Server Components? … yes
```

**選項說明**：

| 選項 | 選擇 | 原因 |
|-----|------|------|
| TypeScript | ✅ Yes | 型別安全 |
| Style | Default | 經典設計 |
| Base color | Slate | 中性灰色調 |
| CSS variables | ✅ Yes | 易於主題切換 |
| React Server Components | ✅ Yes | 我們使用 App Router |

---

### 步驟 3：安裝 Card 元件

```bash
npx shadcn-ui@latest add card
```

安裝完成後，你會在 `components/ui/` 目錄下看到 `card.tsx`。

---

### 步驟 4：了解 shadcn/ui 的檔案結構

```
your-project/
├── components/
│   └── ui/                    # shadcn/ui 元件
│       ├── card.tsx          # Card 元件
│       └── (其他元件...)
├── lib/
│   └── utils.ts              # 工具函數（cn 函數）
└── app/
    └── globals.css           # 包含 shadcn/ui 的樣式變數
```

---

### 步驟 5：使用 Card 元件

Card 元件包含幾個子元件：

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
```

**元件說明**：

| 元件 | 用途 | 必填 |
|-----|------|------|
| `Card` | 卡片容器 | ✅ |
| `CardHeader` | 標題區域 | ❌ |
| `CardTitle` | 主標題 | ❌ |
| `CardDescription` | 副標題/描述 | ❌ |
| `CardContent` | 主要內容 | ❌ |
| `CardFooter` | 頁尾區域 | ❌ |

---

### 步驟 6：重構首頁使用 Card

修改 `app/page.tsx`：

```typescript
import { getBirthData } from '@/lib/get-birth-data';
import BirthChart from '@/components/birth-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default async function Home() {
  const birthData = await getBirthData();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-800">
            台灣出生率趨勢儀表板
          </h1>
          <p className="text-gray-600">
            2016-2025 年新生兒數據視覺化分析
          </p>
        </div>
        
        {/* 圖表卡片 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>歷年出生人數趨勢</CardTitle>
            <CardDescription>
              資料來源：內政部統計處
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BirthChart data={birthData} />
          </CardContent>
        </Card>

        {/* 資料表格卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>詳細資料</CardTitle>
            <CardDescription>
              共 {birthData.length} 筆資料
            </CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

---

## 5.2 數據格式化技巧

### 步驟 1：建立格式化工具模組

建立 `lib/formatters.ts`：

```typescript
/**
 * 格式化數字為千分位格式
 * @param num 數字
 * @param locale 地區（預設為 zh-TW）
 * @returns 格式化後的字串
 * @example formatNumber(208440) // "208,440"
 */
export function formatNumber(num: number, locale: string = 'zh-TW'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * 格式化為百分比
 * @param num 小數（例如 0.1234 代表 12.34%）
 * @param decimals 小數位數（預設 2 位）
 * @returns 格式化後的百分比字串
 * @example formatPercent(0.1234) // "12.34%"
 */
export function formatPercent(
  num: number, 
  decimals: number = 2
): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * 計算年增長率
 * @param current 當前年份數值
 * @param previous 前一年份數值
 * @returns 增長率（小數形式）
 * @example calculateGrowthRate(150000, 200000) // -0.25 (-25%)
 */
export function calculateGrowthRate(
  current: number, 
  previous: number
): number {
  if (previous === 0) return 0;
  return (current - previous) / previous;
}

/**
 * 格式化為萬人單位
 * @param num 人數
 * @returns 格式化後的字串
 * @example formatToWan(208440) // "20.8萬"
 */
export function formatToWan(num: number): string {
  return (num / 10000).toFixed(1) + '萬';
}

/**
 * 格式化為簡短格式（自動選擇單位）
 * @param num 數字
 * @returns 格式化後的字串
 * @example formatCompact(208440) // "20.8萬"
 * @example formatCompact(1234) // "1,234"
 */
export function formatCompact(num: number): string {
  if (num >= 10000) {
    return formatToWan(num);
  }
  return formatNumber(num);
}
```

---

### Intl.NumberFormat 深入解析

`Intl.NumberFormat` 是瀏覽器內建的國際化 API：

**基本用法**：

```typescript
// 千分位格式
new Intl.NumberFormat('zh-TW').format(1234567);
// "1,234,567"

// 貨幣格式
new Intl.NumberFormat('zh-TW', { 
  style: 'currency', 
  currency: 'TWD' 
}).format(1234);
// "NT$1,234"

// 百分比格式
new Intl.NumberFormat('zh-TW', { 
  style: 'percent' 
}).format(0.1234);
// "12%"

// 控制小數位數
new Intl.NumberFormat('zh-TW', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(1234.5);
// "1,234.50"
```

---

### 步驟 2：在元件中使用

修改 `app/page.tsx`：

```typescript
import { formatNumber } from '@/lib/formatters';

// 在表格中使用
<td className="text-right p-3 font-mono">
  {formatNumber(record.births)}
</td>
```

---

## 5.3 加入簡單的分析統計

### 步驟 1：建立統計元件

建立 `components/statistics.tsx`：

```typescript
'use client';

import { BirthRecord } from '@/types/birth-record';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  formatNumber, 
  formatPercent, 
  calculateGrowthRate 
} from '@/lib/formatters';

interface StatisticsProps {
  data: BirthRecord[];
}

export default function Statistics({ data }: StatisticsProps) {
  // 計算總出生人數
  const totalBirths = data.reduce((sum, record) => sum + record.births, 0);
  
  // 取得最新年份和去年的資料
  const latestYear = data[data.length - 1];
  const previousYear = data[data.length - 2];
  
  // 計算年增長率
  const growthRate = calculateGrowthRate(
    latestYear.births, 
    previousYear.births
  );
  
  // 找出最高和最低年份
  const maxYear = data.reduce((max, record) => 
    record.births > max.births ? record : max
  );
  
  const minYear = data.reduce((min, record) => 
    record.births < min.births ? record : min
  );
  
  // 計算平均值
  const avgBirths = Math.round(totalBirths / data.length);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 總出生人數 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            總出生人數
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            {formatNumber(totalBirths)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            2016-2025 年累計
          </p>
        </CardContent>
      </Card>

      {/* 最新數據 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            最新數據 ({latestYear.year})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            {formatNumber(latestYear.births)}
          </div>
          <p className={`text-xs mt-1 flex items-center ${
            growthRate < 0 ? 'text-red-500' : 'text-green-500'
          }`}>
            <span className="text-lg mr-1">
              {growthRate < 0 ? '↓' : '↑'}
            </span>
            {formatPercent(Math.abs(growthRate))} 相較去年
          </p>
        </CardContent>
      </Card>

      {/* 歷史最高 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            歷史最高
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            {formatNumber(maxYear.births)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {maxYear.year} 年
          </p>
        </CardContent>
      </Card>

      {/* 歷史最低 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            歷史最低
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800">
            {formatNumber(minYear.births)}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {minYear.year} 年
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 程式碼解析

#### 1. reduce 方法計算總和

```typescript
const total = data.reduce((sum, record) => sum + record.births, 0);
```

**運作方式**：
```
初始值: 0
第1次: 0 + 208440 = 208440
第2次: 208440 + 193844 = 402284
...
最終結果: 總和
```

---

#### 2. 陣列取值

```typescript
const latestYear = data[data.length - 1];  // 最後一筆
const previousYear = data[data.length - 2]; // 倒數第二筆
```

---

#### 3. 條件樣式

```typescript
className={`text-xs mt-1 ${
  growthRate < 0 ? 'text-red-500' : 'text-green-500'
}`}
```

**結果**：
- 負成長 → 紅色
- 正成長 → 綠色

---

### 步驟 2：整合到首頁

修改 `app/page.tsx`，加入統計元件：

```typescript
import Statistics from '@/components/statistics';

export default async function Home() {
  const birthData = await getBirthData();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gray-800">
            台灣出生率趨勢儀表板
          </h1>
          <p className="text-gray-600">
            2016-2025 年新生兒數據視覺化分析
          </p>
        </div>
        
        {/* 統計卡片 */}
        <Statistics data={birthData} />
        
        {/* 圖表卡片 */}
        <Card className="mb-8">
          {/* ... */}
        </Card>

        {/* 資料表格卡片 */}
        <Card>
          {/* ... */}
        </Card>
      </div>
    </main>
  );
}
```

---

## 🎨 進階 UI 優化

### 優化 1：加入 Favicon

建立或替換 `app/favicon.ico`，讓瀏覽器標籤顯示你的圖示。

---

### 優化 2：加入 Loading 動畫

修改 `app/loading.tsx`，使用 Card 元件：

```typescript
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Loading() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse mb-8">
          <div className="h-12 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
        
        {/* 統計卡片骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* 圖表骨架 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] bg-gray-100 rounded"></div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
```

---

### 優化 3：Metadata（SEO）

修改 `app/page.tsx`，加入 metadata：

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '台灣出生率趨勢儀表板 | Taiwan Birth Trends Dashboard',
  description: '視覺化呈現 2016-2025 年台灣新生兒數據，分析出生率趨勢與人口變化。Data visualization of Taiwan birth rate trends from 2016 to 2025.',
  keywords: [
    '台灣',
    '出生率',
    '人口統計',
    '數據視覺化',
    'Taiwan',
    'Birth Rate',
    'Demographics',
    'Data Visualization'
  ],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: '台灣出生率趨勢儀表板',
    description: '視覺化呈現 2016-2025 年台灣新生兒數據',
    type: 'website',
  },
};

export default async function Home() {
  // ...
}
```

---

## ✅ 本章檢核清單

完成以下項目，確保你已掌握本章內容：

- [ ] 成功安裝 shadcn/ui
- [ ] 使用 Card 元件重構介面
- [ ] 建立格式化工具模組
- [ ] 實作統計分析元件
- [ ] 優化載入狀態顯示
- [ ] 加入 Metadata
- [ ] 測試回應式設計
- [ ] 確認各項數據計算正確

---

## 📚 延伸學習

### 推薦閱讀

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)

### 進階主題

1. **深色模式**：實作亮色/深色主題切換
2. **動畫效果**：使用 Framer Motion
3. **更多元件**：探索 shadcn/ui 的其他元件

---

## 🎉 恭喜完成第五章！

你已經成功：
- ✅ 引入專業的 UI 元件庫
- ✅ 實作數據統計分析
- ✅ 提升整體使用者體驗

**下一步**：前往 [第六章：部署與維運](../chapter-06-deployment/README.md)，將你的作品發布到網路上！
