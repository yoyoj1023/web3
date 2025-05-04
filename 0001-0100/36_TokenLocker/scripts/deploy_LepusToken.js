import hre from "hardhat";
const { ethers } = hre;

async function main() {
    // 獲取合約工廠
    const LepusToken = await ethers.getContractFactory("LepusToken");
    
    // 部署合約，不用在建構子設置初始供應量，目前硬編碼於合約內
    const lepusToken = await LepusToken.deploy();

    await lepusToken.waitForDeployment();

    // 0x76Ee828a2a3D69BDE22076F6d1A81DD35F5116a7
    console.log("LepusToken deployed to:", await lepusToken.getAddress());
    console.log("LepusToken TWD_TOTAL_SUPPLY = ", await lepusToken.TWD_TOTAL_SUPPLY());
    console.log("LepusToken DEPLOYMENT_TIMESTAMP = ", await lepusToken.DEPLOYMENT_TIMESTAMP());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });