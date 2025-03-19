import hre from "hardhat";

async function main() {
    const CoinFlipAttack = await hre.ethers.getContractFactory("CoinFlipAttacker");
    // 替換成 CoinFlip 實例合約地址
    const coinFlipAttack = await CoinFlipAttack.deploy("0x6e944eE85EE41F35D8Adcc7B7a3DE07bEb2f6dF1");
    await coinFlipAttack.waitForDeployment();

    console.log("CoinFlipAttacker deployed to:", await coinFlipAttack.getAddress());
  
} 

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
