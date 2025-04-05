import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const Contract = await ethers.getContractFactory("GatekeeperOneGateTwo");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
      
    console.log("GatekeeperOneGateTwo Contract deployed to: ", await contract.getAddress());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });