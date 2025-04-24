const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

// 檢查環境變數
if (!process.env.SEPOLIA_RPC_URL_API_KEY) {
    throw new Error('Missing SEPOLIA_RPC_URL_API_KEY in .env file');
}
if (!process.env.PRIVATE_KEY) {
    throw new Error('Missing PRIVATE_KEY in .env file');
}

// 設置 Web3 provider 選項
const providerOptions = {
    timeout: 30000, // 超時設置為 30 秒
    reconnect: {
        auto: true,
        delay: 5000, // 重試延遲 5 秒
        maxAttempts: 5,
        onTimeout: false
    }
};

// 合約地址 - 需要替換成本地部署後的合約地址
const contractAddress = '0x46b72d9eB59b075F91Fa159DaE5336447a1bd97E';
console.log("合約地址:", contractAddress);

// 初始化 Web3
// const rpcURL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_RPC_URL_API_KEY}`;
const rpcURL_key = process.env.SEPOLIA_RPC_URL_API_KEY;
console.log("連接到網路:", rpcURL_key);
const provider = new Web3.providers.HttpProvider(rpcURL_key, providerOptions);
const web3 = new Web3(provider);

// 讀取合約 ABI
const contractABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/contracts/FirstToken.sol/FirstToken.json'), 'utf8')).abi;

// 初始化合約實例
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 你的帳戶地址 - 需要替換成你的帳戶地址
const account = '0x783e6919144922bd541D744216df6DAD6fc775ff';

// 添加重試函數
async function retry(fn, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`重試中... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// 添加獲取 pending nonce 函數
async function getPendingNonce() {
    const currentNonce = await web3.eth.getTransactionCount(account, 'latest');
    const pendingNonce = await web3.eth.getTransactionCount(account, 'pending');
    console.log('Current nonce:', currentNonce);
    console.log('Pending nonce:', pendingNonce);
    // 直接使用 BigInt 比較運算符
    return currentNonce >= pendingNonce ? currentNonce : pendingNonce;
}

// 轉帳功能
async function transfer(to, value) {
    try {
        // 檢查網路連接
        const networkId = await retry(() => web3.eth.net.getId());
        console.log("當前網路 ID:", networkId);

        // 檢查餘額
        const balance = await retry(() => web3.eth.getBalance(account));
        console.log("ETH 餘額:", web3.utils.fromWei(balance, 'ether'));

        const tx = contract.methods.transfer(to, value);
        console.log("準備轉帳交易...");

        //const gas = await tx.estimateGas({ from: account });
        const gas = await retry(() => tx.estimateGas({ from: account }));
        console.log("預估 gas:", gas);

        const gasPrice = await retry(() => web3.eth.getGasPrice());
        console.log("當前 gas 價格:", gasPrice);
        // 因為 Sepolia 測試網常常塞車爆滿，將 gas price 提高 10%，來搶先打包區塊
        const adjustedGasPrice = BigInt(Math.floor(Number(gasPrice) * 1.1));
        console.log("調整後的 gas 價格:", adjustedGasPrice);

        const data = tx.encodeABI();

        const nonce = await retry(() => getPendingNonce());
        console.log('max of nonce:', nonce);

        const signedTx = await web3.eth.accounts.signTransaction(
            {
                to: contractAddress,
                data,
                gas,
                gasPrice: adjustedGasPrice, // 可使用調整後的 adjustedGasPrice
                nonce,
                chainId: 11155111  // Sepolia testnet chainId
            },
            process.env.PRIVATE_KEY
        );

        console.log("交易已簽名，準備發送...");
        const receipt = await retry(async () => {
            const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log('交易已發送，等待確認...');
            return await web3.eth.getTransactionReceipt(txHash.transactionHash);
        }, 5, 5000); // 增加重試次數和等待時間
        console.log('交易成功，收據:', receipt);
        return receipt;
    } catch (error) {
        console.error('交易錯誤:', error.message);
        throw error;
    }
    
}

// 修改主函數調用
async function main() {
    try {
        // 調用轉帳功能 - 轉換成接收第址
        await transfer(
            '0xee487E3460E64097be4404f5F00b6722eDd7f0D2',
            web3.utils.toWei('1', 'ether')
        );
    } catch (error) {
        console.error("主程序錯誤:", error);
        process.exit(1);
    }
}

// 執行主函數
main();