import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const ReentranceAttacker = await ethers.getContractFactory("ReentranceAttacker");
    // 替換成 Reentrance 的合約實例地址
    console.log("Reentrance 實例 deployed to: ", "0x85b96E2122c01C1C3ba0BfB9838cc3523D4176d1");
    const reentranceAttacker = await ReentranceAttacker.deploy("0x85b96E2122c01C1C3ba0BfB9838cc3523D4176d1");
    await reentranceAttacker.waitForDeployment();
      
    console.log("ReentranceAttacker deployed to: ", await reentranceAttacker.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });