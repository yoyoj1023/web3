// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenLocker {
    // 定義 ERC20 代幣合約接口
    IERC20 public token;

    // 記錄每個用戶的代幣餘額
    mapping(address => uint256) public balances;

    // 記錄每個用戶最後一次存入的時間
    mapping(address => uint256) public depositTimes;

    // 鎖定時間設為 1 分鐘（以秒為單位）
    uint256 public constant LOCK_TIME = 1 minutes;

    // 構造函數，初始化 ERC20 代幣地址
    constructor(address _token) {
        token = IERC20(_token);
    }

    // 用戶存入代幣的函數
    function deposit(uint256 amount) external {
        // 確保存入金額大於 0
        require(amount > 0, "Amount must be greater than 0");

        // 從用戶地址轉移代幣到合約地址
        token.transferFrom(msg.sender, address(this), amount);

        // 更新用戶餘額
        balances[msg.sender] += amount;

        // 記錄存入時間
        depositTimes[msg.sender] = block.timestamp;
    }

    // 用戶提取代幣的函數
    function withdraw() external {
        // 確保用戶有餘額可提取
        require(balances[msg.sender] > 0, "No balance to withdraw");

        // 檢查是否已過鎖定時間
        require(block.timestamp >= depositTimes[msg.sender] + LOCK_TIME, "Tokens are still locked");

        // 獲取用戶的全部餘額
        uint256 amount = balances[msg.sender];

        // 清空用戶餘額
        balances[msg.sender] = 0;

        // 將代幣轉回用戶地址
        token.transfer(msg.sender, amount);
    }
}