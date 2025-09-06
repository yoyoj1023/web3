import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a upgradeable contract named "VendingMachineV1" using OpenZeppelin upgrades
 * with initial soda count set to 100
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployVendingMachineProxy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network optimismSepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, upgrades } = hre;
  const { save } = deployments;

  console.log("🚀 Deploying VendingMachineV1 proxy with account:", deployer);

  // Get the contract factory
  const VendingMachineV1 = await hre.ethers.getContractFactory("VendingMachineV1");

  // Deploy the proxy contract
  console.log("📦 Deploying proxy contract...");
  const proxy = await upgrades.deployProxy(VendingMachineV1, [100], {
    initializer: "initialize",
  });
  
  await proxy.waitForDeployment();

  // Get proxy address as string
  const proxyAddress = await proxy.getAddress();

  // Get the implementation address
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("✅ VendingMachineV1 Proxy deployed to:", proxyAddress);
  console.log("🔧 Implementation contract deployed to:", implementationAddress);

  // Get the deployed contract to interact with it after deploying
  const vendingMachine = await hre.ethers.getContractAt("VendingMachineV1", proxyAddress);
  const sodaCount = await vendingMachine.numSodas();
  console.log("🥤 Initial soda count:", sodaCount.toString());

  // Save deployment info for hardhat-deploy (for generateTsAbis.ts)
  const artifact = await hre.artifacts.readArtifact("VendingMachineV1");
  await save("VendingMachineV1", {
    address: proxyAddress,
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    deployedBytecode: artifact.deployedBytecode,
    args: [100], // constructor arguments
  });

  // Save deployment info for frontend
  const deploymentInfo = {
    proxy: proxyAddress,
    implementation: implementationAddress,
    network: hre.network.name,
    deployer: deployer,
    timestamp: new Date().toISOString(),
  };

  console.log("📝 Deployment info:", deploymentInfo);
  console.log("💾 Saved deployment data for frontend generation");
};

export default deployVendingMachineProxy;

// Add id for hardhat-deploy to track execution
deployVendingMachineProxy.id = "deploy_vending_machine_proxy";

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags VendingMachine
deployVendingMachineProxy.tags = ["VendingMachine", "Proxy", "Upgradeable"]; 