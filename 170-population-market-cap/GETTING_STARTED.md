# 開始學習指南

歡迎來到「Taiwan Birth Trends Dashboard」全端實戰課程！

## 📖 課程概覽

這是一個完整的全端開發實戰課程，從零開始建立一個資料視覺化儀表板。

### 🎯 學習成果

完成本課程後，你將能夠：
- ✅ 建立生產級的 Next.js 14 應用程式
- ✅ 設計並操作 PostgreSQL 資料庫
- ✅ 實作資料視覺化圖表
- ✅ 部署應用到 Vercel
- ✅ 理解 Full-stack 開發流程

### ⏱️ 預估學習時間

| 章節 | 主題 | 預估時間 |
|-----|------|---------|
| 第一章 | 資料建模與資料庫建置 | 1-2 小時 |
| 第二章 | Next.js 專案架構 | 1-2 小時 |
| 第三章 | 伺服器端資料獲取 | 1-2 小時 |
| 第四章 | 數據視覺化 | 2-3 小時 |
| 第五章 | UI 精修 | 2-3 小時 |
| 第六章 | 部署與維運 | 1-2 小時 |
| **總計** | | **8-14 小時** |

## 📋 課前準備

### 必備知識

- ✅ 基礎 HTML/CSS/JavaScript
- ✅ React 基礎（useState, useEffect, 元件概念）
- ✅ 基本終端機操作

### 建議但非必要

- TypeScript 基礎
- SQL 基礎
- Git 基礎

### 環境需求

#### 軟體安裝

1. **Node.js**（18.17 或更高版本）
   - 下載：https://nodejs.org/
   - 驗證：`node --version`

2. **Git**
   - Windows: https://git-scm.com/download/win
   - macOS: `xcode-select --install`
   - Linux: `sudo apt install git`
   - 驗證：`git --version`

3. **程式碼編輯器**
   - 推薦：Visual Studio Code
   - 下載：https://code.visualstudio.com/

#### 線上帳號註冊

1. **Supabase**（資料庫）
   - 註冊：https://supabase.com
   - 免費方案即可

2. **GitHub**（程式碼託管）
   - 註冊：https://github.com
   - 免費帳號即可

3. **Vercel**（部署平台）
   - 註冊：https://vercel.com
   - 可用 GitHub 帳號登入
   - 免費方案即可

## 🗺️ 學習路徑

### 建議學習順序

```
START
  ↓
第一章：資料建模與資料庫建置
  ↓
第二章：Next.js 專案架構與資料庫連線
  ↓
第三章：伺服器端資料獲取
  ↓
第四章：數據視覺化與圖表實作
  ↓
第五章：UI 精修與使用者體驗
  ↓
第六章：部署與維運
  ↓
FINISH 🎉
```

### 各章節關係圖

```
第一章 (資料庫)
    ↓
第二章 (Next.js + 連線)
    ↓
第三章 (資料獲取)
    ↓
第四章 (視覺化) ←→ 第五章 (UI 優化)
    ↓              ↓
    └──────────────┘
           ↓
    第六章 (部署)
```

## 📚 章節詳細說明

### [第一章：資料建模與資料庫建置](./chapter-01-data-modeling/)

**學習重點**：
- 理解原始數據結構
- 設計資料庫 Schema
- 使用 Supabase 建立資料庫
- 撰寫 SQL 語句

**輸出成果**：
- ✅ 完成資料庫建置
- ✅ 匯入 10 筆資料

---

### [第二章：Next.js 專案架構與資料庫連線](./chapter-02-nextjs-setup/)

**學習重點**：
- 初始化 Next.js 14 專案
- 環境變數管理
- 安裝 postgres.js
- 建立資料庫連線模組

**輸出成果**：
- ✅ Next.js 專案正常運行
- ✅ 成功連接資料庫

---

### [第三章：伺服器端資料獲取](./chapter-03-server-data-fetching/)

**學習重點**：
- Server Components 概念
- TypeScript 型別定義
- 資料獲取函數
- 錯誤處理與載入狀態

**輸出成果**：
- ✅ 頁面顯示資料表格
- ✅ 載入與錯誤處理完整

---

### [第四章：數據視覺化與圖表實作](./chapter-04-data-visualization/)

**學習重點**：
- Recharts 圖表庫
- 折線圖實作
- 客製化樣式
- 回應式設計

**輸出成果**：
- ✅ 互動式折線圖
- ✅ 手機版適配

---

### [第五章：UI 精修與使用者體驗](./chapter-05-ui-enhancement/)

**學習重點**：
- shadcn/ui 元件庫
- 數據格式化
- 統計分析功能
- 使用者體驗優化

**輸出成果**：
- ✅ 專業的 UI 介面
- ✅ 統計卡片顯示

---

### [第六章：部署與維運](./chapter-06-deployment/)

**學習重點**：
- Git 版本控制
- GitHub 協作
- Vercel 部署
- 效能優化

**輸出成果**：
- ✅ 網站上線
- ✅ 自動化部署流程

## 💡 學習建議

### 1. 按照順序學習

每一章都建立在前一章的基礎上，請依序完成。

### 2. 動手實作

- 不要只是閱讀，一定要親自寫程式碼
- 遇到錯誤是正常的，這是學習的一部分
- 每個章節都有練習題，務必完成

### 3. 理解原理

- 不要死記程式碼
- 理解為什麼要這樣寫
- 嘗試用自己的話解釋概念

### 4. 善用資源

- 查閱官方文件
- 使用搜尋引擎解決問題
- 在 GitHub Issues 提問

### 5. 做筆記

- 記錄學習重點
- 整理常見錯誤與解決方案
- 建立個人知識庫

## 🔧 常見問題

### Q1: 我需要有 React 經驗嗎？

**A:** 建議有基礎的 React 知識（元件、props、state），但課程中會解釋所有概念。

### Q2: 可以跳過某些章節嗎？

**A:** 不建議。每一章都有其重要性，跳過會導致後續章節難以理解。

### Q3: 遇到錯誤該怎麼辦？

**A:** 
1. 仔細閱讀錯誤訊息
2. 檢查拼寫和語法
3. 查看章節中的「疑難排解」區塊
4. 使用搜尋引擎
5. 在社群求助

### Q4: 完成課程後可以做什麼？

**A:**
- 將專案放入履歷作品集
- 嘗試擴充功能
- 應用到其他專案
- 繼續學習進階主題

### Q5: 課程需要花錢嗎？

**A:** 不需要！所有使用的服務都有免費方案：
- ✅ Supabase: 免費 500MB
- ✅ Vercel: 免費個人方案
- ✅ GitHub: 免費方案

## 📞 取得協助

### 官方資源

- [Next.js 文件](https://nextjs.org/docs)
- [Supabase 文件](https://supabase.com/docs)
- [Recharts 文件](https://recharts.org/)

### 社群資源

- [Next.js Discord](https://nextjs.org/discord)
- [React Taiwan Facebook](https://www.facebook.com/groups/reactjs.tw/)
- [Stack Overflow](https://stackoverflow.com/)

## 🎯 檢核清單

開始學習前，確認你已完成：

- [ ] 安裝 Node.js（18.17+）
- [ ] 安裝 Git
- [ ] 安裝 VS Code 或其他編輯器
- [ ] 註冊 Supabase 帳號
- [ ] 註冊 GitHub 帳號
- [ ] 註冊 Vercel 帳號
- [ ] 理解基本的 JavaScript/React
- [ ] 準備好投入 8-14 小時學習

## 🚀 開始學習

一切準備就緒了嗎？

**👉 [前往第一章：資料建模與資料庫建置](./chapter-01-data-modeling/)**

祝你學習順利！🎉
