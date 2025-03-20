import hre from "hardhat";

const telephone_address = "";
const telephone_caller_address = "";

const [signer] = await hre.ethers.getSigner();
console.log("我的帳戶地址: ", signer.address);

const telephone = await hre.ethers.getContractAt("Telephone", telephone_address);
const telephone_caller = await hre.ethers.getContractAt("TelephoneCaller", telephone_caller_address);

async function main() {
    console.log("telephone owner: ", await telephone.owner());
    
    const tx = await telephone_caller.callTelephone();
    await tx.wait();

    console.log("telephone owner: ", await telephone.owner());
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});