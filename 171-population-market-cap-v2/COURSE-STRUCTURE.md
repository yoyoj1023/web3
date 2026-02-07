# 📁 課程檔案結構說明

這份文件說明課程專案的完整檔案結構，幫助你理解每個檔案的用途。

---

## 📂 目前的檔案結構

```
171-population-market-cap-v2/
│
├── 📄 README.md                          # 課程總覽與大綱
├── 📄 GETTING-STARTED.md                 # 快速開始指南（從這裡開始！）
├── 📄 COURSE-STRUCTURE.md                # 本檔案：結構說明
│
├── 📘 chapter-01-data-preparation.md     # 第一章：資料準備與前處理
├── 📘 chapter-02-neon-database.md        # 第二章：雲端資料庫建置
├── 📘 chapter-03-nextjs-setup.md         # 第三章：專案初始化與環境配置
├── 📘 chapter-04-backend-database.md     # 第四章：後端邏輯與資料庫連線
├── 📘 chapter-05-frontend-visualization.md # 第五章：前端開發與資料視覺化
├── 📘 chapter-06-deployment.md           # 第六章：部署與生產環境配置
│
├── 📁 data/                              # 資料檔案目錄
│   ├── taiwan-births.json                # 台灣出生人數資料（JSON 格式）
│   └── taiwan-births.csv                 # 台灣出生人數資料（CSV 格式）
│
├── 📄 .env.example                       # 環境變數範本
└── 📄 .gitignore.example                 # Git 忽略清單範本
```

---

## 📖 檔案說明

### 核心文件

#### `README.md`
**用途**：課程總覽頁面  
**內容**：
- 課程大綱
- 技術堆疊總覽
- 章節索引連結
- 學習路徑建議

**何時閱讀**：想了解整個課程架構時

---

#### `GETTING-STARTED.md`（建議從這裡開始！）
**用途**：快速開始指南  
**內容**：
- 課前準備檢查清單
- 必要工具和帳號
- 學習建議
- 進度追蹤清單

**何時閱讀**：在開始第一章之前

---

#### `COURSE-STRUCTURE.md`（本檔案）
**用途**：檔案結構說明  
**內容**：
- 完整的檔案樹狀圖
- 每個檔案的用途說明
- 學習順序建議

**何時閱讀**：想了解專案結構時

---

### 課程章節（依順序）

#### 第一章：`chapter-01-data-preparation.md`
**學習主題**：資料準備與前處理  
**預估時間**：1 小時  
**難度**：⭐（簡單）  
**學習重點**：
- 將圖片資料轉換為 JSON 格式
- 理解資料庫 Schema 設計原則
- 資料驗證與清理

**輸出成果**：
- `data/taiwan-births.json` 檔案
- `data/taiwan-births.csv` 檔案（選修）

**前置需求**：無

---

#### 第二章：`chapter-02-neon-database.md`
**學習主題**：雲端資料庫建置  
**預估時間**：2 小時  
**難度**：⭐⭐（簡單-中等）  
**學習重點**：
- 註冊 Neon Serverless PostgreSQL
- 使用 SQL Editor 建立資料表
- 撰寫 DDL 和 DML 語句
- 理解資料庫安全性

**輸出成果**：
- 運行中的 PostgreSQL 資料庫
- `taiwan_births` 資料表（含 10 筆資料）

**前置需求**：
- Neon 帳號
- 完成第一章（有資料）

---

#### 第三章：`chapter-03-nextjs-setup.md`
**學習主題**：專案初始化與環境配置  
**預估時間**：1.5 小時  
**難度**：⭐⭐（簡單-中等）  
**學習重點**：
- 使用 create-next-app 建立專案
- 理解 App Router 結構
- 設定環境變數（.env.local）
- 配置 .gitignore

**輸出成果**：
- 完整的 Next.js 14 專案骨架
- `.env.local` 檔案（包含 DATABASE_URL）
- `.gitignore` 檔案

**前置需求**：
- Node.js 18+
- 完成第二章（有資料庫連線字串）

---

#### 第四章：`chapter-04-backend-database.md`
**學習主題**：後端邏輯與資料庫連線  
**預估時間**：3 小時  
**難度**：⭐⭐⭐⭐（中等-困難）  
**學習重點**：
- 安裝並配置 postgres.js
- 建立 Singleton 資料庫連線
- 撰寫 Data Access Layer
- 在 Server Component 查詢資料

**輸出成果**：
- `lib/db.ts`（資料庫連線模組）
- `lib/data.ts`（資料存取層）
- `app/page.tsx`（顯示資料的首頁）

**前置需求**：
- 完成第三章（有 Next.js 專案）
- 理解 async/await

---

#### 第五章：`chapter-05-frontend-visualization.md`
**學習主題**：前端開發與資料視覺化  
**預估時間**：3 小時  
**難度**：⭐⭐⭐（中等）  
**學習重點**：
- 安裝並使用 Recharts
- 理解 Server vs Client Component
- 建立互動式圖表
- 實作響應式設計

**輸出成果**：
- `components/BirthChart.tsx`（圖表組件）
- 完整的儀表板介面
- 美化的 UI（統計卡片、表格、圖表）

**前置需求**：
- 完成第四章（能從資料庫撈取資料）
- 理解 React Props

---

#### 第六章：`chapter-06-deployment.md`
**學習主題**：部署與生產環境配置  
**預估時間**：2 小時  
**難度**：⭐⭐⭐（中等）  
**學習重點**：
- 推送程式碼到 GitHub
- 在 Vercel 部署應用程式
- 設定生產環境變數
- 理解 CI/CD 流程

**輸出成果**：
- GitHub Repository
- 線上運行的網站（Vercel）
- 自動化部署流程

**前置需求**：
- 完成第五章（有完整功能的應用程式）
- GitHub 帳號
- Vercel 帳號

---

### 資料檔案

#### `data/taiwan-births.json`
**用途**：台灣 2016-2025 年出生人數資料（JSON 格式）  
**使用時機**：
- 第一章：建立此檔案
- 第二章：參考此檔案匯入資料庫
- 第四章（選修）：使用 Node.js script 匯入資料

**格式範例**：
```json
[
  {"year": 2016, "births": 208440},
  {"year": 2017, "births": 193844}
]
```

---

#### `data/taiwan-births.csv`
**用途**：台灣出生人數資料（CSV 格式）  
**使用時機**：
- 第一章（選修）：建立此檔案
- 可用 Excel 開啟編輯

**格式範例**：
```csv
year,births
2016,208440
2017,193844
```

---

### 配置檔案

#### `.env.example`
**用途**：環境變數範本  
**內容**：
```
DATABASE_URL="postgresql://username:password@host/database"
```

**重要**：
- ✅ 可以 commit 到 Git
- ✅ 只包含範本，不包含真實密碼
- ❌ 不要填入真實的連線字串

---

#### `.gitignore.example`
**用途**：Git 忽略清單範本  
**內容**：
- `/node_modules`
- `/.next`
- `.env*.local`（重要！）

**使用方式**：
在第三章建立 Next.js 專案時，會自動產生 `.gitignore`。這個檔案提供參考。

---

## 🎯 學習順序建議

### 初學者路徑（完整學習）

```
1️⃣ 閱讀 GETTING-STARTED.md（課前準備）
    ↓
2️⃣ 閱讀 README.md（了解課程大綱）
    ↓
3️⃣ 跟著章節順序學習（第一章 → 第六章）
    ↓
4️⃣ 完成每章的進階練習
    ↓
5️⃣ 部署作品並分享
```

### 進階者路徑（跳躍學習）

```
如果你已經熟悉 Next.js 和資料庫：
- 快速瀏覽第一章、第二章、第三章
- 重點學習第四章（Data Access Layer）
- 深入學習第五章（Recharts）
- 完成第六章（部署）

如果你只想學視覺化：
- 跳到第五章
- 使用範例資料（不需要資料庫）
```

---

## 📊 章節依賴關係圖

```
第一章（資料準備）
    ↓
第二章（建立資料庫）
    ↓
第三章（建立 Next.js 專案）
    ↓
第四章（連接資料庫） ← 最關鍵
    ↓
第五章（視覺化） ← 可獨立學習
    ↓
第六章（部署）
```

**關鍵章節**：
- **第四章**是整個課程的核心，必須完整理解
- **第五章**可以獨立學習（如果你只想學 Recharts）

---

## 🗂️ 完成課程後的專案結構

完成所有章節後，你的專案目錄會是這樣：

```
tw-birth-tracker/                    # 專案根目錄
│
├── app/                             # Next.js App Router 目錄
│   ├── layout.tsx                   # 根 Layout
│   ├── page.tsx                     # 首頁（儀表板）
│   └── globals.css                  # 全域樣式
│
├── components/                      # React 組件
│   └── BirthChart.tsx               # 圖表組件（Client Component）
│
├── lib/                             # 工具函數和模組
│   ├── db.ts                        # 資料庫連線（Singleton）
│   └── data.ts                      # 資料存取層（Data Access Layer）
│
├── data/                            # 資料檔案（開發用）
│   ├── taiwan-births.json
│   └── taiwan-births.csv
│
├── public/                          # 靜態檔案（圖片、字型等）
│
├── node_modules/                    # npm 套件（不 commit）
│
├── .next/                           # Next.js 建置輸出（不 commit）
│
├── .env.local                       # 環境變數（不 commit）
├── .env.example                     # 環境變數範本（commit）
├── .gitignore                       # Git 忽略清單
│
├── package.json                     # npm 專案配置
├── package-lock.json                # npm 版本鎖定
├── tsconfig.json                    # TypeScript 配置
├── tailwind.config.ts               # Tailwind CSS 配置
├── next.config.js                   # Next.js 配置
│
└── README.md                        # 專案說明文件
```

---

## 💾 檔案大小參考

| 檔案/目錄 | 大小 | 說明 |
|----------|------|------|
| `node_modules/` | ~300 MB | npm 套件（不上傳到 Git）|
| `.next/` | ~50 MB | 建置輸出（不上傳到 Git）|
| 所有課程 Markdown | ~500 KB | 課程內容 |
| `data/*.json` | ~1 KB | 資料檔案 |
| 其他原始碼 | ~50 KB | 你撰寫的程式碼 |

**總計**（不含 node_modules 和 .next）：< 1 MB

---

## 🎓 學習建議

### 第一次學習

1. **按順序閱讀**：從第一章開始，不要跳章
2. **實際動手做**：每個步驟都要在電腦上實際操作
3. **完成輸出成果**：確保每章的輸出成果都正常運作
4. **做筆記**：記錄重要概念和遇到的問題

### 複習時

1. **查看章節目錄**：快速找到特定主題
2. **使用搜尋功能**：在 Markdown 中搜尋關鍵字
3. **重做進階練習**：挑戰更難的題目
4. **嘗試擴充功能**：添加新的資料維度或圖表類型

---

## 📝 筆記建議

建議在學習過程中記錄以下內容：

### 技術筆記

- [ ] Server Component vs Client Component 的使用時機
- [ ] Singleton Pattern 的實作方式
- [ ] SQL 查詢的常用語法
- [ ] Recharts 的配置參數
- [ ] 環境變數的管理方式

### 錯誤記錄

- [ ] 遇到的錯誤訊息
- [ ] 解決方法
- [ ] 避免重複犯錯的提醒

### 心得感想

- [ ] 哪些概念特別困難？
- [ ] 哪些技術想深入學習？
- [ ] 可以應用在哪些實際專案？

---

## 🔗 相關資源

### 官方文件
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Recharts Documentation](https://recharts.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [postgres.js GitHub](https://github.com/porsager/postgres)

### 社群資源
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Neon Community Discord](https://neon.tech/discord)
- [Stack Overflow - Next.js Tag](https://stackoverflow.com/questions/tagged/next.js)

---

**祝你學習愉快！如有任何問題，請參考各章節的疑難排解區塊。** 🚀
