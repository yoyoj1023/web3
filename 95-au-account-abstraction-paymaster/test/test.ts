import hre from "hardhat";
const { ethers } = hre;

const ACCOUNT_ADDRESS = "0x61c36a8d610163660E21a8b7359e1Cac0C9133e1";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS);
  const count = await account.count();
  console.log("count: ", count);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

