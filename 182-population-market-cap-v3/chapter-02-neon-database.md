# 第二章：雲端資料庫建置（Neon）

## 學習目標
在這一章中，你將學會：
- 註冊並設定 Neon Serverless PostgreSQL 資料庫
- 理解 Serverless 資料庫的優勢
- 使用 SQL Editor 執行 DDL 和 DML 語句
- 建立資料表並匯入資料

---

## 2.1 認識 Neon：Serverless PostgreSQL

### 什麼是 Neon？

Neon 是一個**現代化的 Serverless PostgreSQL 資料庫**，專為雲端應用程式設計。

#### 傳統資料庫 vs Serverless 資料庫

| 特性 | 傳統資料庫（如自架 PostgreSQL） | Neon Serverless |
|------|-------------------------------|----------------|
| **設定複雜度** | 需要安裝、設定、維護伺服器 | 5 分鐘註冊即可使用 |
| **費用模式** | 伺服器 24 小時運行，固定成本 | 只在有請求時計費，可自動休眠 |
| **擴展性** | 手動調整伺服器規格 | 自動擴展，零設定 |
| **備份** | 需自行設定備份機制 | 自動備份，可隨時還原 |
| **連線管理** | 連線數有上限，需設定 Connection Pool | 內建 Connection Pooling |

### 為什麼選擇 Neon？

對於學習和小型專案來說，Neon 有以下優勢：

✅ **免費方案足夠使用**：每月 3 GB 資料庫儲存空間  
✅ **零維運成本**：不需要操心伺服器管理  
✅ **完全相容 PostgreSQL**：所有 SQL 語法都能用  
✅ **與 Vercel 完美整合**：一鍵部署  

---

## 2.2 註冊 Neon 並建立專案

### 步驟 1：前往 Neon 官網

開啟瀏覽器，前往：
```
https://neon.tech
```

點擊右上角的 **Sign Up** 按鈕。

### 步驟 2：選擇註冊方式

你可以選擇以下任一方式註冊：
- **GitHub** 帳號（推薦，因為後續會用 GitHub 部署）
- **Google** 帳號
- **Email** 註冊

> 💡 建議使用 GitHub 註冊，這樣在 Vercel 部署時流程會更順暢。

### 步驟 3：建立第一個專案（Project）

註冊完成後，系統會引導你建立第一個專案。

填寫以下資訊：
- **Project Name**：`tw-birth-tracker`
- **Region**：選擇 **Asia Pacific (Singapore)** 或 **AWS ap-southeast-1**
  - 為什麼選新加坡？因為離台灣最近，延遲最低！
- **PostgreSQL Version**：保持預設（通常是最新版，如 15.x 或 16.x）

點擊 **Create Project**，等待約 10 秒，你的資料庫就建立好了！

---

## 2.3 認識 Neon Dashboard

專案建立完成後，你會看到 Neon 的 Dashboard 介面。

### 重要區域介紹

#### 1️⃣ **Connection String**（最重要！）
這是連線到資料庫的「鑰匙」，格式像這樣：
```
postgresql://username:password@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require
```

> ⚠️ **注意：這個字串包含密碼，絕對不能公開或上傳到 GitHub！**

你會在下一章使用這個連線字串。

#### 2️⃣ **SQL Editor**
可以直接在瀏覽器中執行 SQL 指令，非常方便測試。

#### 3️⃣ **Tables**
顯示目前資料庫中的所有資料表，現在還是空的。

#### 4️⃣ **Monitoring**
可以查看資料庫的使用量、查詢效能等統計資訊。

---

## 2.4 建立資料表（DDL - Data Definition Language）

### 什麼是 DDL？

DDL 是用來**定義資料庫結構**的 SQL 語句，主要包括：
- `CREATE TABLE`：建立資料表
- `ALTER TABLE`：修改資料表結構
- `DROP TABLE`：刪除資料表

### 步驟 1：開啟 SQL Editor

在 Neon Dashboard 左側選單，點擊 **SQL Editor**。

### 步驟 2：撰寫建表語句

在編輯器中輸入以下 SQL 語句：

```sql
-- 建立台灣出生人口資料表
CREATE TABLE taiwan_births (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL UNIQUE,
  births INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 語法解析

讓我們逐行理解這段 SQL：

#### `CREATE TABLE taiwan_births`
建立一個名為 `taiwan_births` 的資料表。

**命名慣例**：
- 使用小寫字母和底線（snake_case）
- 使用複數形式表示「多筆記錄」（如 `users`、`orders`）
- 避免使用 SQL 保留字（如 `table`、`select`）

#### `id SERIAL PRIMARY KEY`
- `SERIAL`：PostgreSQL 的特殊型別，等同於「自動遞增的整數」
- `PRIMARY KEY`：主鍵，確保每筆記錄都有唯一識別碼

**實際運作**：
```sql
-- 你只需要這樣插入資料：
INSERT INTO taiwan_births (year, births) VALUES (2016, 208440);

-- 資料庫會自動幫你產生 id：
-- id=1, year=2016, births=208440
```

#### `year INT NOT NULL UNIQUE`
- `INT`：整數型別
- `NOT NULL`：此欄位不可為空值
- `UNIQUE`：此欄位的值不可重複

**為什麼要 UNIQUE？**
```sql
-- 這會成功
INSERT INTO taiwan_births (year, births) VALUES (2016, 208440);

-- 這會失敗！因為 2016 已經存在
INSERT INTO taiwan_births (year, births) VALUES (2016, 999999);
-- Error: duplicate key value violates unique constraint "taiwan_births_year_key"
```

#### `births INT NOT NULL`
出生人數，必須是整數且不可為空。

#### `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
- `TIMESTAMP`：時間戳記型別（包含日期和時間）
- `DEFAULT CURRENT_TIMESTAMP`：如果插入資料時沒有指定此欄位，會自動填入當下時間

**用途**：記錄「這筆資料是什麼時候寫入資料庫的」，對於除錯和追蹤很有幫助。

### 步驟 3：執行 SQL

點擊編輯器右下角的 **Run** 按鈕（或按 `Ctrl + Enter` / `Cmd + Enter`）。

如果成功，你會看到：
```
CREATE TABLE
```

### 步驟 4：驗證資料表

執行以下查詢確認資料表已建立：
```sql
-- 查看資料表結構
\d taiwan_births

-- 或者
SELECT * FROM taiwan_births;
```

現在應該會回傳空結果（0 rows），因為我們還沒插入任何資料。

---

## 2.5 匯入資料（DML - Data Manipulation Language）

### 什麼是 DML？

DML 是用來**操作資料**的 SQL 語句：
- `INSERT`：新增資料
- `UPDATE`：修改資料
- `DELETE`：刪除資料
- `SELECT`：查詢資料

### 方法 A：使用 INSERT 語句手動匯入（推薦初學者）

在 SQL Editor 中執行以下語句：

```sql
INSERT INTO taiwan_births (year, births) VALUES
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

> 💡 **技巧**：使用 `VALUES` 後接多組括號，可以一次插入多筆資料，比分開執行 10 次 `INSERT` 更有效率。

執行後，你應該會看到：
```
INSERT 0 10
```
表示成功插入 10 筆資料。

### 驗證資料

執行查詢語句確認資料已正確匯入：

```sql
SELECT * FROM taiwan_births ORDER BY year ASC;
```

你應該會看到類似這樣的結果：

```
 id | year | births | created_at                  
----+------+--------+-----------------------------
  1 | 2016 | 208440 | 2024-01-27 10:30:15.123456
  2 | 2017 | 193844 | 2024-01-27 10:30:15.123456
  3 | 2018 | 181601 | 2024-01-27 10:30:15.123456
  ...
```

---

## 2.6 基礎 SQL 查詢練習

現在資料已經在資料庫中了，讓我們練習一些常用的 SQL 查詢。

### 查詢 1：找出出生人數最多的年份

```sql
SELECT year, births 
FROM taiwan_births 
ORDER BY births DESC 
LIMIT 1;
```

**結果**：
```
 year | births 
------+--------
 2016 | 208440
```

**解析**：
- `ORDER BY births DESC`：按出生人數**降序**排列（DESC = Descending）
- `LIMIT 1`：只取第一筆結果

### 查詢 2：計算 2016-2025 的平均出生人數

```sql
SELECT AVG(births) as average_births 
FROM taiwan_births;
```

**結果**：
```
 average_births 
----------------
      166693.0
```

**解析**：
- `AVG()`：平均值函數
- `as average_births`：給結果欄位取別名，讓輸出更易讀

### 查詢 3：找出出生人數低於 15 萬的年份

```sql
SELECT year, births 
FROM taiwan_births 
WHERE births < 150000 
ORDER BY year ASC;
```

**結果**：
```
 year | births 
------+--------
 2022 | 138986
 2023 | 135571
 2024 | 134856
 2025 | 107812
```

### 查詢 4：計算每年相比前一年的出生人數變化（進階）

```sql
SELECT 
  year,
  births,
  births - LAG(births) OVER (ORDER BY year) as change,
  ROUND((births - LAG(births) OVER (ORDER BY year))::numeric / LAG(births) OVER (ORDER BY year) * 100, 2) as change_percent
FROM taiwan_births
ORDER BY year;
```

**結果**：
```
 year | births | change  | change_percent 
------+--------+---------+----------------
 2016 | 208440 | NULL    | NULL
 2017 | 193844 | -14596  | -7.00
 2018 | 181601 | -12243  | -6.31
 ...
```

**解析**（進階概念，可先跳過）：
- `LAG(births) OVER (ORDER BY year)`：取得「前一筆記錄」的 births 值
- `ROUND(..., 2)`：四捨五入到小數點第 2 位
- `::numeric`：型別轉換，確保除法結果是小數

---

## 2.7 資料庫安全性最佳實踐

### 🔒 Connection String 安全指南

你的資料庫連線字串長這樣：
```
postgresql://username:password@host/database
```

#### ❌ 危險操作
```javascript
// 千萬不要這樣做！
const connectionString = "postgresql://alex:myP@ssw0rd@ep-xxx.aws.neon.tech/mydb";
// 然後 commit 到 GitHub
```

#### ✅ 正確做法
```javascript
// 使用環境變數
const connectionString = process.env.DATABASE_URL;
```

我們會在第三章詳細說明如何安全地管理連線字串。

### 備份策略

Neon 會自動備份你的資料庫，但你也可以手動匯出：

```sql
-- 在 SQL Editor 執行後，可以下載結果為 CSV
SELECT * FROM taiwan_births;
```

或使用 `pg_dump`（進階）：
```bash
pg_dump "postgresql://..." > backup.sql
```

---

## 方法 B：使用 Node.js Script 匯入（進階選修）

如果你想練習程式化地匯入資料，可以建立一個簡單的 Node.js 腳本。

### 步驟 1：安裝 postgres.js

```bash
npm install postgres
```

### 步驟 2：建立 `scripts/import-data.js`

```javascript
const postgres = require('postgres');
const data = require('../data/taiwan-births.json');

// 替換成你的連線字串（暫時硬編碼，僅供測試）
const sql = postgres('postgresql://...');

async function importData() {
  try {
    // 清空舊資料（小心使用！）
    await sql`TRUNCATE TABLE taiwan_births RESTART IDENTITY CASCADE`;
    
    // 批次插入新資料
    const result = await sql`
      INSERT INTO taiwan_births ${sql(data, 'year', 'births')}
    `;
    
    console.log(`✅ 成功匯入 ${result.count} 筆資料`);
  } catch (error) {
    console.error('❌ 匯入失敗：', error);
  } finally {
    await sql.end();
  }
}

importData();
```

### 步驟 3：執行腳本

```bash
node scripts/import-data.js
```

> ⚠️ **注意**：這個方法會刪除資料表中的所有現有資料，僅適合開發環境使用。

---

## 本章小結

恭喜你完成第二章！你已經學會了：

### 核心技能
✅ 註冊並設定 Neon Serverless PostgreSQL  
✅ 使用 SQL Editor 執行 DDL 語句（`CREATE TABLE`）  
✅ 使用 `INSERT` 語句匯入資料  
✅ 撰寫基本的 `SELECT` 查詢  
✅ 理解資料庫安全性的重要性  

### 輸出成果
- 一個正在運行的 Neon PostgreSQL 資料庫
- `taiwan_births` 資料表，包含 10 筆 2016-2025 的出生人數資料

### SQL 技能檢核表
- [ ] 能夠建立資料表（`CREATE TABLE`）
- [ ] 理解主鍵（`PRIMARY KEY`）和唯一性限制（`UNIQUE`）
- [ ] 能夠插入多筆資料（`INSERT ... VALUES`）
- [ ] 能夠查詢資料（`SELECT`, `WHERE`, `ORDER BY`, `LIMIT`）
- [ ] 能夠使用聚合函數（`AVG`, `COUNT`, `SUM`）

---

## 下一章預告

在第三章，我們將會：
- 使用 `create-next-app` 建立 Next.js 14 專案
- 安全地設定環境變數（`.env.local`）
- 取得 Neon 的連線字串並整合到專案中
- 學習 `.gitignore` 的重要性

**準備好開始寫程式了嗎？** 💻

---

## 延伸學習資源

### 官方文件
- [Neon Documentation](https://neon.tech/docs/introduction)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

### 推薦練習
1. 試著新增一個 `deaths`（死亡人數）欄位到資料表
2. 查詢「出生人數連續下降的年份範圍」
3. 計算 2016-2025 的總出生人數（`SUM` 函數）

### SQL 練習平台
- [SQLBolt](https://sqlbolt.com/)
- [PostgreSQL Exercises](https://pgexercises.com/)

下一章見！ 🚀
