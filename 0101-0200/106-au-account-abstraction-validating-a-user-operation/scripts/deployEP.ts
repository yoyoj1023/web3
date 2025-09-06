import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const ep = await ethers.getContractFactory("EntryPoint");
    const epInstance = await ep.deploy();
    await epInstance.waitForDeployment();

    console.log("EntryPoint 實例地址 : ", epInstance.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

