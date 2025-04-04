import hre from "hardhat";
const { ethers } = hre;

async function main() {
    // 獲取合約工廠
    const TokenLocker = await ethers.getContractFactory("TokenLocker");
    const tokenLocker = await TokenLocker.deploy("0x76Ee828a2a3D69BDE22076F6d1A81DD35F5116a7");
    await tokenLocker.waitForDeployment();

    // 0xE8274512FFdc4e85B549ad57cAA568484f4370A6
    console.log("TokenLocker deployed to:", await tokenLocker.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });