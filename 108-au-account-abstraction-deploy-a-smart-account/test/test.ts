import hre from "hardhat";
const { ethers } = hre;

const ACCOUNT_ADDRESS = "0xd6af3466e5a0dbc3797a7894720f92cd5f96835d";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS);
  const count = await account.count();
  console.log("count: ", count);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

