import hre from "hardhat";

async function main() {
    const CoinFlipAttack = await hre.ethers.getContractFactory("CoinFlipExtensions");
    // 替換成 CoinFlip 實例合約地址
    const coinFlipAttack = await CoinFlipAttack.deploy();
    await coinFlipAttack.waitForDeployment();

    console.log("CoinFlipExtensions deployed to:", await coinFlipAttack.getAddress());
  
} 

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
