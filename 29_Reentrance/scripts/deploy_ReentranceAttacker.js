import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const ReentranceAttacker = await ethers.getContractFactory("ReentranceAttacker");
    // 替換成 Reentrance 的合約實例地址
    const reentranceAttacker = await ReentranceAttacker.deploy("");
    await reentranceAttacker.waitForDeployment();
      
    console.log("ReentranceAttacker deployed to: ", await reentranceAttacker.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });