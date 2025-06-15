import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const af = await ethers.getContractFactory("AccountFactory");
    const afInstance = await af.deploy();
    await afInstance.waitForDeployment();

    console.log("AccountFactory 實例地址 : ", afInstance.target);

    const ep = await ethers.getContractFactory("@account-abstraction/contracts/core/EntryPoint.sol:EntryPoint");
    const epInstance = await ep.deploy();
    await epInstance.waitForDeployment();

    console.log("EntryPoint 實例地址 : ", epInstance.target);

    const pm = await ethers.getContractFactory("Paymaster");
    const pmInstance = await pm.deploy();
    await pmInstance.waitForDeployment();

    console.log("Paymaster 實例地址 : ", pmInstance.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

