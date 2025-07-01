import hre from "hardhat";
const { ethers } = hre;

const EP_ADDRESS = "0x5Db9BaCDde1476e10A70ddC7f7F2D50539b9Afc9";
const PM_ADDRESS = "0x346aBC10143689d4442ABE2D3eD31b6a8Dca92ff";

async function main() {
    const entryPoint = await hre.ethers.getContractAt("@account-abstraction/contracts/core/EntryPoint.sol:EntryPoint", EP_ADDRESS);

    console.log("depositTo PM_ADDRESS: ", PM_ADDRESS);
    await entryPoint.depositTo(PM_ADDRESS, {
        value: hre.ethers.parseEther(".1"),
    });

    console.log("deposit was successful!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

