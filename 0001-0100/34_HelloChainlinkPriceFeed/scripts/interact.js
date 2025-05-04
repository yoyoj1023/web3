import hre from "hardhat";
const { ethers } = hre;

async function deploy() {
    const Contract = await ethers.getContractFactory("BTCPriceConsumer");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
      
    console.log("SimpleContract deployed to: ", await contract.getAddress());
    return contract;
}

async function main() {

    const contract = await deploy();
    console.log("getLatestPrice: ", await contract.getLatestPrice());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });