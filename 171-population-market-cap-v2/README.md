這是一份為你量身打造的全端開發練習項目 Proposal。考慮到你已經熟悉 React/Next.js/Vercel，但希望深入後端資料庫整合（Neon + Postgres.js）以及從零到有的完整流程，這份課綱會著重在**資料庫操作**與**Next.js Server Component**的整合。

專案名稱：**TW-Birth-Tracker (台灣出生人口趨勢儀表板)**
技術堆疊：Next.js v14 (App Router), Neon (Serverless Postgres), Postgres.js, Recharts (視覺化), Vercel.

---

### 課程大綱總覽

1.  **資料準備與前處理 (Data Preparation)**
2.  **雲端資料庫建置 (Database Infrastructure)**
3.  **專案初始化與環境配置 (Project Setup)**
4.  **後端邏輯與資料庫連線 (Backend & DB Connection)**
5.  **前端開發與資料視覺化 (Frontend & Visualization)**
6.  **部署與生產環境配置 (Deployment)**

---

### 詳細章節內容

#### 第一章：資料準備與前處理
**目標**：將圖片中的非結構化數據轉換為程式可讀的格式。
*   **1.1 數據轉錄**：將圖片中的年份與出生人數手動轉錄為 JSON 或 CSV 格式。
    *   *練習點*：建立一個 `data.json` 檔案。
    *   *提示數據*：
        ```json
        [
          {"year": 2016, "births": 208440},
          {"year": 2017, "births": 193844},
          ...
          {"year": 2025, "births": 107812}
        ]
        ```
*   **1.2 資料格式思考**：思考資料庫 Schema 設計 (例如：`year` 是 Integer 還是 Date? `births` 是 Integer)。

#### 第二章：雲端資料庫建置 (Neon)
**目標**：學習 Serverless Postgres 的基礎操作。
*   **2.1 註冊 Neon**：前往 neon.tech 註冊帳號並建立一個新專案 (Project)。
*   **2.2 認識 SQL Editor**：在 Neon 後台使用 SQL Editor。
*   **2.3 建立資料表 (DDL)**：
    *   撰寫 SQL 語法建立 `taiwan_births` 資料表。
    *   *SQL 範例*：
        ```sql
        CREATE TABLE taiwan_births (
          id SERIAL PRIMARY KEY,
          year INT NOT NULL UNIQUE,
          births INT NOT NULL
        );
        ```
*   **2.4 匯入資料 (DML)**：
    *   方法 A (簡單)：使用 SQL `INSERT INTO` 語法將 JSON 數據手動插入。
    *   方法 B (進階)：利用 Neon 的 Import 功能或寫一個簡單的 Node.js script 讀取 JSON 並寫入 (建議初學者先用 SQL 語法手動 Insert 以熟悉 SQL)。

#### 第三章：專案初始化與環境配置
**目標**：建立 Next.js v14 專案並配置安全性設定。
*   **3.1 初始化 Next.js**：
    *   強制使用 v14 版本指令：`npx create-next-app@14 tw-birth-tracker`。
    *   選擇配置：TypeScript (Yes), Tailwind (Yes), App Router (Yes)。
*   **3.2 取得連線字串**：
    *   回到 Neon Dashboard，找到 **Connection String**。
    *   選擇 "Pooled connection" (適合 Serverless 環境)。
*   **3.3 環境變數配置 (.env)**：
    *   在專案根目錄建立 `.env.local`。
    *   設置變數：`DATABASE_URL=postgres://...`。
    *   *學習點*：為什麼不能把這個 URL commit 到 GitHub？(安全性意識)。

#### 第四章：後端邏輯與資料庫連線 (Postgres.js)
**目標**：在 Next.js 中使用 Postgres.js 連線並撈取資料。
*   **4.1 安裝依賴**：`npm install postgres`。
*   **4.2 建立資料庫連線模組 (Singleton Pattern)**：
    *   建立 `lib/db.js` (或 `.ts`)。
    *   設定 `postgres(process.env.DATABASE_URL)`。
    *   *重點*：確保開發環境下的 Hot Reload 不會造成連線數暴增 (Connection Leak)。
*   **4.3 撰寫資料獲取函數 (Data Access Layer)**：
    *   建立 `lib/actions.ts` 或直接在 Component 內。
    *   撰寫 `async function getBirthData()`。
    *   使用 SQL 查詢：`sql`select * from taiwan_births order by year asc``.

#### 第五章：前端開發與資料視覺化
**目標**：利用 Server Component 獲取資料，並透過 Client Component 畫圖。
*   **5.1 Server Component 資料獲取**：
    *   在 `app/page.tsx` 中直接呼叫 `getBirthData()`。
    *   先用 `<pre>{JSON.stringify(data, null, 2)}</pre>` 確認資料已成功從資料庫撈出。
*   **5.2 引入圖表庫**：
    *   安裝 Recharts (React 生態系中最熱門的圖表庫)：`npm install recharts`。
*   **5.3 建立折線圖組件 (Client Component)**：
    *   因為圖表需要互動 (Hover, Animation)，必須是 Client Component (`'use client'`)。
    *   建立 `components/BirthChart.tsx`。
    *   使用 `<LineChart>`，X軸設為 Year，Y軸設為 Births。
*   **5.4 整合顯示**：
    *   將 Server 端撈到的 Data 作為 props 傳給 `BirthChart` 組件。
    *   使用 Tailwind CSS 美化版面 (Card 樣式, 標題)。

#### 第六章：部署與全端生命週期
**目標**：將專案上線，體驗完整的 DevOps 流程。
*   **6.1 推送至 GitHub**：Git commit 與 push。
*   **6.2 Vercel 部署**：
    *   Import GitHub Repo。
    *   **關鍵步驟**：在 Vercel 的 Project Settings -> Environment Variables 中，填入 Neon 的 `DATABASE_URL`。
*   **6.3 驗證與測試**：確認線上網址能正常讀取資料庫並顯示圖表。
*   **6.4 (選修) 資料更新模擬**：
    *   試著在 Neon SQL Editor 新增一筆 2026 年的預測數據，重新整理網頁，看是否即時更新。

---

---

## 課程章節索引

所有課程章節已完成！點擊以下連結開始學習：

### 📚 正式課程內容

1. **[第一章：資料準備與前處理](./chapter-01-data-preparation.md)**
   - 數據轉錄與 JSON 格式
   - 資料庫 Schema 設計
   - 資料驗證與清理
   - 🎯 **輸出**：`data/taiwan-births.json`

2. **[第二章：雲端資料庫建置（Neon）](./chapter-02-neon-database.md)**
   - 註冊 Neon Serverless PostgreSQL
   - 使用 SQL Editor 建立資料表
   - 匯入資料與基礎 SQL 查詢
   - 資料庫安全性最佳實踐
   - 🎯 **輸出**：運行中的 PostgreSQL 資料庫

3. **[第三章：專案初始化與環境配置](./chapter-03-nextjs-setup.md)**
   - 建立 Next.js 14 專案（App Router）
   - 環境變數配置（`.env.local`）
   - `.gitignore` 安全設定
   - 專案結構說明
   - 🎯 **輸出**：完整的 Next.js 專案骨架

4. **[第四章：後端邏輯與資料庫連線](./chapter-04-backend-database.md)**
   - 安裝 postgres.js
   - 建立 Singleton 資料庫連線
   - 撰寫 Data Access Layer
   - Server Component 資料查詢
   - 🎯 **輸出**：功能完整的後端 API 層

5. **[第五章：前端開發與資料視覺化](./chapter-05-frontend-visualization.md)**
   - 安裝 Recharts 圖表庫
   - 理解 Server vs Client Component
   - 建立互動式折線圖
   - 響應式設計與 UI 美化
   - 🎯 **輸出**：完整的儀表板介面

6. **[第六章：部署與生產環境配置](./chapter-06-deployment.md)**
   - 推送到 GitHub
   - Vercel 部署設定
   - 環境變數管理
   - CI/CD 自動化部署
   - 🎯 **輸出**：線上運行的正式網站

---

## 學習路徑建議

### 🎓 適合對象

- 已熟悉 React/Next.js 基礎
- 想深入學習後端資料庫整合
- 希望建立完整的全端專案
- 需要作品集專案的開發者

### ⏱️ 預估時間

- **快速通關**（只完成核心功能）：6-8 小時
- **完整學習**（包含練習和進階內容）：12-16 小時
- **深度探索**（加上擴充功能）：20+ 小時

### 📖 學習方式

1. **循序漸進**：按照章節順序學習，每章都有明確的輸出成果
2. **實作優先**：邊看邊寫，不要只是閱讀
3. **遇到問題**：先查看該章的「疑難排解」區塊
4. **進階挑戰**：完成基礎功能後，嘗試每章末尾的進階練習

---

## 技術堆疊總覽

| 類別 | 技術 | 版本 | 用途 |
|------|------|------|------|
| **前端框架** | Next.js | 14.x | App Router、Server Components |
| **UI 框架** | React | 18.x | 使用者介面 |
| **樣式** | Tailwind CSS | 3.x | Utility-first CSS |
| **圖表庫** | Recharts | 2.x | 資料視覺化 |
| **語言** | TypeScript | 5.x | 型別安全 |
| **資料庫** | Neon PostgreSQL | 15.x | Serverless 資料庫 |
| **資料庫驅動** | postgres.js | 3.x | 資料庫連線 |
| **部署平台** | Vercel | - | Serverless 部署 |
| **版本控制** | Git / GitHub | - | 程式碼管理 |

---

## 專案最終成果

完成課程後，你將擁有：

✅ 一個完整的全端 Web 應用程式  
✅ 具備資料庫整合（Neon PostgreSQL）  
✅ 互動式資料視覺化（Recharts 圖表）  
✅ 響應式設計（支援手機、平板、桌機）  
✅ 已部署到正式環境（Vercel）  
✅ 自動化 CI/CD 流程  
✅ 可展示的作品集專案  

---

## 快速開始

如果你已經準備好開始，請：

1. 確保你有圖片中的資料（2016-2025 年出生人數）
2. 前往 **[第一章：資料準備與前處理](./chapter-01-data-preparation.md)** 開始學習
3. 跟著步驟一步步完成每個章節

**祝你學習愉快！** 🚀