import hre from "hardhat";
const { ethers } = hre;

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
    const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

    const sender = await ethers.getCreateAddress({
        from: FACTORY_ADDRESS,
        nonce: FACTORY_NONCE,
    });

    const [signer0] = await hre.ethers.getSigners();
    const address0 = await signer0.getAddress();
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

    const initCode = "0x";
    /*
    const initCode = FACTORY_ADDRESS + AccountFactory.interface
        .encodeFunctionData("createAccount", [address0])
        .slice(2);
    */
    console.log("sender: ", sender);

    /*
    await entryPoint.depositTo(sender, {
        value: hre.ethers.parseEther("100"),
    });
    */
    
    const Account = await hre.ethers.getContractFactory("Account");
    const userOp = {
        sender,
        nonce: await entryPoint.getNonce(sender, 0),
        initCode,
        callData: Account.interface.encodeFunctionData("increment", []),
        callGasLimit: 200_000,
        verificationGasLimit: 200_000,
        preVerificationGas: 50_000,
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymasterAndData: "0x",
        signature: "0x",
    };

    const tx = await entryPoint.handleOps([userOp], signer0);
    const receipt = await tx.wait();
    console.log(receipt);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

