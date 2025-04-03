import hre from "hardhat";
const { ethers } = hre;

// 替換成隱私合約的關卡實例地址
const privacy_address = "0x90F7A08218882619bb0D31cCBDc79fFF363184bD";

async function main() {

    const contract = await ethers.getContractAt("Privacy", privacy_address);

    console.log("get locked 變數: ", await contract.locked());
    // uint256 public ID = block.timestamp;
    console.log("get ID 變數: ", await contract.ID());

    // 每個 slot 原則上可以保存  32 個位元組 的資料
    // 儲存緊湊 (storage packing) Solidity 會嘗試將多個小型的變數儲存在同一個儲存槽中，以節省 Gas 費用。 

    // bool public locked = true;
    console.log("#0 storageSlot: ", await ethers.provider.getStorage(privacy_address, 0));
    
    // uint256 public ID = block.timestamp; 佔用 32 bytes
    console.log("#1 storageSlot: ", await ethers.provider.getStorage(privacy_address, 1));
    
    // uint8 private flattening = 10;
    // uint8 private denomination = 255;
    // uint16 private awkwardness = uint16(block.timestamp);
    console.log("#2 storageSlot: ", await ethers.provider.getStorage(privacy_address, 2));
    
    // data[0]
    console.log("#3 storageSlot: ", await ethers.provider.getStorage(privacy_address, 3));
    // date[1]
    console.log("#4 storageSlot: ", await ethers.provider.getStorage(privacy_address, 4));
    // data[2]
    console.log("#5 storageSlot: ", await ethers.provider.getStorage(privacy_address, 5));
    
    // 空
    console.log("#6 storageSlot: ", await ethers.provider.getStorage(privacy_address, 6));
    console.log("#7 storageSlot: ", await ethers.provider.getStorage(privacy_address, 7));
 
    const storageSlot = 5;
    const key32 = await ethers.provider.getStorage(privacy_address, storageSlot);
    // Solidity 採用右側填充0、與右側截斷的方式來處理資料
    const key16 = key32.slice(0, 16 * 2 + 2); // 16 bytes * 2 char + 2 char (0x)
    console.log("key16: ", key16);

    const tx = await contract.unlock(key16, { gasLimit: 1000000 });
    console.log("tx: ", tx);
    const receipt = await tx.wait();
    console.log("receipt: ", receipt);

    console.log("get locked 變數: ", await contract.locked());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });