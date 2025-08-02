import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const af = await ethers.getContractFactory("AccountFactory");
    const afInstance = await af.deploy();
    await afInstance.waitForDeployment();

    console.log("AccountFactory 實例地址 : ", afInstance.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

