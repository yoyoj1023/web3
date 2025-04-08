import hre from "hardhat";
const { ethers } = hre;

const CONTRACT_ADDRESS = "ADDR";

async function main() {
    const Contract = await ethers.getContractFactory("GatekeeperTwoGateTwoAttacker");
    const contract = await Contract.deploy(CONTRACT_ADDRESS);
    await contract.waitForDeployment();
      
    console.log("GatekeeperTwoGateTwoAttacker Contract deployed to: ", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });