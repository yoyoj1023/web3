import hre from "hardhat";
const { ethers } = hre;

const FACTORY_ADDRESS = "0x2a1E6cBeFf1eBEcD518CaF120f90C499Dee9bb91";
const EP_ADDRESS = "0x2A0B5113Ce3F4986D8A8BfEFCA74D75E137b7946";
const PM_ADDRESS = "0xCfE31528B70A2b178d0EAaC42Ed52869648FC100";

async function main() {
    const entryPoint = await hre.ethers.getContractAt("@account-abstraction/contracts/core/EntryPoint.sol:EntryPoint", EP_ADDRESS);

    const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
    const [signer0] = await hre.ethers.getSigners();
    const address0 = await signer0.getAddress();

    let initCode = FACTORY_ADDRESS + AccountFactory.interface
        .encodeFunctionData("createAccount", [address0])
        .slice(2);

    let sender;

    try {
        await entryPoint.getSenderAddress(initCode);
    } catch (ex: any) {
        console.log("ex: ", ex.data);
        sender = "0x" + ex.data.slice(-40);
    }

    if (!sender) {
        throw new Error("Failed to get sender address");
    }

    const code = await ethers.provider.getCode(sender);
    
    if (code !== "0x") {
        initCode = "0x";
    } else {
        console.log("code: ", code);
    }

    console.log("sender: ", sender);

    const Account = await hre.ethers.getContractFactory("Account");
    const userOp = {
        sender,
        nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
        initCode,
        callData: Account.interface.encodeFunctionData("increment", []),
        callGasLimit: "0x" + (400_000).toString(16),
        verificationGasLimit: "0x" + (600_000).toString(16),
        preVerificationGas: "0x" + (100_000).toString(16),
        maxFeePerGas: "0x" + hre.ethers.parseUnits("10", "gwei").toString(16),
        maxPriorityFeePerGas: "0x" + hre.ethers.parseUnits("5", "gwei").toString(16),
        paymasterAndData: PM_ADDRESS,
        signature: "0xffffffffffffffffffffffff000000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
    };

    const { preVerificationGas, verificationGasLimit, callGasLimit } = await ethers.provider.send(
        "eth_estimateUserOperationGas", 
        [userOp, EP_ADDRESS,]
    );

    userOp.preVerificationGas = preVerificationGas;
    userOp.verificationGasLimit = verificationGasLimit;
    userOp.callGasLimit = callGasLimit;

    const { maxFeePerGas } = await ethers.provider.getFeeData();
    console.log("maxFeePerGas: ", maxFeePerGas);
    userOp.maxFeePerGas = "0x" + maxFeePerGas!.toString(16);

    const maxPriorityFeePerGas = await ethers.provider.send("runder_maxPriorityFeePerGas");
    userOp.maxPriorityFeePerGas = "0x" + maxPriorityFeePerGas.toString(16);

    const userOpHash = await entryPoint.getUserOpHash(userOp);
    console.log("userOpHash: ", userOpHash);
    userOp.signature = await signer0.signMessage(ethers.getBytes(userOpHash));

    const opHash = await ethers.provider.send("eth_sendUserOperation", [userOp, EP_ADDRESS]);
    console.log("opHash: ", opHash);

    // const tx = await entryPoint.handleOps([userOp], signer0);
    // const receipt = await tx.wait();
    // console.log(receipt);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

