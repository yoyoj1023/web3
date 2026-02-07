require('dotenv').config({ path: '.env.local' });

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('環境變數已載入！');
