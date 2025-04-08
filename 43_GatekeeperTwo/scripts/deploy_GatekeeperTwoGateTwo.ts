import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const Contract = await ethers.getContractFactory("GatekeeperTwoGateTwo");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
      
    console.log("GatekeeperTwoGateTwo Contract deployed to: ", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });