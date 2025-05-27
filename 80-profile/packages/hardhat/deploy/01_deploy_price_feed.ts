import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * 部署 PriceFeed 合約的腳本
 *
 * @param hre HardhatRuntimeEnvironment
 */
const deployPriceFeed: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("PriceFeed", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const priceFeed = await hre.ethers.getContract<Contract>("PriceFeed", deployer);
  console.log("👋 PriceFeed contract deployed at:", priceFeed.target);
};

export default deployPriceFeed;

// 設定部署腳本的標籤和優先順序
deployPriceFeed.tags = ["PriceFeed"];
