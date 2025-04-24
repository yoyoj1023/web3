const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// 合約地址 - 需要替換成本地部署後的合約地址
const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
console.log("合約地址:", contractAddress);

// 初始化 Web3 - 連接到本地節點
const web3 = new Web3('http://127.0.0.1:8545');

// 讀取合約 ABI
const contractABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../artifacts/contracts/FirstToken.sol/FirstToken.json'), 'utf8')).abi;

// 初始化合約實例
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function main() {
    // 獲取本地賬戶列表
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];  // 使用第一個賬戶作為發送者
    const recipient = accounts[1];  // 使用第二個賬戶作為接收者

    console.log('使用的發送帳戶:', sender);
    console.log('接收帳戶:', recipient);

    // 轉帳功能
    async function transfer(to, value) {
        try {
            const tx = await contract.methods.transfer(to, value).send({
                from: sender,
                gas: 200000  // 設置固定 gas 限制
            });
            console.log('轉帳成功:', tx);
        } catch (error) {
            console.error('轉帳失敗:', error);
        }
    }

    // 調用轉帳功能 (轉 1 個代幣)
    await transfer(recipient, web3.utils.toWei('1', 'ether'));
}

// 執行主函數
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });