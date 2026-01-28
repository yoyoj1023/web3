# 第六章：部署與維運

> **學習目標**：將你的作品發布到公網，讓全世界都能看到

---

## 📋 本章概述

在這一章中，你將學會：
- 使用 Git 進行版本控制
- 將程式碼推送到 GitHub
- 使用 Vercel 自動部署
- 設定環境變數
- 效能優化技巧

---

## 6.1 GitHub 整合

### 為什麼需要 Git 和 GitHub？

| 工具 | 用途 | 比喻 |
|-----|------|------|
| **Git** | 版本控制系統 | 遊戲的「存檔」功能 |
| **GitHub** | 程式碼託管平台 | 雲端存檔 |

**好處**：
- ✅ 追蹤所有程式碼變更
- ✅ 多人協作開發
- ✅ 回溯到任何時間點
- ✅ 自動化部署（CI/CD）

---

### 步驟 1：確認 Git 已安裝

開啟終端機，執行：

```bash
git --version
```

如果看到版本號（例如 `git version 2.x.x`），代表已安裝。

**如果沒有安裝**：
- Windows：下載 [Git for Windows](https://git-scm.com/download/win)
- macOS：執行 `xcode-select --install`
- Linux：執行 `sudo apt install git`

---

### 步驟 2：設定 Git 使用者資訊

**只需執行一次**（如果之前設定過可以跳過）：

```bash
git config --global user.name "你的名字"
git config --global user.email "your.email@example.com"
```

---

### 步驟 3：初始化 Git 儲存庫

在專案根目錄執行：

```bash
git init
```

應該會看到：

```
Initialized empty Git repository in /path/to/your/project/.git/
```

---

### 步驟 4：確認 .gitignore

Next.js 已經自動建立 `.gitignore` 檔案。確認包含以下內容：

```bash
# dependencies
/node_modules

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

> ⚠️ **重要**：`.env*.local` 必須在 `.gitignore` 中，避免洩漏敏感資訊！

---

### 步驟 5：第一次提交

```bash
# 查看當前狀態
git status

# 將所有檔案加入暫存區
git add .

# 建立提交
git commit -m "Initial commit: Taiwan Birth Trends Dashboard"
```

**Git 指令說明**：

| 指令 | 用途 |
|-----|------|
| `git status` | 查看檔案狀態 |
| `git add .` | 將所有變更加入暫存區 |
| `git commit -m "訊息"` | 建立提交（存檔點）|
| `git log` | 查看提交歷史 |

---

### 步驟 6：建立 GitHub Repository

1. 開啟瀏覽器，前往 [https://github.com/new](https://github.com/new)
2. 登入你的 GitHub 帳號（如果沒有，請先註冊）
3. 填寫 Repository 資訊：

   ```
   Repository name: taiwan-birth-dashboard
   Description: 台灣出生率趨勢視覺化儀表板
   Public / Private: 選擇 Public（公開）或 Private（私人）
   
   ⚠️ 不要勾選以下選項：
   [ ] Add a README file
   [ ] Add .gitignore
   [ ] Choose a license
   ```

4. 點擊「Create repository」

---

### 步驟 7：連接本地與遠端儲存庫

GitHub 會顯示指令，複製「…or push an existing repository」區塊的指令：

```bash
git remote add origin https://github.com/你的使用者名稱/taiwan-birth-dashboard.git
git branch -M main
git push -u origin main
```

**指令說明**：

| 指令 | 用途 |
|-----|------|
| `git remote add origin <URL>` | 連接到遠端儲存庫 |
| `git branch -M main` | 將分支名稱改為 main |
| `git push -u origin main` | 推送到 GitHub |

---

### 步驟 8：驗證上傳

重新整理 GitHub 頁面，你應該會看到所有程式碼已經上傳。

---

## 6.2 Vercel 自動部署

### 為什麼選擇 Vercel？

Vercel 是 Next.js 的官方推薦部署平台：

| 特點 | 說明 |
|-----|------|
| **零配置** | 自動偵測 Next.js 專案 |
| **自動部署** | 推送到 GitHub 自動觸發 |
| **全球 CDN** | 超快的載入速度 |
| **免費額度** | 個人專案完全免費 |
| **預覽部署** | 每個 PR 都有預覽網址 |

---

### 步驟 1：註冊 Vercel

1. 前往 [https://vercel.com](https://vercel.com)
2. 點擊「Sign Up」
3. 選擇「Continue with GitHub」
4. 授權 Vercel 存取你的 GitHub 帳號

---

### 步驟 2：匯入專案

1. 登入後，點擊「Add New...」→「Project」
2. 在「Import Git Repository」區塊，找到 `taiwan-birth-dashboard`
3. 點擊「Import」

---

### 步驟 3：配置專案

Vercel 會自動偵測這是 Next.js 專案：

```
Framework Preset: Next.js ✓
Root Directory: ./
Build Command: next build (自動偵測)
Output Directory: .next (自動偵測)
Install Command: npm install (自動偵測)
```

**通常不需要修改這些設定**。

---

### 步驟 4：設定環境變數

這是**最重要的步驟**！

1. 展開「Environment Variables」區塊
2. 加入環境變數：

   ```
   Name: DATABASE_URL
   Value: postgresql://postgres:yourpassword@db.xxx.supabase.co:5432/postgres
   
   Environment: ✅ Production
                ✅ Preview
                ✅ Development
   ```

3. 點擊「Add」

> ⚠️ **注意**：確保 `DATABASE_URL` 的值與你本地 `.env.local` 中的完全相同！

---

### 步驟 5：開始部署

點擊「Deploy」按鈕，等待部署完成（通常需要 1-2 分鐘）。

**部署過程**：
```
1. Building...          (編譯專案)
2. Deploying...         (上傳到 CDN)
3. Ready               (部署完成)
```

---

### 步驟 6：查看你的網站

部署完成後，你會看到：

- ✅ 部署成功的訊息
- 🎉 恭喜動畫
- 🔗 你的網站 URL

**URL 格式**：
```
https://taiwan-birth-dashboard.vercel.app
或
https://taiwan-birth-dashboard-你的使用者名稱.vercel.app
```

點擊「Visit」按鈕，查看你的線上網站！

---

### 步驟 7：測試網站功能

確認以下項目：

- [ ] 網站能正常載入
- [ ] 圖表正確顯示
- [ ] 統計數據正確
- [ ] 表格顯示完整
- [ ] 手機版顯示正常

---

## 6.3 效能優化

### 優化 1：設定 Revalidate（資料快取）

修改 `app/page.tsx`：

```typescript
// 設定資料重新驗證時間（秒）
export const revalidate = 3600; // 每小時更新一次

export default async function Home() {
  // ...
}
```

**Revalidate 選項**：

| 值 | 說明 | 適用情境 |
|---|------|---------|
| `false` | 永久快取（預設）| 靜態資料 |
| `0` | 不快取，每次重新獲取 | 即時資料 |
| `60` | 快取 1 分鐘 | 頻繁更新 |
| `3600` | 快取 1 小時 | 定期更新 |
| `86400` | 快取 1 天 | 很少更新 |

**我們的資料特性**：
- 新生兒數據不會即時變化
- 通常每年或每月更新
- 設定 `3600`（1 小時）是合理的選擇

---

### 優化 2：圖片優化

如果未來要加入圖片，使用 Next.js 的 `Image` 元件：

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority  // 首頁重要圖片優先載入
/>
```

**優勢**：
- 自動優化圖片格式（WebP）
- 延遲載入（Lazy Loading）
- 響應式圖片
- 防止累積佈局偏移（CLS）

---

### 優化 3：字型優化

Next.js 14 內建字型優化，修改 `app/layout.tsx`：

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',  // 字型交換策略
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

### 優化 4：使用 Edge Runtime（進階）

對於純展示頁面，可以使用 Edge Runtime：

```typescript
// app/page.tsx
export const runtime = 'edge';

export default async function Home() {
  // ...
}
```

**優勢**：
- 更快的冷啟動
- 更低的延遲
- 全球邊緣節點執行

**限制**：
- 不支援某些 Node.js API
- 需要確保所有依賴相容

---

## 🔄 持續開發與部署

### 日常開發流程

```bash
# 1. 修改程式碼
# 2. 測試功能
npm run dev

# 3. 提交變更
git add .
git commit -m "Add new feature"

# 4. 推送到 GitHub
git push

# 5. Vercel 自動部署（無需手動操作）
```

---

### 查看部署歷史

在 Vercel Dashboard：

1. 點擊你的專案
2. 查看「Deployments」分頁
3. 可以看到所有部署記錄

每次推送到 GitHub，Vercel 都會自動建立新的部署。

---

### 預覽部署（Preview Deployments）

如果使用分支開發：

```bash
# 建立新分支
git checkout -b feature/new-chart

# 修改並推送
git push origin feature/new-chart
```

Vercel 會自動建立預覽網址，讓你在合併前測試。

---

## 🎯 自訂網域（選做）

### 步驟 1：購買網域

在網域註冊商（如 Namecheap、GoDaddy）購買網域。

---

### 步驟 2：在 Vercel 加入網域

1. 在專案設定中點擊「Domains」
2. 輸入你的網域（例如：`myawesomesite.com`）
3. 點擊「Add」

---

### 步驟 3：設定 DNS

按照 Vercel 的指示，在網域註冊商設定 DNS 記錄：

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### 步驟 4：等待 DNS 生效

通常需要 24-48 小時。

---

## 📊 監控與分析

### Vercel Analytics（選做）

啟用 Vercel Analytics 來追蹤網站使用情況：

1. 在專案設定中點擊「Analytics」
2. 點擊「Enable」
3. 在專案中加入：

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## ✅ 本章檢核清單

完成以下項目，確保你已掌握本章內容：

- [ ] 理解 Git 的基本概念
- [ ] 成功將程式碼推送到 GitHub
- [ ] 註冊並設定 Vercel 帳號
- [ ] 正確設定環境變數
- [ ] 成功部署網站到 Vercel
- [ ] 網站功能運作正常
- [ ] 理解 revalidate 快取策略
- [ ] 知道如何更新部署

---

## 🔧 疑難排解

### 問題 1：部署失敗 - 環境變數錯誤

**錯誤訊息**：
```
Error: DATABASE_URL environment variable is not set
```

**解決方案**：
1. 檢查 Vercel Dashboard 的環境變數設定
2. 確認變數名稱拼寫正確
3. 確認變數值格式正確
4. 重新部署

---

### 問題 2：資料庫連線失敗

**錯誤訊息**：
```
Error: Connection timeout
```

**可能原因**：
- Supabase 專案暫停（免費方案會自動暫停）
- 防火牆設定問題
- 連線字串錯誤

**解決方案**：
1. 登入 Supabase Dashboard，確認專案狀態
2. 如果暫停，點擊「Resume」
3. 檢查連線字串是否正確

---

### 問題 3：圖表無法顯示

**可能原因**：
- Recharts 套件問題
- Client Component 設定錯誤

**解決方案**：
1. 確認 `'use client'` 在 `components/birth-chart.tsx` 最頂端
2. 檢查瀏覽器 Console 是否有錯誤訊息
3. 嘗試清除快取並重新部署

---

## 📚 延伸學習

### 推薦閱讀

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Git Tutorial](https://git-scm.com/book/en/v2)

### 進階主題

1. **CI/CD Pipeline**：設定自動化測試
2. **監控與告警**：使用 Sentry 錯誤追蹤
3. **效能分析**：使用 Lighthouse 分析效能

---

## 🎉 恭喜完成整個課程！

你已經成功：
- ✅ 建立完整的全端應用程式
- ✅ 從資料庫到前端完整串接
- ✅ 實作資料視覺化
- ✅ 部署到網路上

### 🏆 你學會了什麼？

#### 1. Full-stack 開發技能
- 資料庫設計與 SQL 操作
- Next.js App Router
- TypeScript 型別系統
- 資料視覺化

#### 2. 現代化工具鏈
- Git 版本控制
- GitHub 協作平台
- Vercel 自動部署
- 環境變數管理

#### 3. 最佳實踐
- 元件化設計
- 型別安全
- 錯誤處理
- 效能優化

---

### 🚀 下一步建議

#### 短期目標（1-2 週）

1. **加入更多功能**：
   - 年份篩選器
   - 資料匯出（CSV/Excel）
   - 列印友善版面

2. **優化使用者體驗**：
   - 加入深色模式
   - 改善載入動畫
   - 加入使用說明

3. **分享你的作品**：
   - 在 LinkedIn 發布
   - 加入個人作品集
   - 撰寫部落格文章

#### 中期目標（1-2 個月）

1. **擴展資料來源**：
   - 加入各縣市資料
   - 加入國際比較
   - 整合更多統計數據

2. **學習新技術**：
   - 實作使用者認證（NextAuth.js）
   - 加入即時更新（Supabase Realtime）
   - 學習 Server Actions

3. **效能與 SEO**：
   - 深入學習 Next.js 快取策略
   - 優化 Core Web Vitals
   - 實作結構化資料（JSON-LD）

#### 長期目標（3-6 個月）

1. **建立作品集**：
   - 完成 3-5 個類似專案
   - 建立個人網站展示作品
   - 參與開源專案

2. **深入特定領域**：
   - 專注資料視覺化
   - 或專注全端開發
   - 或專注效能優化

3. **職涯發展**：
   - 準備作品集面試
   - 參與技術社群
   - 投稿技術文章

---

### 💡 專案改進建議

**初級改進**：
1. 加入 404 頁面（`app/not-found.tsx`）
2. 改善 Error 頁面設計
3. 加入頁尾（Footer）

**中級改進**：
1. 實作搜尋功能
2. 加入資料對比（年度對比）
3. 支援多語言（i18n）

**高級改進**：
1. 實作使用者自訂儀表板
2. 加入預測功能（機器學習）
3. 建立 API 供其他應用使用

---

### 📖 推薦學習資源

**官方文件**：
- [Next.js 文件](https://nextjs.org/docs)
- [React 文件](https://react.dev)
- [TypeScript 文件](https://www.typescriptlang.org/docs/)

**線上課程**：
- [Next.js 官方教學](https://nextjs.org/learn)
- [Full Stack Open](https://fullstackopen.com/)
- [Vercel 教學影片](https://www.youtube.com/@vercelhq)

**社群資源**：
- [Next.js Discord](https://nextjs.org/discord)
- [React Taiwan](https://www.facebook.com/groups/reactjs.tw/)
- [前端台灣](https://www.facebook.com/groups/f2e.tw/)

---

### 🎯 最後的話

恭喜你完成了這個完整的實戰課程！你現在已經具備：

- ✅ 建立生產級全端應用的能力
- ✅ 現代化前端開發的技能
- ✅ 資料庫設計與操作的知識
- ✅ 部署與維運的經驗

**記住**：
- 學習是一個持續的過程
- 多做專案是最好的學習方式
- 不要害怕犯錯，每個錯誤都是學習機會
- 保持好奇心，持續探索新技術

**祝你在 Web 開發的路上越走越遠！** 🚀

---

**課程完成日期**：2026 年 1 月  
**技術棧版本**：Next.js 14, React 18, TypeScript 5, Tailwind CSS 3

如果你有任何問題或建議，歡迎隨時與我聯絡！
