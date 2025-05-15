import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await Factory.deploy(deployer.address); // 設定 feeToSetter
  await factory.waitForDeployment();

  // 合約地址: 0xd6e0DEc55f59DAa359bc9f3AD693F6920520c9Bb
  console.log("UniswapV2Factory deployed at:", factory.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});