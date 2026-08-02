# 第六章：部署與生產環境配置

## 學習目標
在這一章中，你將學會：
- 將專案推送到 GitHub
- 在 Vercel 部署 Next.js 應用程式
- 設定生產環境的環境變數
- 驗證部署結果並進行測試
- 理解 CI/CD 的基本概念
- 設定自訂網域（選修）

---

## 6.1 部署前檢查清單

在部署之前，讓我們確保一切就緒：

### ✅ 功能檢查

- [ ] 本地開發環境運行正常（`npm run dev`）
- [ ] 資料庫連線正常，能成功查詢資料
- [ ] 圖表顯示正確
- [ ] 響應式設計在不同裝置尺寸下都正常
- [ ] 沒有 console 錯誤

### ✅ 安全檢查

- [ ] `.env.local` 已被 `.gitignore` 忽略
- [ ] 沒有在程式碼中硬編碼敏感資訊
- [ ] 已建立 `.env.example` 範本檔案

### ✅ 程式碼品質

執行以下指令檢查：

```bash
# 檢查 TypeScript 型別錯誤
npx tsc --noEmit

# 檢查 ESLint 錯誤
npm run lint

# 測試建置（確保沒有建置錯誤）
npm run build
```

如果有任何錯誤，先修正再繼續。

---

## 6.2 初始化 Git Repository 並推送到 GitHub

### 步驟 1：確認 Git 狀態

如果你在第三章已經執行 `git init`，跳過這步。否則：

```bash
git init
```

### 步驟 2：檢查 `.gitignore`

確認以下內容存在於 `.gitignore`：

```
# dependencies
/node_modules

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

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

### 步驟 3：查看待提交的檔案

```bash
git status
```

**重要**：確認 `.env.local` **不在**清單中！

### 步驟 4：提交所有檔案

```bash
# 添加所有檔案到暫存區
git add .

# 提交
git commit -m "Initial commit: Taiwan Birth Tracker with Next.js 14, Neon, and Recharts"
```

### 步驟 5：在 GitHub 建立 Repository

1. 前往 https://github.com
2. 點擊右上角的 `+` → `New repository`
3. 填寫資訊：
   - **Repository name**: `tw-birth-tracker`
   - **Description**: `台灣出生人口趨勢儀表板 - Next.js 14 + Neon PostgreSQL + Recharts`
   - **Visibility**: Public（或 Private，看你的需求）
   - **不要**勾選「Initialize with README」（我們已經有專案了）
4. 點擊 `Create repository`

### 步驟 6：連結遠端 Repository 並推送

GitHub 會顯示指令，類似這樣：

```bash
# 添加遠端 Repository
git remote add origin https://github.com/your-username/tw-birth-tracker.git

# 推送到主分支
git branch -M main
git push -u origin main
```

推送成功後，重新整理 GitHub 頁面，應該會看到你的所有檔案。

### 疑難排解

#### 問題 1：推送失敗（Authentication）

**錯誤訊息**：
```
remote: Support for password authentication was removed
```

**解決方法**：使用 Personal Access Token (PAT)

1. 前往 GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. 勾選 `repo` 權限
4. 複製 token
5. 推送時，密碼欄位使用 token 而非密碼

#### 問題 2：分支名稱不一致

如果你的預設分支是 `master` 而非 `main`：

```bash
# 重新命名分支
git branch -M main
```

---

## 6.3 在 Vercel 部署應用程式

### 什麼是 Vercel？

Vercel 是 Next.js 的官方部署平台（也是 Next.js 的開發公司）。

#### Vercel 的優勢

✅ **零配置部署**：自動偵測 Next.js 專案  
✅ **自動 HTTPS**：免費 SSL 憑證  
✅ **全球 CDN**：內容快取，低延遲  
✅ **自動 CI/CD**：每次 push 到 GitHub 都會自動部署  
✅ **Preview 環境**：每個 Pull Request 都有獨立的預覽網址  
✅ **免費方案**：個人專案完全免費  

### 步驟 1：註冊 Vercel

前往 https://vercel.com/signup

選擇 **Continue with GitHub**（強烈建議，這樣可以自動整合）。

授權 Vercel 存取你的 GitHub 帳號。

### 步驟 2：Import Project

1. 進入 Vercel Dashboard
2. 點擊 `Add New...` → `Project`
3. 系統會列出你的 GitHub Repositories
4. 找到 `tw-birth-tracker`，點擊 `Import`

### 步驟 3：Configure Project

Vercel 會自動偵測這是 Next.js 專案，大部分設定都是預設即可。

#### 重要設定

**Framework Preset**：Next.js（已自動選擇）  
**Root Directory**：`./`（保持預設）  
**Build Command**：`npm run build`（保持預設）  
**Output Directory**：`.next`（保持預設）  
**Install Command**：`npm install`（保持預設）  

**不要**點擊 `Deploy` 按鈕！我們還需要設定環境變數。

### 步驟 4：設定環境變數（最關鍵！）

在 Configure Project 頁面，找到 **Environment Variables** 區塊。

#### 添加 `DATABASE_URL`

1. **Name**: `DATABASE_URL`
2. **Value**: 貼上你的 Neon 連線字串
   ```
   postgresql://username:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
   ```
3. **Environment**: 勾選 `Production`、`Preview`、`Development`
4. 點擊 `Add`

#### 為什麼需要設定環境變數？

- 生產環境沒有你的 `.env.local` 檔案
- Vercel 需要知道如何連線到你的資料庫
- 每個環境（開發、預覽、正式）可以有不同的資料庫

### 步驟 5：部署！

確認環境變數已設定後，點擊 `Deploy` 按鈕。

你會看到即時的建置日誌（Build Logs）：

```
Running "npm install"
...
Running "npm run build"
...
Creating an optimized production build
...
✓ Compiled successfully
...
Build completed in 45s
```

大約 1-2 分鐘後，你會看到：

```
✅ Deployment completed
🎉 Your project is live at: https://tw-birth-tracker-xxx.vercel.app
```

---

## 6.4 驗證部署結果

### 步驟 1：開啟部署網址

點擊 Vercel 提供的網址（類似 `https://tw-birth-tracker-xxx.vercel.app`）。

### 步驟 2：功能測試

確認以下功能正常：

#### ✅ 資料顯示
- 統計卡片顯示正確的數據
- 表格顯示所有年份的資料

#### ✅ 圖表互動
- 圖表正常繪製
- 滑鼠 Hover 顯示 Tooltip
- 響應式設計在手機也能正常顯示

#### ✅ 效能測試

開啟 Chrome DevTools → Network Tab：

1. 重新整理頁面
2. 查看 `DOMContentLoaded` 和 `Load` 時間
3. 正常應該在 1-3 秒內完成

### 步驟 3：檢查伺服器端渲染

#### 查看頁面原始碼

在瀏覽器中按 `Ctrl + U`（或右鍵 → 檢視頁面原始碼）。

**你應該會看到完整的 HTML 內容**，包括：
- 統計數據（平均值、最大值等）
- 表格資料（所有年份和出生人數）

**這證明了 Server Component 正常運作！**

#### 對比傳統 CSR（Client-Side Rendering）

如果是純前端渲染（如舊版 React）：
```html
<div id="root"></div>
<script src="bundle.js"></script>
<!-- 頁面原始碼中看不到資料，需要執行 JavaScript 才會顯示 -->
```

#### Next.js 14 的 SSR（Server-Side Rendering）

```html
<div>
  <h1>台灣出生人口趨勢</h1>
  <table>
    <tr><td>2016</td><td>208,440</td></tr>
    <tr><td>2017</td><td>193,844</td></tr>
    <!-- 資料已經在 HTML 中！ -->
  </table>
</div>
```

**優勢**：
- 更快的首次渲染（FCP）
- SEO 友善（搜尋引擎可以直接索引內容）
- 無 JavaScript 也能看到內容（漸進增強）

---

## 6.5 自動部署（CI/CD）

### 什麼是 CI/CD？

- **CI (Continuous Integration)**：持續整合，每次 commit 都自動測試
- **CD (Continuous Deployment)**：持續部署，測試通過後自動上線

Vercel 已經幫你設定好了！

### 測試自動部署

#### 步驟 1：修改程式碼

在本地編輯 `app/page.tsx`，例如修改標題：

```typescript
<h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
  台灣出生人口趨勢儀表板 📊🇹🇼
</h1>
```

#### 步驟 2：提交並推送

```bash
git add .
git commit -m "Update page title with emoji"
git push
```

#### 步驟 3：觀察 Vercel

1. 前往 Vercel Dashboard → 你的專案
2. 你會看到新的 Deployment 正在進行
3. 建置完成後，點擊 `Visit` 查看更新

**整個流程完全自動，無需任何手動操作！**

### 部署歷史

Vercel 會保留所有部署記錄，你可以：

- 查看每次部署的建置日誌
- 回溯到任何舊版本
- 比較不同版本的差異

---

## 6.6 環境管理

### 三種環境

Vercel 提供三種環境：

| 環境 | 觸發條件 | 網址 | 用途 |
|------|---------|------|------|
| **Production** | push 到 `main` 分支 | `https://tw-birth-tracker.vercel.app` | 正式環境，使用者訪問的版本 |
| **Preview** | 建立 Pull Request | `https://tw-birth-tracker-git-feature-xxx.vercel.app` | 測試新功能，不影響正式環境 |
| **Development** | 本地開發 | `http://localhost:3000` | 開發環境 |

### 最佳實踐：使用分支開發

```bash
# 建立新分支
git checkout -b feature/add-death-data

# 開發功能
# ...

# 提交
git add .
git commit -m "Add death data to chart"

# 推送到遠端
git push origin feature/add-death-data
```

在 GitHub 建立 Pull Request，Vercel 會自動建立 Preview 環境讓你測試。

測試通過後，Merge 到 `main`，自動部署到正式環境。

---

## 6.7 效能優化與監控

### 啟用 Web Analytics（選修）

Vercel 提供免費的網站分析。

#### 步驟 1：啟用 Analytics

1. 前往 Vercel Dashboard → 專案設定
2. Analytics → Enable
3. 選擇 Web Vitals（核心網頁指標）

#### 步驟 2：查看數據

部署後，你可以看到：

- **Real Experience Score**：真實使用者體驗分數
- **LCP (Largest Contentful Paint)**：最大內容繪製時間
- **FID (First Input Delay)**：首次輸入延遲
- **CLS (Cumulative Layout Shift)**：累計版面配置位移

### 優化建議

#### 1. 啟用 ISR（Incremental Static Regeneration）

在 `app/page.tsx` 添加：

```typescript
// 每小時重新產生一次靜態頁面
export const revalidate = 3600;

export default async function Home() {
  // ...
}
```

**效果**：
- 第一次請求：執行資料庫查詢，產生靜態 HTML
- 後續請求（1 小時內）：直接回傳快取的 HTML（超快！）
- 1 小時後：背景重新產生新的 HTML

#### 2. 優化圖片

如果有圖片，使用 Next.js Image 組件：

```typescript
import Image from 'next/image';

<Image 
  src="/logo.png" 
  width={200} 
  height={100} 
  alt="Logo"
  priority // 優先載入
/>
```

#### 3. 使用 Lazy Loading

對於不重要的組件：

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // 不在伺服器端渲染
});
```

---

## 6.8 自訂網域（選修）

### 步驟 1：購買網域

你可以在以下平台購買網域：
- Namecheap
- GoDaddy
- Cloudflare（推薦，價格透明）
- Google Domains

例如：`taiwanbirth.com`（假設可用）

### 步驟 2：在 Vercel 添加網域

1. 前往 Vercel Dashboard → 專案設定
2. Domains → Add Domain
3. 輸入你的網域：`taiwanbirth.com`
4. 點擊 `Add`

### 步驟 3：設定 DNS

Vercel 會顯示需要添加的 DNS 記錄：

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

前往你的網域註冊商（如 Cloudflare）添加這些記錄。

### 步驟 4：驗證

DNS 更新需要 5 分鐘到 48 小時（通常 10 分鐘內）。

驗證成功後，你的網站就可以透過自訂網域訪問了！

Vercel 會自動配置 HTTPS。

---

## 6.9 疑難排解

### 問題 1：部署成功但頁面空白

**可能原因**：環境變數未設定

**解決方法**：
1. 前往 Vercel → 專案設定 → Environment Variables
2. 確認 `DATABASE_URL` 已設定
3. Redeploy（重新部署）

### 問題 2：資料庫連線失敗

**錯誤訊息**（在 Vercel Logs 中）：
```
Error: Connection timeout
```

**解決方法**：
1. 確認 Neon 資料庫沒有被暫停（免費版長時間沒用會自動休眠）
2. 前往 Neon Dashboard 喚醒資料庫
3. 確認連線字串正確（包含 `?sslmode=require`）

### 問題 3：建置失敗

**錯誤訊息**：
```
Type error: Property 'births' does not exist on type 'never'
```

**解決方法**：
1. 本地執行 `npm run build` 確認可以建置成功
2. 修正 TypeScript 型別錯誤
3. 提交並推送

### 問題 4：圖表不顯示

**可能原因**：Client Component 未正確標記

**解決方法**：
確認 `components/BirthChart.tsx` 頂部有 `'use client';`

---

## 6.10 監控與維護

### 查看 Logs

前往 Vercel Dashboard → 專案 → Functions，可以看到：

- 每個請求的執行時間
- 錯誤訊息（如果有）
- 資料庫查詢效能

### 設定告警（選修）

Vercel Pro 方案提供告警功能：

- 網站 Down 時發送郵件
- 效能低於標準時通知
- 建置失敗時通知

### 定期更新依賴

每個月執行一次：

```bash
# 檢查過時的套件
npm outdated

# 更新所有套件
npm update

# 測試
npm run build
npm run dev

# 提交
git commit -am "Update dependencies"
git push
```

---

## 本章小結

恭喜你完成整個課程！🎉

### 你已經掌握的技能

#### 前端開發
✅ Next.js 14 App Router  
✅ Server Component 與 Client Component  
✅ TypeScript  
✅ Tailwind CSS  
✅ Recharts 資料視覺化  

#### 後端開發
✅ Neon Serverless PostgreSQL  
✅ postgres.js 資料庫驅動  
✅ SQL 查詢（DDL & DML）  
✅ Data Access Layer 設計模式  

#### DevOps
✅ Git 版本控制  
✅ GitHub Repository 管理  
✅ Vercel 部署  
✅ 環境變數管理  
✅ CI/CD 自動化部署  

### 完整架構圖

```
使用者 (https://tw-birth-tracker.vercel.app)
    ↓
Vercel Edge Network (全球 CDN)
    ↓
Next.js 14 Server (Server Component)
    ↓
postgres.js (Connection Pooling)
    ↓
Neon PostgreSQL (Serverless Database)
    ↓
taiwan_births 資料表
    ↓
回傳資料 → 渲染 HTML
    ↓
Client Component (Recharts 圖表)
    ↓
使用者看到互動式儀表板
```

### 專案成果

你已經建立了一個：
- ✅ 全端 (Full-Stack) 應用程式
- ✅ 具備資料庫整合
- ✅ 具備資料視覺化
- ✅ 響應式設計 (RWD)
- ✅ 已部署到正式環境
- ✅ 具備自動 CI/CD

**這是一個完整的作品集專案！**

---

## 下一步建議

### 功能擴充

#### 1. 添加更多資料維度
- 死亡人數
- 結婚對數
- 離婚對數
- 計算自然增加率

#### 2. 添加使用者互動
- 年份範圍篩選器
- 資料匯出（下載 CSV）
- 比較多個指標

#### 3. 添加進階圖表
- 預測趨勢線（線性回歸）
- 多軸圖表（出生與死亡同時顯示）
- 動態圖表（播放年份變化動畫）

### 技術深化

#### 1. 認證系統
- 使用 NextAuth.js 添加登入功能
- 不同使用者可以儲存自訂篩選條件

#### 2. 資料更新機制
- 建立後台介面，讓管理員可以新增/編輯資料
- 實作 API Routes（`app/api/births/route.ts`）

#### 3. 測試
- 使用 Jest 撰寫單元測試
- 使用 Playwright 撰寫 E2E 測試

#### 4. 效能優化
- 添加 Redis 快取層
- 實作 GraphQL（使用 Apollo）
- 使用 React Query 優化資料獲取

### 學習資源

#### 官方文件
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Recharts Documentation](https://recharts.org/en-US/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

#### 進階主題
- [React Server Components](https://react.dev/reference/react/use-server)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Web Performance Optimization](https://web.dev/explore/fast)

---

## 最後的話

你已經完成了一個從零到有的全端專案，這是非常了不起的成就！

### 重要觀念回顧

1. **關注點分離**：資料庫邏輯、業務邏輯、UI 邏輯各司其職
2. **安全性優先**：永遠不要將敏感資訊上傳到 Git
3. **使用者體驗**：響應式設計、載入速度、視覺化都很重要
4. **持續學習**：技術不斷演進，保持學習熱情

### 展示你的作品

你現在有一個可以展示的作品，記得：

- 將網址加到你的履歷或作品集
- 在 LinkedIn 分享你的專案
- 撰寫部落格文章記錄學習過程
- 在 GitHub README 添加專案截圖

### 繼續探索

這只是起點，你可以：

- 套用相同架構到其他主題（股市資料、天氣資料等）
- 挑戰更複雜的資料視覺化（地圖、3D 圖表）
- 學習 AI/ML 整合（使用 TensorFlow.js 做預測）

**祝你在程式開發的旅程上越走越遠！** 🚀

---

## 附錄：常用指令速查表

### Git 指令

```bash
git status                    # 查看狀態
git add .                     # 添加所有檔案
git commit -m "message"       # 提交
git push                      # 推送到遠端
git pull                      # 拉取遠端更新
git checkout -b feature-name  # 建立並切換分支
git branch                    # 查看所有分支
```

### npm 指令

```bash
npm install                   # 安裝依賴
npm run dev                   # 啟動開發伺服器
npm run build                 # 建置正式版本
npm run start                 # 啟動正式版本（需先 build）
npm run lint                  # 執行 ESLint
npm outdated                  # 檢查過時的套件
```

### Next.js 指令

```bash
npx create-next-app@14 project-name  # 建立專案
npm run dev                           # 開發模式（Port 3000）
npm run build                         # 建置
npm run start                         # 正式模式
```

### SQL 指令

```sql
-- 查詢
SELECT * FROM table_name;
SELECT column FROM table WHERE condition;
SELECT AVG(column) FROM table;

-- 插入
INSERT INTO table (col1, col2) VALUES (val1, val2);

-- 更新
UPDATE table SET column = value WHERE condition;

-- 刪除
DELETE FROM table WHERE condition;

-- 建表
CREATE TABLE table_name (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);
```

---

課程完成！感謝你的學習，祝你在開發路上一切順利！ 🎓
