import hre from "hardhat";
const { ethers } = hre;

// 替換成隱私合約的關卡實例地址
const privacy_address = "0x...";

async function main() {

    const contract = await ethers.getContractAt("Privacy", privacy_address);

    console.log("get locked 變數: ", await contract.locked());
    // uint256 public ID = block.timestamp;
    console.log("get ID 變數: ", await contract.ID());

    console.log("#0 storageSlot: ", await ethers.provider.getStorage(privacy_address, 0));
    console.log("#1 storageSlot: ", await ethers.provider.getStorage(privacy_address, 1));
    console.log("#2 storageSlot: ", await ethers.provider.getStorage(privacy_address, 2));
    console.log("#3 storageSlot: ", await ethers.provider.getStorage(privacy_address, 3));
    console.log("#4 storageSlot: ", await ethers.provider.getStorage(privacy_address, 4));

    console.log("#5 storageSlot: ", await ethers.provider.getStorage(privacy_address, 5));
    console.log("#6 storageSlot: ", await ethers.provider.getStorage(privacy_address, 6));
    console.log("#7 storageSlot: ", await ethers.provider.getStorage(privacy_address, 7));

    // 每個 slot 原則上可以保存  32 個位元組 的資料
    // 儲存緊湊 (storage packing) Solidity 會嘗試將多個小型的變數儲存在同一個儲存槽中，以節省 Gas 費用。 
    // 這就是為什麼 bool、uint8 和 uint16 這些變數會被儲存在同一個儲存槽中。 
    const storageSlot = 5;

    // ...
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });