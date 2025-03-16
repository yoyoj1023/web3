const { Web3 } = require('web3');
require("dotenv").config();
const fs = require('fs');

// 替換成你的 SEPOLIA_RPC_URL_API_KEY
// 例如 https://eth-sepolia.g.alchemy.com/v2/your-api-key
const url = process.env.SEPOLIA_RPC_URL_API_KEY;

const web3 = new Web3(url);
console.log('使用 Web3.js 已連接到 Sepolia 測試網！');


/*
// 替換成你的 Sepolia 帳戶地址
const account = '0x783e6919144922bd541D744216df6DAD6fc775ff';

web3.eth.getBalance(account).then(balance => {
    // 餘額是以 wei 為單位，轉換成 ether
    const balanceInEther = web3.utils.fromWei(balance, 'ether');
    console.log('帳戶餘額：', balanceInEther, 'ETH');
}).catch(error => {
    console.error('查詢餘額時發生錯誤:', error);
});
*/


// 查找 ERC20 代幣合約地址
const lepusToken_address = '0xcef2a3410F5773e408Ea6862E4dabd10aeE5260A';
// 載入 ERC20 代幣合約 ABI
const lepusToken_ABI = JSON.parse(fs.readFileSync('./scripts/LepusTokenABI.json', 'utf8'));
const extendedAbi = [
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "name": "balance",
          "type": "uint256"
        }
      ],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "type": "function"
    }
  ];


// 創建 ERC20 代幣合約實例
const lepusToken_contract = new web3.eth.Contract(extendedAbi, lepusToken_address);
/*
lepusToken_contract.methods.balanceOf(account).call().then(balance => {
    // 假設代幣的 decimals 是 18，轉換餘額
    const tokenBalance = balance / 10**18;
    console.log(`代幣餘額: ${tokenBalance}`);
}).catch(error => {
    console.error('查詢代幣餘額時發生錯誤:', error);
});
*/
async function getTokenBalance() {
    try {
      const balance = await tokenContract.methods.balanceOf(account).call();
      const decimals = await tokenContract.methods.decimals().call();
      const adjustedBalance = balance / (10 ** decimals);
      console.log("餘額:", adjustedBalance);
    } catch (err) {
      console.error(err);
    }
  }
  
//getTokenBalance();