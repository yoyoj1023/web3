import hre from "hardhat";
const { ethers } = hre;

async function main() {
    const [deployer] = await ethers.getSigners();

    // 假設你已經部署好的 Token 合約地址
    const tokenAAddress = "0x76Ee828a2a3D69BDE22076F6d1A81DD35F5116a7"; // 替換成你自己的地址
    const tokenBAddress = "0xa69d9914d93596219aF55A4A56Fb3135A26876B7";

    // 取得已經部署的 Factory
    const factoryAddress = "0xd6e0DEc55f59DAa359bc9f3AD693F6920520c9Bb"; // 替換成你已部署的 factory 地址
    const factory = await ethers.getContractAt("UniswapV2Factory", factoryAddress);

    // 取得交易對地址
    const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
    console.log("Pair address:", pairAddress);
    const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

    // 驗證 token0 / token1
    const token0 = await pair.token0();
    const token1 = await pair.token1();

    console.log("Token0:", token0);
    console.log("Token1:", token1);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
