import hre from "hardhat";

async function main() {
    const TelephoneCaller = await hre.ethers.getContractFactory("TelephoneCaller");
    // 替換成 Telephone 的合約實例地址
    const telephoneCaller = await TelephoneCaller.deploy("");
    await telephoneCaller.waitForDeployment();
    
    console.log("TelephoneCaller deployed to: ", await telephoneCaller.getAddress());
    // 須測試
    console.log("TelephoneCaller target: ", await telephoneCaller.target());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  