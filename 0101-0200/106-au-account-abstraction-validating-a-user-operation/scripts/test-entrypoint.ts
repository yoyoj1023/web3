import hre from "hardhat";
const { ethers } = hre;

const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // EntryPoint 地址

async function main() {
    try {
        console.log("連接到 SimpleEntryPoint 合約...");
        
        const entryPoint = await hre.ethers.getContractAt("SimpleEntryPoint", EP_ADDRESS);
        
        console.log("合約地址:", entryPoint.target);
        
        // 檢查合約是否有代碼
        const code = await hre.ethers.provider.getCode(EP_ADDRESS);
        console.log("合約代碼長度:", code.length);
        if (code === "0x") {
            console.error("❌ 合約地址沒有代碼！");
            return;
        }
        
        console.log("✅ 合約已正確部署！");
        
        // 嘗試調用一個簡單的函數
        console.log("嘗試獲取測試地址的 nonce...");
        const testAddress = "0x0000000000000000000000000000000000000001";
        const nonce = await entryPoint.getNonce(testAddress, 0);
        console.log("✅ getNonce 成功! nonce:", nonce.toString());
        
    } catch (error) {
        console.error("❌ 測試失敗:", error);
        console.error("錯誤詳情:", error instanceof Error ? error.message : String(error));
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 