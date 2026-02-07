import postgres from 'postgres';

// 確保環境變數存在
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// 宣告全域型別（僅用於開發環境的 Singleton）
declare global {
  var sql: ReturnType<typeof postgres> | undefined;
}

// 建立或重用連線
const sql = global.sql || postgres(process.env.DATABASE_URL, {
  max: 10, // 最大連線數
  idle_timeout: 20, // 閒置連線在 20 秒後自動關閉
  connect_timeout: 10, // 連線逾時設定（秒）
});

// 開發環境下將連線存到 global，避免 Hot Reload 時重複建立
if (process.env.NODE_ENV !== 'production') {
  global.sql = sql;
}

export default sql;