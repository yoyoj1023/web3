import hre from "hardhat";
const { ethers, run, network } = hre;

async function main() {
    const subscriptionId = "YOUR_SUBSCRIPTION_ID"; // Replace with your subscription ID
    const RandomNumberConsumer = await ethers.getContractFactory("RandomNumberConsumer");
    const randomNumberConsumer = await RandomNumberConsumer.deploy(subscriptionId);
    await randomNumberConsumer.deployed();

    console.log("RandomNumberConsumer deployed to:", randomNumberConsumer.address);

    // Request a random number
    const requestId = await randomNumberConsumer.requestRandomNumber();
    console.log("Random number request sent with request ID:", requestId.toString());

    // Wait for the random number to be fulfilled
    console.log("Waiting for random number to be fulfilled...");
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds

    // Retrieve the random number
    const randomNumber = await randomNumberConsumer.getRandomNumber(requestId);
    console.log("Random number received:", randomNumber.toString());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });