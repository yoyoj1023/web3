const { ethers } = require('ethers');
require("dotenv").config();

// 替換成你的 SEPOLIA_RPC_URL_API_KEY
// 例如 https://eth-sepolia.g.alchemy.com/v2/your-api-key
const url = process.env.SEPOLIA_RPC_URL_API_KEY;

const provider = new ethers.JsonRpcProvider(url);
console.log('使用 Ether.js 已連接到 Sepolia 測試網！');



// 替換成你的 Sepolia 帳戶地址
const account = '0x783e6919144922bd541D744216df6DAD6fc775ff';

provider.getBalance(account).then(balance => {
    // 餘額是以 wei 為單位，轉換成 ether
    const balanceInEther = ethers.utils.formatEther(balance);
    console.log('帳戶餘額：', balanceInEther, 'ETH');
}).catch(error => {
    console.error('查詢餘額時發生錯誤:', error);
});