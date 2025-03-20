import hre from "hardhat";

async function main() {
    const TelephoneCaller = await hre.ethers.getContractFactory("TelephoneCaller");
    // 替換成 Telephone 的合約實例地址
    const telephoneCaller = await TelephoneCaller.deploy("0x45Df81613D3339C624cAD76FcD9DA5436a3c7FcD");
    await telephoneCaller.waitForDeployment();
    
    console.log("TelephoneCaller deployed to: ", await telephoneCaller.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  