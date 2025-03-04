// filepath: /c:/Users/IEC140057/VScodeProjects/web3/04_FirstToken/scripts/deploy.js
const hre = require("hardhat");

async function main() {
    // 獲取合約工廠
    const FirstToken = await hre.ethers.getContractFactory("FirstToken");
    
    // 部署合約，並設置初始供應量，例如 1000
    const initialSupply = 1000;
    const firstToken = await FirstToken.deploy(initialSupply);

    await firstToken.waitForDeployment();

    console.log("FirstToken deployed to:", firstToken.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });