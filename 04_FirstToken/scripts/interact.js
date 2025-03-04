const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// 初始化 Web3
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// 讀取合約 ABI
const contractABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/contracts/FirstToken.json'), 'utf8')).abi;

// 合約地址
const contractAddress = 'YOUR_CONTRACT_ADDRESS';

// 初始化合約實例
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 你的帳戶地址
const account = 'YOUR_ACCOUNT_ADDRESS';

// 轉帳功能
async function transfer(to, value) {
    const tx = contract.methods.transfer(to, value);
    const gas = await tx.estimateGas({ from: account });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(account);

    const signedTx = await web3.eth.accounts.signTransaction(
        {
            to: contractAddress,
            data,
            gas,
            gasPrice,
            nonce,
            chainId: 1
        },
        'YOUR_PRIVATE_KEY'
    );

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction receipt:', receipt);
}

// 調用轉帳功能
transfer('RECIPIENT_ADDRESS', web3.utils.toWei('1', 'ether'));