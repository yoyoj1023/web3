# 第四章：數據視覺化與圖表實作

> **學習目標**：將枯燥的數字轉化為直觀的折線圖

---

## 📋 本章概述

在這一章中，你將學會：
- 安裝並設定 Recharts 圖表庫
- 繪製折線圖並客製化樣式
- 實作互動式 Tooltip
- 確保圖表在各種螢幕尺寸下的回應式顯示

---

## 4.1 安裝與配置 Recharts

### 為什麼選擇 Recharts？

市面上有許多圖表庫，我們選擇 Recharts 的原因：

| 圖表庫 | 優點 | 缺點 | 推薦度 |
|--------|------|------|--------|
| **Recharts** | React 原生、組合式、簡單 | 效能較低 | ⭐⭐⭐⭐⭐ |
| Chart.js | 功能強大 | 需要額外包裝 | ⭐⭐⭐⭐ |
| D3.js | 超強客製化 | 學習曲線陡峭 | ⭐⭐⭐ |
| Victory | 動畫豐富 | 體積較大 | ⭐⭐⭐⭐ |

**Recharts 的特色**：
- ✅ React 組件化設計
- ✅ 聲明式 API（Declarative API）
- ✅ 內建回應式支援
- ✅ 豐富的圖表類型
- ✅ 良好的 TypeScript 支援

---

### 步驟 1：安裝 Recharts

在終端機執行：

```bash
npm install recharts
```

等待安裝完成：

```
added 5 packages, and audited xxx packages in 4s
```

---

### 步驟 2：理解 Client Components vs Server Components

**重要觀念**：圖表必須是 Client Component！

**為什麼？**

| 需求 | Server Component | Client Component |
|-----|------------------|------------------|
| 互動（hover、click）| ❌ | ✅ |
| 瀏覽器 API（window）| ❌ | ✅ |
| React Hooks | ❌ | ✅ |
| 即時更新 | ❌ | ✅ |

**架構設計**：

```
app/page.tsx (Server Component)
    ↓ 獲取資料
    ↓ 傳遞給子元件
components/birth-chart.tsx (Client Component)
    ↓ 渲染圖表
    ↓ 處理互動
```

---

## 4.2 繪製折線圖

### 步驟 1：建立圖表元件

建立 `components/birth-chart.tsx`：

```typescript
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BirthRecord } from '@/types/birth-record';

interface BirthChartProps {
  data: BirthRecord[];
}

export default function BirthChart({ data }: BirthChartProps) {
  // 轉換資料格式給 Recharts 使用
  const chartData = data.map((record) => ({
    year: record.year.toString(),
    births: record.births,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year"
            label={{ value: '年份', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: '出生人數', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => value.toLocaleString('zh-TW')}
          />
          <Tooltip
            formatter={(value: number) => [
              value.toLocaleString('zh-TW') + ' 人',
              '出生人數'
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="births"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="出生人數"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 程式碼詳解

#### 1. 'use client' 指令

```typescript
'use client';
```

**必須放在檔案最頂端**（在 import 之前），告訴 Next.js 這是 Client Component。

---

#### 2. 資料轉換

```typescript
const chartData = data.map((record) => ({
  year: record.year.toString(),  // 轉換為字串
  births: record.births,
}));
```

**為什麼要轉換？**
- Recharts 的 XAxis 通常使用字串類型
- 簡化資料結構，只保留需要的欄位

---

#### 3. ResponsiveContainer

```typescript
<ResponsiveContainer width="100%" height="100%">
```

**功能**：
- 圖表自動適應容器大小
- 支援百分比和固定尺寸
- 必須有明確的高度（容器或 ResponsiveContainer）

---

#### 4. CartesianGrid（網格線）

```typescript
<CartesianGrid strokeDasharray="3 3" />
```

**屬性說明**：
- `strokeDasharray="3 3"`：虛線樣式（3px 線段 + 3px 間隔）
- 可以移除此元件來隱藏網格線

---

#### 5. XAxis（X 軸）

```typescript
<XAxis 
  dataKey="year"
  label={{ value: '年份', position: 'insideBottom', offset: -5 }}
/>
```

**屬性說明**：
- `dataKey`：對應資料中的欄位名稱
- `label`：軸標籤
  - `value`：顯示文字
  - `position`：位置
  - `offset`：偏移量

---

#### 6. YAxis（Y 軸）

```typescript
<YAxis
  label={{ value: '出生人數', angle: -90, position: 'insideLeft' }}
  tickFormatter={(value) => value.toLocaleString('zh-TW')}
/>
```

**屬性說明**：
- `angle: -90`：標籤旋轉 90 度
- `tickFormatter`：格式化刻度值
  - 例如：`208440` → `208,440`

---

#### 7. Tooltip（提示框）

```typescript
<Tooltip
  formatter={(value: number) => [
    value.toLocaleString('zh-TW') + ' 人',
    '出生人數'
  ]}
/>
```

**formatter 回傳值**：
```typescript
[顯示的值, 標籤]
```

**效果**：滑鼠移到資料點時，顯示「出生人數: 208,440 人」

---

#### 8. Line（折線）

```typescript
<Line
  type="monotone"           // 平滑曲線
  dataKey="births"          // 資料欄位
  stroke="#2563eb"          // 線條顏色（藍色）
  strokeWidth={2}           // 線條寬度
  dot={{ r: 4 }}           // 資料點半徑
  activeDot={{ r: 6 }}     // 滑鼠 hover 時的資料點半徑
  name="出生人數"           // 圖例名稱
/>
```

**type 選項**：
- `monotone`：平滑曲線
- `linear`：直線連接
- `step`：階梯狀
- `basis`：貝茲曲線

---

### 步驟 2：整合到首頁

修改 `app/page.tsx`：

```typescript
import { getBirthData } from '@/lib/get-birth-data';
import BirthChart from '@/components/birth-chart';

export default async function Home() {
  const birthData = await getBirthData();

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          台灣出生率趨勢儀表板
        </h1>
        
        {/* 圖表區塊 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">
            歷年出生人數趨勢
          </h2>
          <BirthChart data={birthData} />
        </div>

        {/* 資料表格 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            詳細資料
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
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-3">{record.year}</td>
                    <td className="text-right p-3">
                      {record.births.toLocaleString('zh-TW')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
```

---

### 步驟 3：測試圖表

1. 確保開發伺服器正在運行
2. 開啟 `http://localhost:3000`
3. 你應該會看到：
   - 一個藍色的折線圖
   - 滑鼠移到資料點時顯示詳細資訊
   - 圖表顯示清楚的下降趨勢

---

## 4.3 回應式設計

### 步驟 1：調整不同螢幕尺寸

修改 `components/birth-chart.tsx` 的容器高度：

```typescript
<div className="w-full h-[300px] md:h-[400px] lg:h-[500px]">
```

**Tailwind CSS 斷點**：

| 類別 | 螢幕寬度 | 裝置 |
|-----|---------|------|
| （預設）| < 640px | 手機 |
| `md:` | ≥ 768px | 平板 |
| `lg:` | ≥ 1024px | 筆電 |
| `xl:` | ≥ 1280px | 桌機 |

---

### 步驟 2：調整手機版邊距

修改 `app/page.tsx`：

```typescript
<main className="min-h-screen p-4 md:p-8 bg-gray-50">
  <div className="max-w-6xl mx-auto">
    <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-800">
      台灣出生率趨勢儀表板
    </h1>
    {/* ... */}
  </div>
</main>
```

---

### 步驟 3：優化手機版圖表

修改 `components/birth-chart.tsx`：

```typescript
export default function BirthChart({ data }: BirthChartProps) {
  const chartData = data.map((record) => ({
    year: record.year.toString(),
    births: record.births,
  }));

  return (
    <div className="w-full h-[300px] md:h-[400px] lg:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ 
            top: 5, 
            right: 10,      // 手機版縮小右邊距
            left: 0,        // 手機版縮小左邊距
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year"
            label={{ 
              value: '年份', 
              position: 'insideBottom', 
              offset: -5 
            }}
            tick={{ fontSize: 12 }}  // 調整字體大小
          />
          <YAxis
            label={{ 
              value: '出生人數', 
              angle: -90, 
              position: 'insideLeft' 
            }}
            tickFormatter={(value) => {
              // 手機版顯示簡化版（例如：20.8萬）
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                return `${(value / 10000).toFixed(1)}萬`;
              }
              return value.toLocaleString('zh-TW');
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [
              value.toLocaleString('zh-TW') + ' 人',
              '出生人數'
            ]}
            contentStyle={{ fontSize: '14px' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
          />
          <Line
            type="monotone"
            dataKey="births"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="出生人數"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

### 步驟 4：測試回應式設計

**桌面測試**：
1. 開啟開發者工具（F12）
2. 切換到「裝置模擬」模式
3. 選擇不同裝置（iPhone, iPad, etc.）
4. 確認圖表在各種尺寸下都能正常顯示

---

## 🎨 圖表客製化

### 客製化 1：改變顏色主題

```typescript
<Line
  stroke="#10b981"        // 綠色
  // 或
  stroke="#ef4444"        // 紅色
  // 或
  stroke="#8b5cf6"        // 紫色
/>
```

**Tailwind CSS 顏色參考**：
- Blue: `#2563eb`
- Green: `#10b981`
- Red: `#ef4444`
- Purple: `#8b5cf6`
- Orange: `#f59e0b`

---

### 客製化 2：漸層填充

```typescript
<defs>
  <linearGradient id="colorBirths" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
  </linearGradient>
</defs>
<Area
  type="monotone"
  dataKey="births"
  stroke="#2563eb"
  fillOpacity={1}
  fill="url(#colorBirths)"
/>
```

---

### 客製化 3：多條折線

如果有多組資料：

```typescript
<Line
  type="monotone"
  dataKey="births"
  stroke="#2563eb"
  name="出生人數"
/>
<Line
  type="monotone"
  dataKey="deaths"
  stroke="#ef4444"
  name="死亡人數"
/>
```

---

### 客製化 4：客製化 Tooltip

```typescript
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-800">{label} 年</p>
        <p className="text-blue-600">
          出生人數：{payload[0].value.toLocaleString('zh-TW')} 人
        </p>
      </div>
    );
  }
  return null;
};

// 在 LineChart 中使用
<Tooltip content={<CustomTooltip />} />
```

---

## 🎯 實作練習

### 練習 1：加入區域圖（Area Chart）

將折線圖改為區域圖：

```typescript
import { AreaChart, Area } from 'recharts';

<AreaChart data={chartData}>
  {/* 其他設定相同 */}
  <Area
    type="monotone"
    dataKey="births"
    stroke="#2563eb"
    fill="#2563eb"
    fillOpacity={0.3}
  />
</AreaChart>
```

---

### 練習 2：加入柱狀圖（Bar Chart）

```typescript
import { BarChart, Bar } from 'recharts';

<BarChart data={chartData}>
  {/* 其他設定相同 */}
  <Bar 
    dataKey="births" 
    fill="#2563eb"
    radius={[8, 8, 0, 0]}  // 圓角
  />
</BarChart>
```

---

### 練習 3：混合圖表

同時顯示柱狀圖和折線圖：

```typescript
import { ComposedChart, Bar, Line } from 'recharts';

<ComposedChart data={chartData}>
  <Bar dataKey="births" fill="#2563eb" />
  <Line type="monotone" dataKey="births" stroke="#ef4444" />
</ComposedChart>
```

---

## ✅ 本章檢核清單

完成以下項目，確保你已掌握本章內容：

- [ ] 成功安裝 Recharts
- [ ] 理解 Client Component 的使用時機
- [ ] 建立 BirthChart 元件
- [ ] 正確設定 ResponsiveContainer
- [ ] 客製化 XAxis 和 YAxis
- [ ] 實作互動式 Tooltip
- [ ] 實現回應式設計
- [ ] 能夠修改圖表顏色和樣式

---

## 📚 延伸學習

### 推薦閱讀

- [Recharts 官方文件](https://recharts.org/en-US/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [Data Visualization Best Practices](https://www.tableau.com/learn/articles/data-visualization)

### 進階主題

1. **動畫效果**：加入進場動畫
2. **資料篩選**：實作互動式日期範圍選擇
3. **多圖表儀表板**：同時顯示多種圖表類型

---

## 🎉 恭喜完成第四章！

你已經成功：
- ✅ 安裝並設定 Recharts
- ✅ 繪製專業的折線圖
- ✅ 實作回應式設計

**下一步**：前往 [第五章：UI 精修與使用者體驗](../chapter-05-ui-enhancement/README.md)，讓專案看起來更專業！
