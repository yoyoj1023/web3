# 第一章：資料建模與資料庫建置

> **學習目標**：將圖片中的原始數據轉化為可查詢的結構化數據

---

## 📋 本章概述

在這一章中，你將學會：
- 理解並整理原始數據
- 設計適合的資料庫結構
- 使用雲端資料庫服務（Supabase）
- 撰寫 SQL 語句建立資料表並匯入數據

---

## 1.1 資料清洗與結構化

### 步驟 1：理解原始數據

我們的原始數據如下：

| 年份 | 出生數 |
|------|--------|
| 2016 | 208,440 |
| 2017 | 193,844 |
| 2018 | 181,601 |
| 2019 | 177,767 |
| 2020 | 165,249 |
| 2021 | 153,820 |
| 2022 | 138,986 |
| 2023 | 135,571 |
| 2024 | 134,856 |
| 2025 | 107,812 |

### 步驟 2：資料分析

觀察這組數據，我們可以發現：

1. **資料欄位**：
   - `year`（年份）：整數型別，範圍 2016-2025
   - `births`（出生數）：整數型別，正整數

2. **資料特性**：
   - 年份是唯一的（不會重複）
   - 出生數都是正整數
   - 數據呈現下降趨勢

3. **業務需求**：
   - 需要按年份排序查詢
   - 可能需要計算年增長率
   - 未來可能需要新增更多年份

### 步驟 3：設計資料結構

基於以上分析，我們設計以下資料表結構：

```sql
CREATE TABLE birth_records (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  births INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**欄位說明**：

| 欄位名稱 | 資料型別 | 約束條件 | 說明 |
|---------|---------|---------|------|
| `id` | SERIAL | PRIMARY KEY | 主鍵，自動遞增 |
| `year` | INTEGER | NOT NULL, UNIQUE | 年份，必填且唯一 |
| `births` | INTEGER | NOT NULL | 出生人數，必填 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 資料建立時間 |

**設計考量**：

- ✅ 使用 `SERIAL` 作為主鍵，方便資料管理
- ✅ 年份設為 `UNIQUE` 避免重複資料
- ✅ 使用 `NOT NULL` 確保資料完整性
- ✅ 加入時間戳記，便於追蹤資料建立時間

---

## 1.2 雲端資料庫託管

### 為什麼選擇 Supabase？

Supabase 是一個開源的 Firebase 替代方案，提供：

| 功能 | 說明 | 適合初學者 |
|-----|------|-----------|
| **PostgreSQL** | 強大的關聯式資料庫 | ✅ |
| **免費額度** | 500MB 資料庫空間 | ✅ |
| **Web 介面** | 視覺化管理工具 | ✅ |
| **自動生成 API** | 省去後端開發時間 | ✅ |
| **即時訂閱** | WebSocket 支援 | ⭐ 進階功能 |

### 實作步驟

#### 步驟 1：註冊 Supabase

1. 開啟瀏覽器，前往 [https://supabase.com](https://supabase.com)
2. 點擊右上角「Start your project」按鈕
3. 選擇「Sign in with GitHub」（推薦）或使用 Email 註冊
4. 完成 GitHub OAuth 授權流程

#### 步驟 2：建立新專案

登入後，你會看到 Supabase Dashboard：

1. 點擊綠色的「New Project」按鈕
2. 填寫專案資訊：

   ```
   Organization: 選擇你的帳號或組織
   Name: taiwan-birth-trends
   Database Password: ********** (設定一個強密碼)
   Region: Northeast Asia (Tokyo) 或 Southeast Asia (Singapore)
   Pricing Plan: Free (免費方案)
   ```

3. 點擊「Create new project」
4. 等待 1-2 分鐘，專案建立完成

> ⚠️ **重要提醒**：請務必將資料庫密碼保存在安全的地方（如密碼管理器），之後會用到！

#### 步驟 3：熟悉 Supabase 介面

專案建立完成後，你會看到：

- **左側選單**：
  - 🏠 Home：專案概覽
  - 📊 Table Editor：資料表編輯器
  - 🔑 Authentication：使用者認證
  - 💾 Storage：檔案儲存
  - ⚡ SQL Editor：SQL 查詢編輯器
  - ⚙️ Project Settings：專案設定

- **主要區域**：
  - API 金鑰顯示
  - 快速開始指南
  - 專案狀態監控

#### 步驟 4：開啟 SQL Editor

1. 點擊左側選單的「SQL Editor」
2. 你會看到一個空白的 SQL 編輯器
3. 點擊右上角的「New query」建立新查詢

---

## 1.3 資料匯入

### 執行 SQL 建立資料表

#### 步驟 1：建立資料表

在 SQL Editor 中，貼上以下 SQL 指令：

```sql
-- 建立 birth_records 資料表
CREATE TABLE birth_records (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL UNIQUE,
  births INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**操作說明**：

1. 將上述 SQL 複製到編輯器中
2. 點擊右下角的「Run」按鈕（或按 `Ctrl + Enter`）
3. 等待執行完成，應該會看到 `Success. No rows returned` 訊息

**SQL 語法解說**：

- `CREATE TABLE`：建立新資料表
- `SERIAL`：自動遞增的整數型別
- `PRIMARY KEY`：主鍵約束
- `NOT NULL`：不允許空值
- `UNIQUE`：唯一性約束
- `DEFAULT NOW()`：預設值為當前時間

#### 步驟 2：驗證資料表

確認資料表是否成功建立：

```sql
-- 查看資料表結構
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'birth_records'
ORDER BY ordinal_position;
```

執行後應該看到 4 個欄位的資訊。

#### 步驟 3：插入數據

現在將 2016-2025 年的出生數據寫入資料庫：

```sql
-- 插入 2016-2025 年的出生數據
INSERT INTO birth_records (year, births) VALUES
  (2016, 208440),
  (2017, 193844),
  (2018, 181601),
  (2019, 177767),
  (2020, 165249),
  (2021, 153820),
  (2022, 138986),
  (2023, 135571),
  (2024, 134856),
  (2025, 107812);
```

**操作步驟**：

1. 建立新的 SQL 查詢（點擊「New query」）
2. 貼上上述 SQL 指令
3. 點擊「Run」執行
4. 應該會看到 `Success. 10 rows affected` 訊息

**SQL 語法解說**：

- `INSERT INTO`：插入資料指令
- `(year, births)`：指定要插入的欄位
- `VALUES`：後面接要插入的資料
- 每一行代表一筆資料，用逗號分隔

#### 步驟 4：驗證數據

確認數據是否正確匯入：

```sql
-- 查詢所有資料，按年份排序
SELECT * FROM birth_records ORDER BY year ASC;
```

執行後，你應該看到 10 筆資料：

| id | year | births | created_at |
|----|------|--------|------------|
| 1  | 2016 | 208440 | 2026-01-27 ... |
| 2  | 2017 | 193844 | 2026-01-27 ... |
| ... | ... | ... | ... |
| 10 | 2025 | 107812 | 2026-01-27 ... |

---

## 📊 實用查詢範例

### 基礎查詢

```sql
-- 1. 查詢特定年份
SELECT * FROM birth_records WHERE year = 2023;

-- 2. 查詢最近 3 年
SELECT * FROM birth_records WHERE year >= 2023 ORDER BY year DESC;

-- 3. 計算總出生人數
SELECT SUM(births) as total_births FROM birth_records;

-- 4. 計算平均出生人數
SELECT AVG(births) as avg_births FROM birth_records;

-- 5. 找出出生人數最多的年份
SELECT * FROM birth_records ORDER BY births DESC LIMIT 1;
```

### 進階查詢

```sql
-- 6. 計算年增長率
SELECT 
  year,
  births,
  LAG(births) OVER (ORDER BY year) as previous_year_births,
  ROUND(
    ((births - LAG(births) OVER (ORDER BY year))::NUMERIC / 
     LAG(births) OVER (ORDER BY year) * 100), 
    2
  ) as growth_rate_percent
FROM birth_records
ORDER BY year;

-- 7. 標示趨勢
SELECT 
  year,
  births,
  CASE 
    WHEN births > LAG(births) OVER (ORDER BY year) THEN '上升 ↑'
    WHEN births < LAG(births) OVER (ORDER BY year) THEN '下降 ↓'
    ELSE '持平 →'
  END as trend
FROM birth_records
ORDER BY year;
```

---

## 🎯 實作練習

完成以下練習，加深對 SQL 的理解：

### 練習 1：資料查詢

1. 查詢 2020 年之後的所有資料
2. 找出出生人數低於 150,000 的年份
3. 計算 2016-2020 和 2021-2025 兩個時期的平均出生人數

<details>
<summary>點擊查看解答</summary>

```sql
-- 1. 查詢 2020 年之後
SELECT * FROM birth_records WHERE year > 2020;

-- 2. 出生人數低於 150,000
SELECT * FROM birth_records WHERE births < 150000;

-- 3. 分時期平均
SELECT 
  CASE 
    WHEN year BETWEEN 2016 AND 2020 THEN '2016-2020'
    ELSE '2021-2025'
  END as period,
  ROUND(AVG(births)) as avg_births
FROM birth_records
GROUP BY period;
```

</details>

### 練習 2：資料更新

假設 2025 年的數據有誤，正確值應該是 107,900，請撰寫 SQL 更新這筆資料。

<details>
<summary>點擊查看解答</summary>

```sql
UPDATE birth_records 
SET births = 107900 
WHERE year = 2025;

-- 驗證更新
SELECT * FROM birth_records WHERE year = 2025;
```

</details>

### 練習 3：資料刪除（選做）

如果需要刪除 2025 年的資料，該如何操作？

<details>
<summary>點擊查看解答</summary>

```sql
-- ⚠️ 注意：刪除操作無法復原！
DELETE FROM birth_records WHERE year = 2025;

-- 驗證刪除
SELECT * FROM birth_records ORDER BY year;
```

</details>

---

## 🔧 疑難排解

### 問題 1：CREATE TABLE 失敗

**錯誤訊息**：`relation "birth_records" already exists`

**原因**：資料表已經存在

**解決方案**：
```sql
-- 方案 A：刪除舊表再重建（會遺失資料）
DROP TABLE birth_records;
CREATE TABLE birth_records (...);

-- 方案 B：使用 IF NOT EXISTS
CREATE TABLE IF NOT EXISTS birth_records (...);
```

### 問題 2：INSERT 失敗

**錯誤訊息**：`duplicate key value violates unique constraint`

**原因**：嘗試插入重複的年份

**解決方案**：
```sql
-- 先刪除現有資料
DELETE FROM birth_records;
-- 再重新插入
INSERT INTO birth_records (year, births) VALUES ...;
```

### 問題 3：連線逾時

**錯誤訊息**：`Connection timeout`

**原因**：網路問題或 Supabase 服務暫時不可用

**解決方案**：
- 檢查網路連線
- 重新整理頁面
- 稍後再試

---

## ✅ 本章檢核清單

完成以下項目，確保你已掌握本章內容：

- [ ] 理解原始數據的結構與特性
- [ ] 能夠設計適合的資料表結構
- [ ] 成功註冊並建立 Supabase 專案
- [ ] 能夠使用 SQL Editor 執行查詢
- [ ] 成功建立 `birth_records` 資料表
- [ ] 完成 10 筆數據的匯入
- [ ] 能夠執行基本的 SELECT 查詢
- [ ] 理解 UNIQUE、NOT NULL 等約束條件

---

## 📚 延伸學習

### 推薦閱讀

- [PostgreSQL 官方文件](https://www.postgresql.org/docs/)
- [Supabase 文件](https://supabase.com/docs)
- [SQL Tutorial - W3Schools](https://www.w3schools.com/sql/)

### 進階挑戰

1. **加入更多欄位**：新增「死亡人數」、「淨增人口」等欄位
2. **建立索引**：為常用的查詢欄位建立索引以提升效能
3. **資料驗證**：使用 CHECK 約束確保出生數為正數

```sql
-- 範例：加入 CHECK 約束
ALTER TABLE birth_records 
ADD CONSTRAINT births_positive CHECK (births > 0);
```

---

## 🎉 恭喜完成第一章！

你已經成功：
- ✅ 建立了第一個雲端資料庫
- ✅ 學會了基本的 SQL 操作
- ✅ 將原始數據結構化儲存

**下一步**：前往 [第二章：Next.js 專案架構與資料庫連線](../chapter-02-nextjs-setup/README.md)，開始建立前端應用程式！
