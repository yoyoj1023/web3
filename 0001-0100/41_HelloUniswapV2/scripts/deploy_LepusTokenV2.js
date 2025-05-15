import hre from "hardhat";
const { ethers } = hre;

async function main() {
    // 獲取合約工廠
    const LepusToken = await ethers.getContractFactory("LepusTokenV2");
    
    // 部署合約，不用在建構子設置初始供應量，目前硬編碼於合約內
    const lepusToken = await LepusToken.deploy();

    await lepusToken.waitForDeployment();

    console.log("LepusTokenV2 deployed to:", await lepusToken.getAddress());
    console.log("LepusTokenV2 TWD_TOTAL_SUPPLY = ", await lepusToken.TWD_TOTAL_SUPPLY());
    console.log("LepusTokenV2 DEPLOYMENT_TIMESTAMP = ", await lepusToken.DEPLOYMENT_TIMESTAMP());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });