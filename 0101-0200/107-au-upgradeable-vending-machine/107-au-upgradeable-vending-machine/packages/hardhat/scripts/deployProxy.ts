const { ethers, upgrades } = require('hardhat');

async function main() {
    // 從 ethers 獲取第一個 signer（使用配置的私鑰）
    const [signer] = await ethers.getSigners();
    console.log('Deploying with account:', signer.address);
    
    // 檢查餘額
    const balance = await ethers.provider.getBalance(signer.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    const VendingMachineV1 = await ethers.getContractFactory('VendingMachineV1', signer);
    
    // 讓網路自動估算 gas
    console.log('Deploying proxy contract...');
    const proxy = await upgrades.deployProxy(VendingMachineV1, [100]);
    await proxy.waitForDeployment();

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(
        proxy.target
    );

    console.log('Proxy contract address: ' + proxy.target);

    console.log('Implementation contract address: ' + implementationAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});