import hre from "hardhat";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from '@ethersproject/strings';

const { ethers } = hre;

async function encodeFunctionSignature(name, argTypes) {
    let args = "";
    if (argTypes) {
        if (Array.isArray(argTypes)) {
            argTypes.forEach(element => {
                if (args.length > 0) {
                    args += ",";
                }
                args += element;
            });
        } else {
            args = argTypes;
        }
    }
    const sig = `${name}(${args})`;
    console.log("sig: ", sig);
    return keccak256(toUtf8Bytes(sig)).substring(0, 10);
}

async function deploy() {
    const Contract = await ethers.getContractFactory("SimpleContract");
    const contract = await Contract.deploy();
    await contract.waitForDeployment();
      
    console.log("SimpleContract deployed to: ", await contract.getAddress());
    return contract;
}

async function getContract() {
    const contract_address = "...";
    const contract = await ethers.getContractAt("Contract", contract_address);
}


async function main() {
    // ethers.getSigners()
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址: ", signer.address);

    // ethers.getContractAt()
    // ethers.provider.getStorage()
    const vault_address = "0x8144cE10a19c56219Eea1F7F1d07444dB6D82EE2";
    const vault = await ethers.getContractAt("Vault", vault_address);
    const storageSlot = 1;
    const password = await ethers.provider.getStorage(vault_address, storageSlot);
    console.log("Vault password: ", password);

    // ethers.parseEther()
    const value = ethers.parseEther("0.0012");
    console.log("value test: ", value);

    // encodeFunctionSignature()
    const functionSelector = await encodeFunctionSignature("pwn"); // 0xdd365b8b
    console.log("pwn() selector:", functionSelector);

    // AbiCoder.encode()
    const abiCoder = new ethers.AbiCoder();
    console.log("abiCoder.encode([\"string\"], [\"mySecret\"]: ", abiCoder.encode(["string"], ["mySecret"]));

    // import { keccak256 } from "@ethersproject/keccak256";
    const commitment = keccak256(abiCoder.encode(["string"], ["mySecret"]));
    console.log("commitment by @ethersproject/keccak256: ", commitment);

    // ethers.keccak256()
    console.log("keccak256 by ethers.keccak256(): ", ethers.keccak256(abiCoder.encode(["string"], ["mySecret"])));

    // solidity: event
    const contract = await deploy();
    // 監聽事件
    contract.on("GasRemaining", (gas) => {
        console.log(`📢 事件觸發: Gas 剩餘量 = ${gas.toString()}`);
    });

    // 呼叫 checkGas()
    let tx = await contract.checkGas();
    const receipt = await tx.wait();
    console.log("交易已確認: ", receipt);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });