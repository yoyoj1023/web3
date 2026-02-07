# 第五章：前端開發與資料視覺化

## 學習目標
在這一章中，你將學會：
- 安裝並配置 Recharts 圖表庫
- 理解 Server Component 與 Client Component 的差異
- 建立互動式折線圖組件
- 實作響應式設計（RWD）
- 美化 UI，打造專業儀表板

---

## 5.1 為什麼需要視覺化？

### 表格 vs 圖表

看看同樣的資料，兩種呈現方式的差異：

#### 表格呈現
```
年份 | 出生人數
----|----------
2016 | 208,440
2017 | 193,844
2018 | 181,601
...
```

**優點**：精確、可查詢特定數值  
**缺點**：難以快速看出趨勢

#### 圖表呈現（折線圖）
```
📈 明確顯示：
- 整體下降趨勢
- 2020-2021 下降速度加快
- 2025 年有異常大幅下降
```

**優點**：一目了然、發現異常值、視覺衝擊力強  
**缺點**：不適合精確數值查詢

### 最佳實踐：圖表 + 表格

我們會在同一個頁面提供：
1. **圖表**：快速理解趨勢
2. **統計卡片**：關鍵指標一目了然
3. **表格**：精確數值查詢

---

## 5.2 選擇圖表庫：Recharts

### React 圖表庫比較

| 圖表庫 | 優點 | 缺點 | 適用場景 |
|--------|------|------|---------|
| **Recharts** | 簡單易用、元件化、文件完整 | 客製化能力中等 | 商業儀表板、數據展示（我們的選擇）|
| Chart.js | 功能強大、彈性高 | API 較複雜、非 React 風格 | 需要高度客製化 |
| Victory | 功能豐富、動畫效果好 | Bundle 較大 | 複雜圖表需求 |
| Nivo | 美觀、動畫流暢 | 學習曲線陡峭 | 追求美觀度 |

### Recharts 的優勢

✅ **聲明式 API**：像寫 JSX 一樣簡單  
✅ **內建響應式**：自動適應容器大小  
✅ **TypeScript 支援**：完整的型別定義  
✅ **互動功能**：Tooltip、Legend、縮放等  
✅ **文件完整**：豐富的範例和教學  

---

## 5.3 安裝 Recharts

在專案根目錄執行：

```bash
npm install recharts
```

安裝完成後，檢查 `package.json`：

```json
{
  "dependencies": {
    "next": "14.x.x",
    "react": "^18",
    "postgres": "^3.4.4",
    "recharts": "^2.10.0"
  }
}
```

---

## 5.4 理解 Server Component 與 Client Component

### Next.js 14 的核心概念

在 App Router 中，Component 預設是 **Server Component**，但某些情況需要 **Client Component**。

#### Server Component（預設）

```typescript
// app/page.tsx（沒有 'use client'）
export default async function Home() {
  const data = await getBirthData(); // ✅ 可以直接查詢資料庫
  return <div>{data.length}</div>;
}
```

**特性**：
- ✅ 可以直接存取資料庫
- ✅ 可以使用 `async/await`
- ✅ 不會被包含在 JavaScript bundle 中（更小的 bundle）
- ❌ 不能使用 React Hooks（`useState`、`useEffect` 等）
- ❌ 不能處理瀏覽器事件（`onClick`、`onChange` 等）

#### Client Component（需明確宣告）

```typescript
'use client'; // 必須加這行！

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0); // ✅ 可以使用 Hooks
  return <button onClick={() => setCount(count + 1)}>{count}</button>; // ✅ 可以處理事件
}
```

**特性**：
- ✅ 可以使用 React Hooks
- ✅ 可以處理瀏覽器事件
- ✅ 可以使用瀏覽器 API（`window`、`localStorage` 等）
- ❌ 不能直接存取資料庫
- ❌ 會被包含在 JavaScript bundle 中

### 為什麼 Recharts 需要 Client Component？

Recharts 需要：
1. **互動功能**：Hover 顯示 Tooltip
2. **動畫效果**：圖表出現時的動畫
3. **響應式**：偵測容器大小變化（使用 `ResizeObserver`）

這些都需要在瀏覽器中執行，因此必須是 Client Component。

### 最佳實踐：Server + Client 搭配

```typescript
// app/page.tsx（Server Component）
export default async function Home() {
  const data = await getBirthData(); // 在伺服器端查詢資料
  return <BirthChart data={data} />;  // 傳給 Client Component
}

// components/BirthChart.tsx（Client Component）
'use client';
export function BirthChart({ data }) {
  return <LineChart data={data}>...</LineChart>; // 在客戶端繪製圖表
}
```

**優勢**：
- 資料查詢在伺服器端（快速、安全）
- 圖表渲染在客戶端（互動、動畫）
- 最小化 JavaScript bundle（只有圖表相關程式碼在客戶端）

---

## 5.5 建立折線圖組件

### 步驟 1：建立 `components` 目錄

```bash
mkdir components
```

### 步驟 2：建立 `components/BirthChart.tsx`

```typescript
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BirthRecord {
  year: number;
  births: number;
}

interface BirthChartProps {
  data: BirthRecord[];
}

export default function BirthChart({ data }: BirthChartProps) {
  // 格式化資料：Recharts 需要物件陣列
  const chartData = data.map(record => ({
    year: record.year,
    births: record.births,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">出生人數趨勢圖</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {/* 背景網格 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          {/* X 軸（年份）*/}
          <XAxis 
            dataKey="year" 
            stroke="#666"
            style={{ fontSize: '14px' }}
          />
          
          {/* Y 軸（出生人數）*/}
          <YAxis 
            stroke="#666"
            style={{ fontSize: '14px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          
          {/* 滑鼠懸停提示 */}
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString(), '出生人數']}
            labelFormatter={(label) => `${label} 年`}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)', 
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          
          {/* 圖例 */}
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* 折線 */}
          <Line 
            type="monotone"
            dataKey="births" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5 }}
            activeDot={{ r: 7 }}
            name="出生人數"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 程式碼解析

#### 1. `'use client'` 指令
```typescript
'use client';
```
**必須**放在檔案最頂端，告訴 Next.js 這是 Client Component。

#### 2. ResponsiveContainer
```typescript
<ResponsiveContainer width="100%" height={400}>
```
**作用**：
- 圖表會自動適應父容器寬度
- 固定高度 400px（也可以設為百分比）

#### 3. CartesianGrid（網格）
```typescript
<CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
```
- `strokeDasharray="3 3"`：虛線效果（3px 實線、3px 空白）
- `stroke="#e0e0e0"`：淺灰色

#### 4. XAxis 和 YAxis（座標軸）
```typescript
<XAxis dataKey="year" />
<YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
```
- `dataKey="year"`：X 軸顯示 `year` 欄位
- `tickFormatter`：格式化 Y 軸標籤（208440 → 208k）

#### 5. Tooltip（滑鼠懸停提示）
```typescript
<Tooltip 
  formatter={(value: number) => [value.toLocaleString(), '出生人數']}
  labelFormatter={(label) => `${label} 年`}
/>
```
**效果**：
```
2016 年
出生人數: 208,440
```

#### 6. Line（折線）
```typescript
<Line 
  type="monotone"       // 平滑曲線
  dataKey="births"      // 資料來源
  stroke="#3b82f6"      // 線條顏色（藍色）
  strokeWidth={3}       // 線條寬度
  dot={{ fill: '#3b82f6', r: 5 }}  // 資料點樣式
/>
```

---

## 5.6 整合圖表到首頁

### 修改 `app/page.tsx`

```typescript
import { getBirthData, getBirthStats } from '@/lib/data';
import BirthChart from '@/components/BirthChart';

export default async function Home() {
  const [birthData, stats] = await Promise.all([
    getBirthData(),
    getBirthStats(),
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            台灣出生人口趨勢 📊
          </h1>
          <p className="text-gray-600 text-lg">
            資料年份：{birthData[0].year} - {birthData[birthData.length - 1].year}
          </p>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="資料年數" 
            value={stats.total_years} 
            icon="📅"
          />
          <StatCard 
            title="平均出生數" 
            value={stats.avg_births.toLocaleString()} 
            icon="👶"
          />
          <StatCard 
            title="最高記錄" 
            value={`${stats.max_births.toLocaleString()} (2016)`}
            icon="📈"
          />
          <StatCard 
            title="最低記錄" 
            value={`${stats.min_births.toLocaleString()} (2025)`}
            icon="📉"
          />
        </div>

        {/* Birth Chart */}
        <div className="mb-8">
          <BirthChart data={birthData} />
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">詳細數據</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    年份
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    出生人數
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    年變化
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    變化率
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
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
                        {record.births.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono ${
                        change === null ? 'text-gray-400' : 
                        change > 0 ? 'text-green-600 font-semibold' : 
                        'text-red-600 font-semibold'
                      }`}>
                        {change === null ? '-' : (
                          <span>
                            {change > 0 ? '+' : ''}{change.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                        changePercent === null ? 'text-gray-400' : 
                        parseFloat(changePercent) > 0 ? 'text-green-600' : 
                        'text-red-600'
                      }`}>
                        {changePercent === null ? '-' : `${changePercent}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>資料來源：台灣內政部戶政司</p>
          <p className="mt-1">Built with Next.js 14 + Neon PostgreSQL + Recharts</p>
        </footer>
      </div>
    </main>
  );
}

// Statistics Card Component
function StatCard({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: string | number; 
  icon: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
```

### UI 改進說明

#### 1. 漸層背景
```typescript
className="bg-gradient-to-br from-blue-50 to-indigo-100"
```
淺藍到淺紫的漸層，提升視覺質感。

#### 2. 響應式網格
```typescript
className="grid grid-cols-2 lg:grid-cols-4 gap-4"
```
- 手機：2 欄
- 桌機（lg 以上）：4 欄

#### 3. Hover 效果
```typescript
className="hover:bg-gray-50 transition-colors"
```
滑鼠移到表格列時，背景色會變化。

#### 4. 圖示 Emoji
使用 Emoji 增加視覺趣味性（也可以改用 Icon 庫如 Heroicons）。

---

## 5.7 進階圖表功能

### 功能 1：添加區域填充

修改 `components/BirthChart.tsx`：

```typescript
import { LineChart, Line, Area, AreaChart, ... } from 'recharts';

// 將 LineChart 改為 AreaChart
<AreaChart data={chartData} ...>
  <CartesianGrid ... />
  <XAxis ... />
  <YAxis ... />
  <Tooltip ... />
  <Legend ... />
  
  {/* 改用 Area 組件 */}
  <Area
    type="monotone"
    dataKey="births"
    stroke="#3b82f6"
    fill="url(#colorBirths)"
    strokeWidth={3}
    name="出生人數"
  />
  
  {/* 定義漸層 */}
  <defs>
    <linearGradient id="colorBirths" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
    </linearGradient>
  </defs>
</AreaChart>
```

**效果**：折線下方會有藍色漸層填充。

### 功能 2：添加參考線（平均值）

```typescript
import { LineChart, Line, ReferenceLine, ... } from 'recharts';

<LineChart ...>
  {/* 其他組件 ... */}
  
  {/* 平均值參考線 */}
  <ReferenceLine 
    y={stats.avg_births} 
    stroke="red" 
    strokeDasharray="3 3"
    label={{ value: `平均: ${stats.avg_births.toLocaleString()}`, position: 'right' }}
  />
</LineChart>
```

**問題**：需要從父組件傳入 `stats`。

修改 `components/BirthChart.tsx` 的 Props：

```typescript
interface BirthChartProps {
  data: BirthRecord[];
  avgBirths?: number; // 選填
}

export default function BirthChart({ data, avgBirths }: BirthChartProps) {
  // ...
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <ResponsiveContainer ...>
        <LineChart ...>
          {/* ... */}
          {avgBirths && (
            <ReferenceLine 
              y={avgBirths} 
              stroke="red" 
              strokeDasharray="3 3"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

在 `app/page.tsx` 中傳入：

```typescript
<BirthChart data={birthData} avgBirths={stats.avg_births} />
```

### 功能 3：添加縮放功能（選修）

```typescript
import { Brush } from 'recharts';

<LineChart ...>
  {/* 其他組件 ... */}
  
  {/* 底部縮放滑桿 */}
  <Brush 
    dataKey="year" 
    height={30} 
    stroke="#3b82f6"
  />
</LineChart>
```

**效果**：使用者可以拖曳滑桿來縮放特定年份範圍。

---

## 5.8 測試與優化

### 步驟 1：啟動開發伺服器

```bash
npm run dev
```

### 步驟 2：測試響應式設計

1. 開啟 Chrome DevTools（F12）
2. 點擊「Toggle device toolbar」（Ctrl + Shift + M）
3. 測試不同裝置尺寸：
   - iPhone SE（375px）
   - iPad（768px）
   - Desktop（1920px）

確認：
- 圖表會自動調整寬度
- 統計卡片在手機顯示 2 欄，桌機顯示 4 欄
- 表格可以橫向捲動（不破版）

### 步驟 3：測試圖表互動

1. 滑鼠移到圖表線上，確認 Tooltip 正常顯示
2. 確認 Tooltip 顯示格式化的數字（208,440 而非 208440）
3. 確認圖例可以點擊隱藏/顯示線條（Recharts 預設功能）

### 步驟 4：效能檢查

開啟 Chrome DevTools → Performance Tab：

1. 點擊「Record」
2. 重新整理頁面
3. 停止錄製
4. 查看 Metrics：
   - **FCP (First Contentful Paint)**：應該 < 1.5s
   - **LCP (Largest Contentful Paint)**：應該 < 2.5s

---

## 5.9 無障礙優化（Accessibility）

### 為圖表添加說明文字

```typescript
export default function BirthChart({ data }: BirthChartProps) {
  const trend = data[0].births > data[data.length - 1].births ? '下降' : '上升';
  const trendPercent = (
    ((data[data.length - 1].births - data[0].births) / data[0].births) * 100
  ).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-2">出生人數趨勢圖</h2>
      
      {/* 無障礙說明 */}
      <p className="text-sm text-gray-600 mb-4" role="note">
        本圖表顯示 {data[0].year} 至 {data[data.length - 1].year} 年的台灣出生人數趨勢。
        整體呈現 <strong>{trend}</strong> 趨勢，
        變化率為 <strong>{trendPercent}%</strong>。
      </p>
      
      <ResponsiveContainer ...>
        {/* 圖表組件 */}
      </ResponsiveContainer>
    </div>
  );
}
```

### 為表格添加 Caption

```typescript
<table className="min-w-full">
  <caption className="sr-only">
    台灣 2016-2025 年出生人數統計表，包含年份、出生人數、年變化和變化率
  </caption>
  <thead>...</thead>
  <tbody>...</tbody>
</table>
```

`sr-only` 是 Tailwind 的 class，表示「只給螢幕閱讀器看」。

---

## 本章小結

恭喜你完成第五章！你已經學會了：

### 核心技能
✅ 安裝並配置 Recharts 圖表庫  
✅ 理解 Server Component 與 Client Component 的差異與搭配  
✅ 建立互動式折線圖組件  
✅ 實作響應式設計（手機、平板、桌機）  
✅ 美化 UI，使用 Tailwind CSS  
✅ 添加無障礙功能（Accessibility）  

### 輸出成果
```
tw-birth-tracker/
├── components/
│   └── BirthChart.tsx     # 互動式圖表組件
├── app/
│   └── page.tsx           # 完整的儀表板頁面
└── lib/
    └── data.ts            # 資料存取層
```

### 完整資料流程

```
1. 使用者請求頁面 (/)
2. Server Component (page.tsx) 執行
3. 查詢資料庫 (getBirthData)
4. 在伺服器端渲染 HTML
5. 傳送 HTML + 最小化的 JavaScript 到瀏覽器
6. 瀏覽器執行 Client Component (BirthChart)
7. Recharts 繪製互動式圖表
8. 使用者可以 Hover 查看詳細數據
```

### 技術亮點

#### 1. 混合式渲染（Hybrid Rendering）
- Server Component：資料查詢、初始 HTML
- Client Component：互動功能、動畫效果

#### 2. 效能優化
- 並行查詢（Promise.all）
- 最小化 JavaScript bundle
- 伺服器端渲染（SSR）

#### 3. 使用者體驗
- 響應式設計（RWD）
- 互動式圖表（Tooltip）
- 視覺化趨勢（一目了然）

---

## 下一章預告

在第六章，我們將會：
- 將專案推送到 GitHub
- 在 Vercel 部署應用程式
- 設定環境變數（DATABASE_URL）
- 測試正式環境
- 設定自訂網域（選修）

**準備好將你的作品上線了嗎？** 🚀

---

## 進階挑戰

### 挑戰 1：添加多條折線

如果資料表有「死亡人數」欄位，可以在同一張圖顯示：

```typescript
<Line dataKey="births" stroke="#3b82f6" name="出生人數" />
<Line dataKey="deaths" stroke="#ef4444" name="死亡人數" />
```

### 挑戰 2：添加長條圖（Bar Chart）

```typescript
import { BarChart, Bar } from 'recharts';

<BarChart data={chartData}>
  <CartesianGrid ... />
  <XAxis dataKey="year" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="births" fill="#3b82f6" />
</BarChart>
```

### 挑戰 3：添加圓餅圖（年齡層分布）

如果有年齡層資料：

```typescript
import { PieChart, Pie, Cell } from 'recharts';

const ageData = [
  { name: '0-14歲', value: 2500000 },
  { name: '15-64歲', value: 15000000 },
  { name: '65歲以上', value: 3500000 },
];

<PieChart>
  <Pie data={ageData} dataKey="value" nameKey="name" label />
</PieChart>
```

下一章見！ 🎨
