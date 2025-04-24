const hre = require("hardhat");

async function main() {
    // 獲取合約工廠
    const LepusToken = await hre.ethers.getContractFactory("LepusToken");
    
    // 部署合約，不用在建構子設置初始供應量，目前硬編碼於合約內
    const lepusToken = await LepusToken.deploy();

    await lepusToken.waitForDeployment();

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