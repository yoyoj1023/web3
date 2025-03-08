// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 導入 OpenZeppelin 的 ERC20 合約
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FirstToken_IsERC20 is ERC20 {
    // 建構函數，初始化代幣名稱、符號和初始供應量
    constructor(uint256 initialSupply) ERC20("FirstToken", "FT") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}