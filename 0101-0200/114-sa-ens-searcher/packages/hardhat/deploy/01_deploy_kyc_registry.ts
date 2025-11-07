import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployWithAA } from "../utils/deployWithAA";

/**
 * Deploys a contract named "KYCRegistry" using a smart account associated to SIGNING_KEY, if provided,
 * or else a random signing key will be used
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
export const CONTRACT_NAME = "KYCRegistry";
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const factory = await hre.ethers.getContractFactory(CONTRACT_NAME);

  // use account abstraction to deploy the contract, with the gas sponsored for us!
  // KYCRegistry constructor doesn't require any arguments
  const kycRegistryAddress = await deployWithAA(factory, CONTRACT_NAME, hre, []);

  const kycRegistry = await hre.ethers.getContractAt(CONTRACT_NAME, kycRegistryAddress);
  console.log("🔐 KYCRegistry deployed successfully!");
  console.log("📋 Contract owner:", await kycRegistry.owner());
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags KYCRegistry
deployYourContract.tags = ["KYCRegistry"];
