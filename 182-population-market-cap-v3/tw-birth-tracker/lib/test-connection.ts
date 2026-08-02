// 必須先載入環境變數，再 import db.ts
// 使用動態 import 來控制載入順序
import { config } from 'dotenv';
import { resolve } from 'path';

// 載入 .env.local 檔案
config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  // 在這裡動態載入 db 模組，確保環境變數已經設定
  const { default: sql } = await import('./db.js');
  
  try {
    // 執行簡單的查詢測試連線
    const result = await sql`SELECT current_database(), version()`;
    
    console.log('✅ 資料庫連線成功！');
    console.log('📦 資料庫名稱:', result[0].current_database);
    console.log('🔢 PostgreSQL 版本:', result[0].version.split(' ')[1]);
    
    // 測試查詢我們的資料表
    const births = await sql`SELECT COUNT(*) FROM taiwan_births`;
    console.log('📊 taiwan_births 資料筆數:', births[0].count);
    
  } catch (error) {
    console.error('❌ 資料庫連線失敗:', error);
  } finally {
    // 關閉連線（測試用）
    await sql.end();
  }
}

testConnection();
