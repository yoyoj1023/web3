import hre from "hardhat";
const { ethers } = hre;

// Change your target address
const MAGIC_NUM_ADDRESS = "0x6b1f3245eA9221580271787E2DF07EAbdE40F468";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址 : ", signer.address);

    const magicNum = await ethers.getContractAt("MagicNum", MAGIC_NUM_ADDRESS);
    console.log("MagicNum 關卡實例地址: ", magicNum.target);
    console.log("MagicNum solver : ", await magicNum.solver());

    const initOpcode = "600a600c600039600a6000f3"; 
    const runtimeOpcode = "602a60805260206080f3";       // 神秘數字是 42, 2a
    const bytecode = `0x${initOpcode}${runtimeOpcode}`;

    const abi = ["function whatIsTheMeaningOfLife() pure returns (uint)"];   // 是否必須要提供 ABI ?
    const byteFactory = new ethers.ContractFactory(abi, bytecode, signer);
    const byteContract = await byteFactory.deploy();
    await byteContract.waitForDeployment();

    // 進攻開始
    const tx = await magicNum.setSolver(byteContract.target);
    const receipt = await tx.wait();

    console.log("MagicNum solver: ", await magicNum.solver());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});