import hre from "hardhat";
const { ethers } = hre;

const FACTORY_NONCE = 1;
const FACTORY_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const EP_ADDRESS = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
const PM_ADDRESS = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";

async function main() {
    const entryPoint = await hre.ethers.getContractAt("@account-abstraction/contracts/core/EntryPoint.sol:EntryPoint", EP_ADDRESS);

    const sender = await ethers.getCreateAddress({
        from: FACTORY_ADDRESS,
        nonce: FACTORY_NONCE,
    });

    const [signer0] = await hre.ethers.getSigners();
    const address0 = await signer0.getAddress();
    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");

    // const initCode = "0x";
    
    const initCode = FACTORY_ADDRESS + AccountFactory.interface
        .encodeFunctionData("createAccount", [address0])
        .slice(2);
    
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
        callGasLimit: 200_000,
        verificationGasLimit: 200_000,
        preVerificationGas: 50_000,
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymasterAndData: PM_ADDRESS,
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

