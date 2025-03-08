// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FirstToken {
    // 代幣的基本資訊
    string public name = "FirstToken";       // 代幣名稱
    string public symbol = "FT";             // 代幣符號
    uint8 public decimals = 18;              // 小數位數，18 是標準值
    uint256 public totalSupply;              // 總供應量

    // 儲存每個地址的餘額
    mapping(address => uint256) public balanceOf;
    // 儲存授權資訊：某地址允許另一地址使用的代幣數量
    mapping(address => mapping(address => uint256)) public allowance;

    // 事件：用來記錄區塊鏈上的重要操作，方便前端監聽
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // 建構函數：在部署合約時初始化代幣
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** decimals; // 總供應量考慮小數位數
        balanceOf[msg.sender] = totalSupply;          // 初始代幣全部分配給部署者
    }

    // 轉帳功能
    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "Cannot transfer to zero address"); // 檢查目標地址
        require(balanceOf[msg.sender] >= value, "Insufficient balance"); // 檢查餘額

        balanceOf[msg.sender] -= value;  // 減少發送者的餘額
        balanceOf[to] += value;          // 增加接收者的餘額
        emit Transfer(msg.sender, to, value); // 觸發轉帳事件
        return true;                     // 返回成功
    }

    // 批准他人代表你花費代幣
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value; // 設置授權金額
        emit Approval(msg.sender, spender, value); // 觸發授權事件
        return true;
    }

    // 從某地址轉帳（需先被授權）
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(to != address(0), "Cannot transfer to zero address"); // 檢查目標地址
        require(balanceOf[from] >= value, "Insufficient balance");    // 檢查餘額
        require(allowance[from][msg.sender] >= value, "Insufficient allowance"); // 檢查授權金額

        balanceOf[from] -= value;           // 減少發送者的餘額
        balanceOf[to] += value;             // 增加接收者的餘額
        allowance[from][msg.sender] -= value; // 減少授權金額
        emit Transfer(from, to, value);     // 觸發轉帳事件
        return true;
    }
}