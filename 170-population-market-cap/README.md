這是一份為你量身打造的**「台灣出生率數據視覺化」全端實戰課程**。

本課程分為 6 個章節，從環境建置到最後的雲端部署，每一步都對應一個實質的進度產出。

> 📖 **第一次學習？** 請先閱讀 [開始學習指南](./GETTING_STARTED.md) 了解課前準備與學習路徑。

---

# 專案名稱：Taiwan Birth Trends Dashboard
**目標**：建立一個能夠自動從資料庫抓取數據，並以現代化圖表呈現台灣歷年新生兒趨勢的 Web App。

---

## 📅 第一階段：資料建模與資料庫建置
**目標：將圖片中的死資料轉化為可查詢的結構化數據。**

*   **1.1 資料清洗 (Data Structuring)**：
    *   將圖片中的數據整理成 JSON 或 CSV 格式。
    *   理解資料型別：`year` (integer), `births` (integer)。
*   **1.2 雲端資料庫託管 (Database Hosting)**：
    *   註冊並使用 **Supabase** (推薦) 或 **Neon**。
    *   學習使用 SQL 介面建立 `birth_records` 資料表。
*   **1.3 資料匯入 (Seeding)**：
    *   撰寫 SQL `INSERT` 語句將 2016-2025 的數據寫入資料庫。

---

## 🏗️ 第二階段：Next.js 專案架構與資料庫連線
**目標：建立專案骨架，並確保後端能抓到資料。**

*   **2.1 初始化 Next.js**：
    *   使用 `npx create-next-app@latest` (選擇 TypeScript, Tailwind CSS, App Router)。
*   **2.2 環境變數管理 (Security)**：
    *   學習 `.env.local` 的使用，安全儲存資料庫連線字串 (Database URL)。
*   **2.3 設定 Postgres 連線用戶端**：
    *   安裝 `postgres` (Postgres.js) 套件。
    *   封裝一個 `lib/db.ts` 模組，建立單例連線 (Singleton connection)。

---

## 📡 第三階段：伺服器端資料獲取 (Server-side Data Fetching)
**目標：利用 Next.js App Router 的優勢，從 Server 直接讀取數據。**

*   **3.1 Server Components 實作**：
    *   在 `app/page.tsx` 中編寫非同步函數 `getData()`。
    *   練習撰寫 SQL 查詢：`SELECT * FROM birth_records ORDER BY year ASC`。
*   **3.2 錯誤處理與載入狀態**：
    *   學習使用 `loading.tsx` 建立讀取中的骨架屏 (Skeleton Screen)。
    *   學習使用 `error.tsx` 處理連線失敗的情況。

---

## 📈 第四階段：數據視覺化與圖表實作
**目標：將枯燥的數字轉化為直觀的折線圖。**

*   **4.1 安裝與配置 Recharts**：
    *   學習為什麼圖表組件必須標註 `'use client'`。
*   **4.2 繪製折線圖 (Line Chart)**：
    *   配置 X 軸（年份）與 Y 軸（人數）。
    *   客製化 Tooltip（提示框），讓滑鼠移上去時顯示「XXX,XXX 人」。
*   **4.3 回應式設計 (Responsive Design)**：
    *   確保圖表在手機與電腦版都能完美顯示。

---

## 🎨 第五階段：UI 精修與使用者體驗
**目標：讓專案看起來像一個專業的產品。**

*   **5.1 引入 shadcn/ui (進階推薦)**：
    *   使用 Card 元件包裹圖表。
    *   美化字體與間距。
*   **5.2 數據格式化技巧**：
    *   學習使用 `Intl.NumberFormat` 處理千分位符號（例如將 208440 顯示為 208,440）。
*   **5.3 加入簡單的分析統計**：
    *   計算並顯示「總出生人數」或「與去年相比的增減率」。

---

## 🚀 第六階段：部署與維運
**目標：將你的作品發布到公網。**

*   **6.1 GitHub 整合**：
    *   建立 Repository 並推送程式碼。
*   **6.2 Vercel 自動部署**：
    *   連結 GitHub 與 Vercel。
    *   在 Vercel 後台設定 Environment Variables。
*   **6.3 效能優化 (Edge Caching)**：
    *   學習使用 `revalidate` 選項，讓資料庫數據快取在 Vercel 節點上，提升載入速度。

---

### 🏆 課程結束時，你將學會：
1.  **Full-stack 思維**：從 DB -> SQL -> API/Server Action -> UI 的流向。
2.  **Next.js 核心能力**：App Router, Server Components, Environment Variables。
3.  **數據處理能力**：如何處理原始資料並將其轉化為圖表。
4.  **現代化部署**：體驗 Vercel + 雲端資料庫的秒速開發流程。

---

## 📚 課程章節

本課程分為 6 個章節，每個章節都有獨立的目錄和詳細教材：

### [第一章：資料建模與資料庫建置](./chapter-01-data-modeling/)
- 資料清洗與結構化
- Supabase 雲端資料庫託管
- SQL 建表與資料匯入

### [第二章：Next.js 專案架構與資料庫連線](./chapter-02-nextjs-setup/)
- Next.js 專案初始化
- 環境變數安全管理
- PostgreSQL 連線設定

### [第三章：伺服器端資料獲取](./chapter-03-server-data-fetching/)
- Server Components 實作
- 型別安全的資料獲取
- 載入狀態與錯誤處理

### [第四章：數據視覺化與圖表實作](./chapter-04-data-visualization/)
- Recharts 圖表庫整合
- 折線圖繪製與客製化
- 回應式設計

### [第五章：UI 精修與使用者體驗](./chapter-05-ui-enhancement/)
- shadcn/ui 元件庫
- 數據格式化工具
- 統計分析功能

### [第六章：部署與維運](./chapter-06-deployment/)
- GitHub 版本控制
- Vercel 自動部署
- 效能優化策略

---

**準備好開始了嗎？從 [第一章](./chapter-01-data-modeling/) 開始你的學習之旅！**