import hre from "hardhat";
const { ethers } = hre;


async function main() {
    const [signer0] = await ethers.getSigners();
    const signature = await signer0.signMessage(ethers.getBytes(ethers.id("wee")));

    const Test = await ethers.getContractFactory("Test");
    const test = await Test.deploy(signature);

    console.log("address0", await signer0.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});