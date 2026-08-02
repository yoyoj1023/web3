import dotenv from 'dotenv';
import path from 'path';

// 載入 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('環境變數已載入！');