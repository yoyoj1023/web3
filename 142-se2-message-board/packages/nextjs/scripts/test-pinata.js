// packages/nextjs/scripts/test-pinata.js
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testPinataConnection() {
  const url = 'https://api.pinata.cloud/data/testAuthentication';
  
  try {
    const response = await axios.get(url, {
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_API_SECRET,
      },
    });
    
    console.log('✅ Pinata API 連接成功!');
    console.log('回應:', response.data);
  } catch (error) {
    console.error('❌ Pinata API 連接失敗:', error.response?.data || error.message);
  }
}

testPinataConnection();
