import hre from "hardhat";
const { ethers } = hre;

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

async function main() {
    const entryPoint = await hre.ethers.getContractAt("@account-abstraction/contracts/core/EntryPoint.sol:EntryPoint", EP_ADDRESS);

    const sender = await ethers.getCreateAddress({
        from: FACTORY_ADDRESS,
        nonce: FACTORY_NONCE,
    });

    const [signer0] = await hre.ethers.getSigners();
    const address0 = await signer0.getAddress();
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

    const initCode = "0x";

    // const initCode = FACTORY_ADDRESS + AccountFactory.interface
    //     .encodeFunctionData("createAccount", [address0])
    //     .slice(2);

    console.log("sender: ", { sender });


    console.log("depositTo PM_ADDRESS: ", PM_ADDRESS);
    await entryPoint.depositTo(PM_ADDRESS, {
        value: hre.ethers.parseEther("100"),
    });
    
    const Account = await hre.ethers.getContractFactory("Account");
    const userOp = {
        sender,
        nonce: await entryPoint.getNonce(sender, 0),
        initCode,
        callData: Account.interface.encodeFunctionData("increment", []),
        callGasLimit: 400_000,
        verificationGasLimit: 600_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymasterAndData: PM_ADDRESS,
        signature: "0x",
    };

    const userOpHash = await entryPoint.getUserOpHash(userOp);
    console.log("userOpHash: ", userOpHash);
    userOp.signature = await signer0.signMessage(ethers.getBytes(userOpHash));

    const tx = await entryPoint.handleOps([userOp], signer0);
    const receipt = await tx.wait();
    console.log(receipt);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

