// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 警告！此合約僅供簡易設計邏輯參考，並未考慮安全性(如重入攻擊等)，請勿直接使用
contract SimpleLending {
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;
    uint256 public interestRate = 5; // 5% 利息

    function deposit() public payable {
        deposits[msg.sender] += msg.value;
    }

    function borrow(uint256 amount) public {
        require(deposits[msg.sender] >= amount, "Insufficient deposit");
        borrows[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
    }

    function calculateInterest(address user) public view returns (uint256) {
        return borrows[user] * interestRate / 100;
    }

    function repay() public payable {
        uint256 interest = calculateInterest(msg.sender);
        uint256 totalRepayment = borrows[msg.sender] + interest;
        require(msg.value >= totalRepayment, "Insufficient repayment");
        borrows[msg.sender] = 0;
        // 退還多餘的款項
        if (msg.value > totalRepayment) {
            payable(msg.sender).transfer(msg.value - totalRepayment);
        }
    }
}